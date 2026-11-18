// KOReader sync in real Chromium with a stand-in for the Android bridge: saving the account checks it
// first and keeps no password, opening a PDF asks for its KOReader ID, a newer position from another
// device is offered and jumping goes there, and reading on sends the new page. Off means no requests.
'use strict';
let chromium; try { ({chromium} = require('playwright')); } catch { console.log('SKIP: Playwright is not installed.'); process.exit(0); }
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {serve, syntheticPdf, cleanup} = require('./browser-helpers.cjs');
const app = path.resolve(process.argv[2] || path.join(__dirname, '../../outputs/ThingsBook'));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-kosync-'));
const koreaderId = buffer => { const hash = crypto.createHash('md5'); for (let i = -1; i <= 10; i++) { const at = i < 0 ? 0 : 1024 * 4 ** i; if (at >= buffer.length) break; hash.update(buffer.subarray(at, at + 1024)); } return hash.digest('hex'); };
async function until(page, check, arg, timeout = 20000) { const end = Date.now() + timeout; for (;;) { const value = await page.evaluate(check, arg); if (value) return value; if (Date.now() > end) throw new Error(`Timed out waiting for: ${check}`); await new Promise(r => setTimeout(r, 100)); } }

async function main() {
  await serve(app);
  const context = await chromium.launchPersistentContext(profile, {headless:true});
  const page = context.pages()[0] || await context.newPage();
  page.on('dialog', d => d.accept());
  const errors = []; page.on('pageerror', e => errors.push(`${e.name}: ${e.message}`));
  await page.goto('http://127.0.0.1:8765/');
  await page.waitForFunction(() => typeof db !== 'undefined' && !!db, null, {timeout:20000});
  await page.evaluate(() => { $('password').value = $('confirm-password').value = 'Kosync test password 1'; return unlock({preventDefault(){}}); });
  await page.waitForFunction(() => !!key);
  const pdf = syntheticPdf(12, 64 * 1024);
  await page.setInputFiles('#book-files', {name:'Tide Atlas.pdf', mimeType:'application/octet-stream', buffer:pdf});
  await page.evaluate(() => upload({preventDefault(){}}));
  const id = await until(page, () => books[0]?.id);
  // Stand-in for the Android bridge (the reply comes back through ThingsKosync.receive, as from Java):
  // records each request. syncServer.get decides the reply to a lookup: a position object, 'error', or
  // nothing; syncServer.delay is how long the server takes.
  await page.evaluate(() => { window.syncCalls = []; window.syncServer = {get:null, delay:20}; window.ThingsBookAndroid = {kosyncRequest(id, json) { const value = JSON.parse(json); syncCalls.push(value); const answer = value.action !== 'get' ? {value:{}} : syncServer.get === 'error' ? {error:'The sync server could not save or read this position.'} : {value:syncServer.get ? {...(syncServer.noDocument ? {} : {document:value.document}), ...syncServer.get} : {}}; setTimeout(() => ThingsKosync.receive(id, JSON.stringify(answer)), syncServer.delay); }}; });
  const reopen = async () => { await page.evaluate(() => syncCalls.length = 0); await page.evaluate(id => readBook(id), id); await until(page, () => ThingsReader.context()?.pdf && !ThingsReader.context().loading); };
  const close = () => page.evaluate(() => { $('reader-dialog').close(); return closeReader(); });
  const offerInPage = () => [...document.querySelectorAll('button')].find(b => /from Kobo/.test(b.textContent))?.textContent || null;
  const offerText = () => page.evaluate(offerInPage);

  // Off: opening a book makes no request.
  await page.evaluate(id => readBook(id), id);
  await until(page, () => ThingsReader.context()?.pdf && !ThingsReader.context().loading);
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => syncCalls.length), 0, 'no requests while sync is off');
  await close();
  // This device's saved position is from now; the Kobo's (below) is a little newer, and older than the next opening.
  const savedAt = await page.evaluate(id => books.find(b => b.id === id).progress.updated, id);
  await page.waitForTimeout(1200);

  // Turn it on through the dialog.
  await page.evaluate(() => [...document.querySelectorAll('button.nav-item')].find(b => b.textContent === 'KOReader sync').click());
  await until(page, () => document.getElementById('kosync-dialog').open);
  await page.fill('#kosync-dialog input[type=url]', 'https://sync.example.org/');
  await page.fill('#kosync-dialog input[autocomplete=username]', 'reader');
  await page.fill('#kosync-dialog input[type=password]', 'secret');
  await page.click('#kosync-dialog button.primary');
  await until(page, () => /Saved/.test(document.querySelector('#kosync-dialog p.fine:last-child').textContent));
  const auth = await page.evaluate(() => syncCalls[0]);
  assert.deepEqual({action:auth.action, server:auth.server, user:auth.user, key:auth.key}, {action:'auth', server:'https://sync.example.org', user:'reader', key:crypto.createHash('md5').update('secret').digest('hex')});
  assert.equal(await page.evaluate(() => document.querySelector('#kosync-dialog input[type=password]').value), '', 'password field cleared');
  const stored = await page.evaluate(() => new Promise(r => { const q = db.transaction('settings').objectStore('settings').get('kosync'); q.onsuccess = () => r(JSON.stringify(q.result)); }));
  assert.ok(!stored.includes('secret') && !stored.includes('reader'), 'settings are sealed, no plain account or password');
  await page.evaluate(() => document.getElementById('kosync-dialog').close());

  // Open: asks with the KOReader ID, offers 70.4% from the Kobo (compared with the position saved before
  // this opening, not the reader's refreshed copy), sends nothing that would overwrite it, and jumps there.
  await page.evaluate(ts => { syncServer.get = {progress:'9', percentage:0.704, device:'Kobo', device_id:'kobo1', timestamp:ts}; }, Math.floor(savedAt / 1000) + 1);
  await reopen();
  assert.equal(await until(page, offerInPage), 'Go to 70% (from Kobo)');
  const get = await page.evaluate(() => syncCalls.find(c => c.action === 'get'));
  assert.equal(get.document, koreaderId(pdf), 'KOReader binary ID of the original file');
  await page.evaluate(() => ThingsReader.flush());
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => syncCalls.filter(c => c.action === 'put').length), 0, 'the restored, older place is not sent over the Kobo\'s');
  await page.evaluate(() => [...document.querySelectorAll('#reader-dialog button')].find(b => /from Kobo/.test(b.textContent)).click());
  await until(page, () => ThingsReader.context()?.location === 8 && !ThingsReader.context().loading);

  // Reading on sends the new page (closing the book sends at once).
  await page.evaluate(() => ThingsReader.flush());
  await close();
  let put = await until(page, () => syncCalls.filter(c => c.action === 'put').at(-1));
  assert.equal(put.document, koreaderId(pdf)); assert.equal(put.progress, '9'); assert.equal(put.device, 'ThingsBook');
  assert.match(put.device_id, /^[a-f0-9]{32}$/);

  // Closing the book while the server is still answering: the late reply offers nothing anywhere.
  await page.evaluate(() => { syncServer.get = {progress:'12', percentage:1, device:'Kobo', device_id:'kobo1', timestamp:Math.floor(Date.now() / 1000) + 60}; syncServer.delay = 1500; });
  await reopen();
  await close();
  await page.waitForTimeout(2000);
  assert.equal(await offerText(), null, 'no offer from a book that was closed');
  assert.equal(await page.evaluate(() => syncCalls.filter(c => c.action === 'put').length), 0, 'closing unmoved before the reply sends nothing');
  // Moving and closing before the reply: the final page is still sent.
  await reopen();
  await page.evaluate(() => ThingsReader.jump(2));
  await page.evaluate(() => ThingsReader.flush());
  await close();
  put = await until(page, () => syncCalls.filter(c => c.action === 'put').at(-1));
  assert.equal(put.progress, '3', 'final page sent although the lookup had not answered');
  await page.waitForTimeout(1700);

  // A server that leaves out the document field still offers its newer position.
  await page.evaluate(() => { syncServer.get = {progress:'11', percentage:0.95, device:'Kobo', device_id:'kobo1', timestamp:Math.floor(Date.now() / 1000) + 60}; syncServer.noDocument = true; syncServer.delay = 20; });
  await reopen();
  assert.equal(await until(page, offerInPage), 'Go to 95% (from Kobo)');
  await close();
  await page.evaluate(() => { syncServer.noDocument = false; syncServer.get = null; });
  await page.waitForTimeout(500); // the reader dialog's own close event closes the book again a moment later

  // Two openings racing: the slower, earlier one must not take over from the book opened after it.
  const race = await page.evaluate(async () => {
    syncCalls.length = 0; let release; const gate = new Promise(r => { release = r; });
    const slow = {size:4096, read:async (b, e) => { await gate; return new Uint8Array(e - b).fill(1); }}, fast = {size:4096, read:async (b, e) => new Uint8Array(e - b).fill(2)};
    const first = ThingsKosync.opened({id:'race-a', format:'PDF', progress:{percent:1, location:0}}, slow);
    await ThingsKosync.opened({id:'race-b', format:'PDF', progress:{percent:1, location:0}}, fast);
    release(); await first; await new Promise(r => setTimeout(r, 100));
    ThingsKosync.saved('race-b', {progress:{percent:5, location:2, updated:Date.now()}});
    await new Promise(r => setTimeout(r, 100)); ThingsKosync.closed();
    return syncCalls.map(c => [c.action, c.document, c.progress]);
  });
  const fastId = koreaderId(Buffer.alloc(4096, 2));
  assert.deepEqual(race, [['get', fastId, undefined], ['put', fastId, '3']], 'only the later book is looked up and synced');

  // EPUB: KOReader counts every spine item, so a non-linear cover shifts the chapter numbers it uses.
  const epub = await page.evaluate(() => {
    const enc = s => new TextEncoder().encode(s), page = t => enc(`<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>${t}</h1><p>${t} text.</p></body></html>`);
    const opf = '<package xmlns="http://www.idpf.org/2007/opf" version="3.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Spine</dc:title></metadata><manifest>' + ['cover', 'one', 'notes', 'two'].map(n => `<item id="${n}" href="${n}.xhtml" media-type="application/xhtml+xml"/>`).join('') + '</manifest><spine><itemref idref="cover" linear="no"/><itemref idref="missing"/><itemref idref="one"/><itemref idref="notes" linear="no"/><itemref idref="two"/></spine></package>';
    const book = ReaderCore.epub(ThingsArchiveLib.zipSync({'mimetype':enc('application/epub+zip'), 'META-INF/container.xml':enc('<container><rootfiles><rootfile full-path="book.opf"/></rootfiles></container>'), 'book.opf':enc(opf), 'cover.xhtml':page('Cover'), 'one.xhtml':page('One'), 'notes.xhtml':page('Notes'), 'two.xhtml':page('Two')}).buffer);
    const fragments = book.chapters.map(c => c.fragment), settings = {device:'ThingsBook', deviceId:'abc'};
    return {titles: book.chapters.map(c => c.title), fragments, sent: ThingsKosync.payload('EPUB', {location:1, percent:50}, 'a'.repeat(32), settings, fragments).progress,
      jump: ThingsKosync.decide('EPUB', {percent:10, updated:0}, {progress:'/body/DocFragment[4]', percentage:0.9, device_id:'kobo1'}, 'abc', fragments.length, fragments).location};
  });
  assert.deepEqual(epub, {titles:['One', 'Two'], fragments:[2, 4], sent:'/body/DocFragment[4]', jump:1}, 'chapters use KOReader\'s DocFragment numbers both ways');

  // The menu entry sits with the other library tools.
  assert.equal(await page.evaluate(() => !!document.querySelector('.library-tools-content > button.nav-item') && [...document.querySelectorAll('.library-tools-content > button')].some(b => b.textContent === 'KOReader sync')), true, 'KOReader sync is inside Library tools & backups');

  // The lookup fails: positions are still sent.
  await page.evaluate(() => { syncServer.get = 'error'; syncServer.delay = 20; });
  await reopen();
  await page.evaluate(() => ThingsReader.jump(3));
  await page.evaluate(() => ThingsReader.flush());
  put = await until(page, () => syncCalls.filter(c => c.action === 'put').at(-1));
  assert.equal(put.progress, '4', 'sent although the lookup failed');
  await close();

  // Locking the library while reading sends the final place first.
  await page.evaluate(() => { syncServer.get = null; });
  await reopen();
  await until(page, () => syncCalls.some(c => c.action === 'get'));
  await page.waitForTimeout(200);
  await page.evaluate(() => { syncCalls.length = 0; return ThingsReader.jump(6); });
  await page.evaluate(() => lock());
  put = await until(page, () => syncCalls.filter(c => c.action === 'put').at(-1));
  assert.equal(put.progress, '7', 'final place sent on lock');

  assert.deepEqual(errors, []);
  await context.close();
  console.log('PASS: KOReader sync checks the account, keeps no password, offers the newer page from another device without overwriting it, sends the new page, ignores late replies for closed books, still sends when the lookup fails or the book closes before it answers, accepts servers without a document field, keeps a slower earlier opening from taking over, maps EPUB chapters to KOReader\'s DocFragment numbers, sits in Library tools, and sends the last place on lock.');
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => { cleanup(profile); setTimeout(() => process.exit(), 500).unref(); });
