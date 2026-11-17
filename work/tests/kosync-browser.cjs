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
  // records each request; the server holds page 9 (location 8) from a Kobo, newer than this device.
  await page.evaluate(() => { window.syncCalls = []; window.ThingsBookAndroid = {kosyncRequest(id, json) { const value = JSON.parse(json); syncCalls.push(value); const reply = value.action === 'get' ? {value:{document:value.document, progress:'9', percentage:0.7, device:'Kobo', device_id:'kobo1', timestamp:Math.floor(Date.now() / 1000) + 5}} : {value:{}}; setTimeout(() => ThingsKosync.receive(id, JSON.stringify(reply)), 20); }}; });

  // Off: opening a book makes no request.
  await page.evaluate(id => readBook(id), id);
  await until(page, () => ThingsReader.context()?.pdf && !ThingsReader.context().loading);
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => syncCalls.length), 0, 'no requests while sync is off');
  await page.evaluate(() => { $('reader-dialog').close(); return closeReader(); });

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

  // Open: asks with the KOReader ID, offers page 9 from the Kobo, jumping goes there.
  await page.evaluate(id => readBook(id), id);
  await until(page, () => ThingsReader.context()?.pdf && !ThingsReader.context().loading);
  const offer = await until(page, () => [...document.querySelectorAll('#reader-dialog button')].find(b => /from Kobo/.test(b.textContent))?.textContent);
  assert.equal(offer, 'Go to 70% (from Kobo)');
  const get = await page.evaluate(() => syncCalls.find(c => c.action === 'get'));
  assert.equal(get.document, koreaderId(pdf), 'KOReader binary ID of the original file');
  await page.evaluate(() => [...document.querySelectorAll('#reader-dialog button')].find(b => /from Kobo/.test(b.textContent)).click());
  await until(page, () => ThingsReader.context()?.location === 8 && !ThingsReader.context().loading);

  // Reading on sends the new page (closing the book sends at once).
  await page.evaluate(() => ThingsReader.flush());
  await page.evaluate(() => { $('reader-dialog').close(); return closeReader(); });
  const put = await until(page, () => syncCalls.filter(c => c.action === 'put').at(-1));
  assert.equal(put.document, koreaderId(pdf)); assert.equal(put.progress, '9'); assert.equal(put.device, 'ThingsBook');
  assert.match(put.device_id, /^[a-f0-9]{32}$/);

  assert.deepEqual(errors, []);
  await context.close();
  console.log('PASS: KOReader sync checks the account, keeps no password, offers the newer page from another device and sends the new page.');
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => { cleanup(profile); setTimeout(() => process.exit(), 500).unref(); });
