'use strict';
// KOReader progress sync (the "kosync" protocol of KOReader's Progress sync plugin), for EPUB and PDF.
// Off until the owner enters a sync server; the Windows and Android apps make the HTTPS request, the page
// never contacts the server itself. Only the account name and KOReader's MD5 key of the password are
// kept, sealed in this library's settings; the password itself is never stored. A book is identified the
// way KOReader does by default ("binary"): MD5 of 1 KiB samples at 0, 1 KiB, 4 KiB, 16 KiB … 1 GiB.
// On opening a book: if another device is further along and newer, offer to jump there. Positions are
// sent after saves (at most every 10 s while reading, at once when the book closes). No polling. A position
// behind the one offered is not sent until the reader moves past it or jumps, so nothing goes backward unasked.
const ThingsKosync = (() => {
  const SAMPLE = 1024, HEX32 = /^[a-f0-9]{32}$/, DEVICE_ID = /^[A-Za-z0-9-]{1,64}$/, DEFAULT_SERVER = 'https://sync.koreader.rocks';

  // MD5 (RFC 1321), only for KOReader compatibility: never used to protect anything.
  const K = Array.from({length: 64}, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);
  const R = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  function md5(input) {
    const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
    const length = ((bytes.length + 8 >> 6) + 1) << 6, data = new Uint8Array(length), view = new DataView(data.buffer);
    data.set(bytes); data[bytes.length] = 0x80;
    view.setUint32(length - 8, (bytes.length * 8) >>> 0, true); view.setUint32(length - 4, Math.floor(bytes.length / 2 ** 29), true);
    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    for (let block = 0; block < length; block += 64) {
      let a = a0, b = b0, c = c0, d = d0;
      for (let i = 0; i < 64; i++) {
        let f, g;
        if (i < 16) { f = (b & c) | (~b & d); g = i; } else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
        else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; } else { f = c ^ (b | ~d); g = (7 * i) % 16; }
        const sum = (a + f + K[i] + view.getUint32(block + g * 4, true)) >>> 0;
        a = d; d = c; c = b; b = (b + ((sum << R[i]) | (sum >>> (32 - R[i])))) >>> 0;
      }
      a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
    }
    const out = new DataView(new ArrayBuffer(16)); [a0, b0, c0, d0].forEach((v, i) => out.setUint32(i * 4, v, true));
    return [...new Uint8Array(out.buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const userKey = password => md5(String(password));
  // A source is {size, read(begin, end)} (like ThingsFingerprint) or a Blob.
  async function documentId(source) {
    const size = Number(source?.size), read = typeof source?.read === 'function' ? (b, e) => source.read(b, e) : (b, e) => source.slice(b, e).arrayBuffer();
    if (!Number.isSafeInteger(size) || size < 0) throw new Error('KOReader sync needs the file size.');
    const parts = [];
    for (let i = -1; i <= 10; i++) {
      const begin = i < 0 ? 0 : SAMPLE * 4 ** i; if (begin >= size) break;
      const value = await read(begin, Math.min(size, begin + SAMPLE)); parts.push(value instanceof Uint8Array ? value : new Uint8Array(value));
    }
    const all = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let at = 0; for (const p of parts) { all.set(p, at); at += p.length; }
    return md5(all);
  }
  function server(value) {
    try { const u = new URL(String(value || '').trim()); if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash || u.href.length > 500) return null; return u.href.replace(/\/+$/, ''); } catch { return null; }
  }
  // What this device sends: KOReader's page number for PDF, its chapter XPointer for EPUB.
  function payload(format, progress, document, settings) {
    const percent = Math.max(0, Math.min(100, Number(progress?.percent) || 0)), location = Math.max(0, Math.floor(Number(progress?.location) || 0));
    return {document, progress: format === 'PDF' ? String(location + 1) : `/body/DocFragment[${location + 1}]`, percentage: Math.round(percent * 100) / 10000, device: settings.device, device_id: settings.deviceId};
  }
  // Where to go when another device is further along and more recent; null when staying put.
  function decide(format, local, remote, deviceId, count) {
    if (!remote || !HEX32.test(remote.document || '') || remote.device_id === deviceId) return null;
    // Servers that leave out the time are compared by percentage alone, as KOReader's own client does.
    const percent = Number(remote.percentage) * 100, when = remote.timestamp == null ? NaN : Number(remote.timestamp) * 1000;
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) return null;
    if (percent <= (Number(local?.percent) || 0) + 0.5 || (Number.isFinite(when) && when <= (Number(local?.updated) || 0))) return null;
    const max = Math.max(0, (Number(count) || 1) - 1), text = String(remote.progress || '');
    const page = format === 'PDF' && /^\d{1,7}$/.test(text) ? Number(text) - 1 : null, fragment = format === 'EPUB' && /^\/body\/DocFragment\[(\d{1,6})\]/.exec(text);
    const location = Math.min(max, page ?? (fragment ? Number(fragment[1]) - 1 : Math.floor(percent / 100 * (max + 1))));
    return {location: Math.max(0, location), percent, device: String(remote.device || 'another device').slice(0, 60)};
  }

  if (typeof document === 'undefined') return {md5, userKey, documentId, server, payload, decide, DEFAULT_SERVER};

  // In the app.
  const pending = new Map(); let settingsCache, current = null, timer = null;
  function send(value) {
    if (window.ThingsBookDesktop?.kosync) return window.ThingsBookDesktop.kosync(value).then(r => { if (r?.error) throw new Error(r.error); return r?.value || {}; });
    if (!window.ThingsBookAndroid?.kosyncRequest) return Promise.reject(new Error('Use the Windows or Android app to sync with KOReader.'));
    return new Promise((resolve, reject) => { const id = crypto.randomUUID(), wait = setTimeout(() => { pending.delete(id); reject(new Error('The sync server did not answer.')); }, 30000); pending.set(id, {resolve, reject, wait}); window.ThingsBookAndroid.kosyncRequest(id, JSON.stringify(value)); });
  }
  function receive(id, text) { const p = pending.get(id); if (!p) return; pending.delete(id); clearTimeout(p.wait); try { const r = JSON.parse(text); if (r.error) p.reject(new Error(r.error)); else p.resolve(r.value || {}); } catch { p.reject(new Error('Invalid sync response.')); } }
  const request = (action, s, extra = {}) => send({action, server: s.server, user: s.user, key: s.key, ...extra});
  async function settings() {
    if (!key || !db) return null; if (settingsCache?.key === key) return settingsCache.value;
    let value = null; try { const record = await new Promise((resolve, reject) => { const r = db.transaction('settings').objectStore('settings').get('kosync'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); if (record) value = await readJSON(record); } catch { value = null; }
    settingsCache = {key, value}; return value;
  }
  async function store(value) { const record = value ? await sealJSON(value) : null; await transaction(['settings'], tx => value ? tx.objectStore('settings').put(record, 'kosync') : tx.objectStore('settings').delete('kosync')); settingsCache = {key, value}; }

  function push() {
    clearTimeout(timer); timer = null; const c = current; if (!c?.waiting || !c.ready || (Number(c.progress?.percent) || 0) < c.floor) return; c.waiting = false; c.lastPush = Date.now();
    request('put', c.settings, payload(c.format, c.progress, c.document, c.settings)).catch(() => {});
  }
  // A book was opened in the reader (fire and forget: sync never blocks reading).
  async function opened(book, source) {
    push(); current = null; offerButton?.remove();
    try {
      const s = await settings(); if (!s || !['EPUB', 'PDF'].includes(book.format) || !source) return;
      const c = {bookId: book.id, format: book.format, settings: s, document: await documentId(source), progress: book.progress, waiting: false, lastPush: 0, ready: false, floor: 0};
      current = c;
      try {
        const remote = await request('get', s, {document: c.document}), context = ThingsReader.context();
        if (current !== c || context?.id !== c.bookId) return;
        // The book's position as saved before this opening: opening refreshes the reader's own copy to now.
        const target = decide(c.format, book.progress, remote, s.deviceId, context.count);
        if (target) { c.floor = target.percent; offer(c, target); }
      } finally { if (current === c) { c.ready = true; push(); } }
    } catch {}
  }
  let offerButton = null;
  function offer(c, target) {
    offerButton = el('button', 'secondary', `Go to ${Math.round(target.percent)}% (from ${target.device})`); offerButton.type = 'button';
    offerButton.onclick = async () => { offerButton.remove(); c.floor = 0; if (current === c && ThingsReader.context()?.id === c.bookId) await ThingsReader.jump(target.location); };
    document.getElementById('reader-save-status')?.after(offerButton);
  }
  // The reader saved a position (after updateBook succeeded).
  function saved(id, book) {
    const c = current; if (!c || c.bookId !== id || !book?.progress) return;
    c.progress = book.progress; c.waiting = true;
    if (!ThingsReader.active() || Date.now() - c.lastPush > 10000) return push();
    if (!timer) timer = setTimeout(push, 10000 - (Date.now() - c.lastPush));
  }
  function closed() { push(); current = null; offerButton?.remove(); }
  function clear() { closed(); settingsCache = null; }

  const dialog = el('dialog', 'sanctuary-dialog discovery-dialog'); dialog.id = 'kosync-dialog';
  const heading = el('div', 'dialog-heading'), close = el('button', 'secondary', 'Close'); close.type = 'button'; close.onclick = () => dialog.close(); heading.append(el('h2', '', 'KOReader sync'), close);
  const help = el('p', 'fine', 'Share reading positions of EPUB and PDF books with KOReader through a Progress sync server (KOReader: Tools › Progress sync). Only the book\'s KOReader ID, the page or chapter and the percentage are sent; books and notes stay on this device. The password is not stored.');
  const form = el('form', 'provider-login'), fields = {}, status = el('p', 'fine');
  for (const [name, label, type, auto] of [['server', 'Sync server (https)', 'url', 'url'], ['user', 'Username', 'text', 'username'], ['password', 'Password', 'password', 'current-password'], ['device', 'This device\'s name', 'text', 'off']]) { const input = el('input'); input.type = type; input.maxLength = name === 'server' ? 500 : 100; input.autocomplete = auto; input.placeholder = label; input.setAttribute('aria-label', label); fields[name] = input; form.append(input); }
  const save = el('button', 'primary', 'Save and check'), off = el('button', 'secondary', 'Turn off'); off.type = 'button'; form.append(save, off);
  dialog.append(heading, help, form, status); document.body.append(dialog);
  form.onsubmit = async e => {
    e.preventDefault(); const address = server(fields.server.value), user = fields.user.value.trim();
    if (!address) { status.textContent = 'Enter the server\'s https address.'; return; }
    if (!user || /[\u0000-\u001f]/.test(user) || !fields.password.value) { status.textContent = 'Enter the username and password of your sync account.'; return; }
    const old = await settings(), value = {server: address, user, key: userKey(fields.password.value), device: fields.device.value.trim().slice(0, 100) || 'ThingsBook', deviceId: old?.deviceId || crypto.randomUUID().replace(/-/g, '')};
    fields.password.value = ''; save.disabled = true; status.textContent = 'Checking your account…';
    try { await request('auth', value); await store(value); status.textContent = 'Saved. Positions sync the next time you open a book.'; }
    catch (error) { status.textContent = error.message || 'Could not reach the sync server.'; } finally { save.disabled = false; }
  };
  off.onclick = async () => { try { await store(null); current = null; status.textContent = 'KOReader sync is off.'; } catch { status.textContent = 'Could not change this setting.'; } };
  const open = el('button', 'nav-item', 'KOReader sync'); open.type = 'button';
  open.onclick = async () => { if (!key) return; const s = await settings(); fields.server.value = s?.server || DEFAULT_SERVER; fields.user.value = s?.user || ''; fields.password.value = ''; fields.device.value = s?.device || 'ThingsBook'; status.textContent = s ? `On for ${s.user}.` : 'Off.'; dialog.showModal(); };
  document.getElementById('reading-filter')?.after(open);
  return {md5, userKey, documentId, server, payload, decide, receive, opened, saved, closed, clear};
})();
if (typeof window !== 'undefined') window.ThingsKosync = ThingsKosync;
if (typeof module === 'object' && module.exports) module.exports = ThingsKosync;
