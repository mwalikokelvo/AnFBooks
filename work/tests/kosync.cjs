'use strict';
// KOReader progress sync: the page module's maths and rules, and the desktop request builder.
const assert = require('assert');
const crypto = require('crypto');
const path = require('path');
const K = require(path.join(__dirname, '../../outputs/ThingsBook/vendor/kosync.js'));
const desktop = require(path.join(__dirname, '../thingsbook-desktop/kosync.cjs'));
const nodeMd5 = data => crypto.createHash('md5').update(data).digest('hex');

(async () => {
  // MD5: RFC 1321 vectors and every padding edge against Node's own MD5.
  assert.strictEqual(K.md5(''), 'd41d8cd98f00b204e9800998ecf8427e');
  assert.strictEqual(K.md5('abc'), '900150983cd24fb0d6963f7d28e17f72');
  assert.strictEqual(K.md5('The quick brown fox jumps over the lazy dog'), '9e107d9d372bb6826bd81d3542a419d6');
  for (const n of [1, 55, 56, 57, 63, 64, 65, 119, 120, 1000, 4096 + 7]) {
    const bytes = crypto.randomBytes(n);
    assert.strictEqual(K.md5(bytes), nodeMd5(bytes), `md5 of ${n} bytes`);
  }
  assert.strictEqual(K.md5('ünïcode ✓'), nodeMd5(Buffer.from('ünïcode ✓', 'utf8')));
  assert.strictEqual(K.userKey('secret'), nodeMd5('secret'));

  // Book ID: KOReader's "binary" partial MD5 (1 KiB at 0, 1 KiB, 4 KiB, 16 KiB, … until past the end).
  const koreaderId = buffer => {
    const hash = crypto.createHash('md5');
    for (let i = -1; i <= 10; i++) {
      const at = i < 0 ? 0 : 1024 * 4 ** i;
      if (at >= buffer.length) break;
      hash.update(buffer.subarray(at, at + 1024));
    }
    return hash.digest('hex');
  };
  for (const n of [0, 10, 1024, 1500, 5000, 70000, 3 * 1024 * 1024 + 11]) {
    const file = crypto.randomBytes(n);
    const source = {size: n, read: async (begin, end) => file.subarray(begin, end)};
    assert.strictEqual(await K.documentId(source), koreaderId(file), `document id of ${n} bytes`);
    assert.strictEqual(await K.documentId(new Blob([file])), koreaderId(file), `document id of a ${n}-byte Blob`);
  }
  await assert.rejects(() => K.documentId({size: -1, read: async () => new Uint8Array()}));

  // Server address: https only, no credentials, query or fragment; trailing slashes dropped.
  assert.strictEqual(K.server(' https://sync.example.org/ '), 'https://sync.example.org');
  assert.strictEqual(K.server('https://example.org/kosync//'), 'https://example.org/kosync');
  for (const bad of ['http://sync.example.org', 'https://user:pw@example.org', 'https://example.org/?a=1', 'https://example.org/#x', 'ftp://x', 'nonsense', '', null, 'https://e.org/' + 'a'.repeat(500)])
    assert.strictEqual(K.server(bad), null, String(bad));
  for (const value of ['https://sync.example.org/', 'http://x.org', 'https://a:b@x.org'])
    assert.strictEqual(desktop.server(value), K.server(value), 'desktop and page agree on ' + value);

  // What is sent.
  const settings = {device: 'ThingsBook', deviceId: 'abc123'}, doc = 'a'.repeat(32);
  assert.deepStrictEqual(K.payload('EPUB', {percent: 42.5, location: 6}, doc, settings), {document: doc, progress: '/body/DocFragment[7]', percentage: 0.425, device: 'ThingsBook', device_id: 'abc123'});
  assert.deepStrictEqual(K.payload('PDF', {percent: 10, location: 0}, doc, settings).progress, '1');
  assert.strictEqual(K.payload('PDF', {percent: 150, location: -3}, doc, settings).percentage, 1);
  assert.strictEqual(K.payload('EPUB', {}, doc, settings).progress, '/body/DocFragment[1]');

  // When to offer a jump.
  const now = Date.now(), local = {percent: 20, updated: now - 60000};
  const remote = (extra = {}) => ({document: doc, progress: '/body/DocFragment[30]', percentage: 0.6, device: 'Kobo', device_id: 'other', timestamp: Math.floor(now / 1000), ...extra});
  const jump = K.decide('EPUB', local, remote(), 'abc123', 100);
  assert.deepStrictEqual({...jump, percent: Math.round(jump.percent)}, {location: 29, percent: 60, device: 'Kobo'});
  assert.ok(Math.abs(K.decide('EPUB', local, remote({percentage: 0.704}), 'abc123', 100).percent - 70.4) < 1e-9, 'exact percent kept (the floor below which nothing is sent)');
  const {timestamp, ...noTime} = remote();
  assert.strictEqual(K.decide('EPUB', local, noTime, 'abc123', 100).location, 29, 'a server without times is compared by percentage');
  assert.strictEqual(K.decide('EPUB', local, {...noTime, percentage: 0.1}, 'abc123', 100), null, 'and still not when behind');
  assert.strictEqual(K.decide('EPUB', local, remote({timestamp: 'soon'}), 'abc123', 100).location, 29, 'an unreadable time counts as none');
  assert.strictEqual(K.decide('EPUB', local, remote({device_id: 'abc123'}), 'abc123', 100), null, 'own device ignored');
  assert.strictEqual(K.decide('EPUB', local, remote({percentage: 0.2}), 'abc123', 100), null, 'not further along');
  assert.strictEqual(K.decide('EPUB', local, remote({timestamp: Math.floor((now - 120000) / 1000)}), 'abc123', 100), null, 'older than this device');
  assert.strictEqual(K.decide('EPUB', local, null, 'abc123', 100), null, 'nothing on the server');
  assert.strictEqual(K.decide('EPUB', local, {}, 'abc123', 100), null, 'empty server reply');
  assert.strictEqual(K.decide('EPUB', local, remote({percentage: 1.5}), 'abc123', 100), null, 'impossible percentage');
  assert.strictEqual(K.decide('EPUB', local, remote(), 'abc123', 10).location, 9, 'clamped to the last chapter');
  assert.strictEqual(K.decide('PDF', local, remote({progress: '250'}), 'abc123', 300).location, 249, 'PDF page');
  assert.strictEqual(K.decide('PDF', local, remote({progress: 'garbage', percentage: 0.5}), 'abc123', 200).location, 100, 'falls back to the percentage');

  // Speed budget: building and comparing a position stays far under 50 ms (p95 of 10,000).
  const times = [];
  for (let i = 0; i < 10000; i++) {
    const start = process.hrtime.bigint();
    K.payload(i % 2 ? 'PDF' : 'EPUB', {percent: i % 100, location: i % 300}, doc, settings);
    K.decide(i % 2 ? 'PDF' : 'EPUB', {percent: i % 50, updated: now - 1000}, remote({percentage: (i % 100) / 100}), 'abc123', 300);
    times.push(Number(process.hrtime.bigint() - start) / 1e6);
  }
  times.sort((a, b) => a - b);
  const p95 = times[9500];
  console.log(`kosync diff/merge p95 ${p95.toFixed(4)} ms (budget 50 ms)`);
  assert.ok(p95 < 50, 'KOReader sync payload diff/merge over budget');

  // Desktop requests.
  const base = {server: 'https://sync.example.org/', user: 'reader', key: 'b'.repeat(32)};
  let call = desktop.build({...base, action: 'auth'});
  assert.deepStrictEqual(call, {url: 'https://sync.example.org/users/auth', method: 'GET', headers: {'Accept': 'application/vnd.koreader.v1+json', 'x-auth-user': 'reader', 'x-auth-key': 'b'.repeat(32)}});
  call = desktop.build({...base, action: 'get', document: doc});
  assert.strictEqual(call.url, 'https://sync.example.org/syncs/progress/' + doc);
  const put = {...base, action: 'put', ...K.payload('EPUB', {percent: 50, location: 3}, doc, settings)};
  call = desktop.build(put);
  assert.strictEqual(call.method, 'PUT');
  assert.strictEqual(call.headers['Content-Type'], 'application/json');
  assert.deepStrictEqual(JSON.parse(call.body), {document: doc, progress: '/body/DocFragment[4]', percentage: 0.5, device: 'ThingsBook', device_id: 'abc123'});
  for (const bad of [{...base, server: 'http://x.org', action: 'auth'}, {...base, key: 'short', action: 'auth'}, {...base, user: 'a\nb', action: 'auth'}, {...base, action: 'get', document: '../users'}, {...base, action: 'delete', document: doc}, {...put, percentage: 2}, {...put, device_id: 'x y'}])
    assert.throws(() => desktop.build(bad));

  const reply = (status, text, headers = {}) => new Response(text, {status, headers});
  let seen;
  assert.deepStrictEqual(await desktop.request({...base, action: 'get', document: doc}, async (url, options) => { seen = options; return reply(200, '{"percentage":0.3}'); }), {value: {percentage: 0.3}});
  assert.strictEqual(seen.redirect, 'error'); assert.strictEqual(seen.credentials, 'omit'); assert.ok(seen.signal);
  assert.deepStrictEqual(await desktop.request({...base, action: 'get', document: doc}, async () => reply(200, '')), {value: {}});
  assert.match((await desktop.request({...base, action: 'auth'}, async () => reply(401, '{}'))).error, /did not accept/);
  assert.match((await desktop.request({...base, action: 'auth'}, async () => reply(500, '{}'))).error, /could not/);
  assert.match((await desktop.request({...base, action: 'auth'}, async () => reply(200, 'x'.repeat(70000)))).error, /too much/);
  assert.match((await desktop.request({...base, action: 'auth'}, async () => reply(200, '{}', {'content-length': '999999'}))).error, /too much/);
  // A reply without a length that never ends: reading stops just past 64 KB and the request is aborted.
  let pulled = 0, aborted = false;
  const endless = (url, options) => { options.signal.addEventListener('abort', () => { aborted = true; }); return new Response(new ReadableStream({pull(c) { pulled++; c.enqueue(new Uint8Array(16 * 1024)); }})); };
  assert.match((await desktop.request({...base, action: 'auth'}, endless)).error, /too much/);
  assert.ok(pulled <= 8 && aborted, `stopped after ${pulled} chunks, aborted: ${aborted}`);
  assert.match((await desktop.request({...base, action: 'auth'}, async () => reply(200, '<html>'))).error, /not KOReader/);
  assert.match((await desktop.request({...base, action: 'auth'}, async () => { throw new Error('ECONNRESET'); })).error, /Could not reach/);
  let called = false;
  assert.match((await desktop.request({...base, server: 'http://x.org', action: 'auth'}, async () => { called = true; })).error, /https/);
  assert.strictEqual(called, false, 'an invalid request never reaches the network');

  console.log('kosync: all checks passed');
})().catch(error => { console.error(error); process.exit(1); });
