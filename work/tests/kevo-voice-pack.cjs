// The Kevo voice pack (vendor/voice-pack.js): all 13 recordings ship with the app, the Voice list offers
// them only when a device voice can read them, and each one reads with the device voice that best
// matches its accent and gender on Windows, Android and in the browser.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const app = path.resolve(__dirname, '../../outputs/ThingsBook');

const window = {};
vm.runInNewContext(fs.readFileSync(path.join(app, 'vendor/voice-pack.js'), 'utf8'), {window});
const pack = window.ThingsVoicePack;

assert.equal(pack.profiles.length, 13, 'all 13 Kevo voices');
assert.equal(new Set(pack.profiles.map(p => p.id)).size, 13, 'ids are unique');
for (const p of pack.profiles) {
  const file = path.join(app, 'vendor/voice-pack', p.file);
  assert(fs.statSync(file).size > 10000, `${p.file} is bundled`);
  assert.equal(decodeURIComponent(pack.sampleUrl('pack:' + p.id)), 'vendor/voice-pack/' + p.file);
}
const files = fs.readdirSync(path.join(app, 'vendor/voice-pack')).filter(f => f.endsWith('.mp3'));
assert.equal(files.length, 13, 'no stray recordings beside the 13');

assert.equal(pack.options([{id:'unavailable', label:'No offline device voice installed'}]).length, 0, 'no device voice, no pack entries');
assert.equal(pack.options([{id:'custom:always-forever', label:'Always & Forever'}]).length, 0, 'personal voices cannot read pack voices');
assert.equal(pack.options([{id:'android:x', label:'x', language:'en-US'}]).length, 13);
assert.equal(pack.sampleUrl('windows:x'), null);
assert.equal(pack.resolve('windows:abc', []), 'windows:abc', 'other choices pass through');

const windows = [
  {id:'windows:zira', label:'Microsoft Zira Desktop - English (United States)'},
  {id:'windows:david', label:'Microsoft David Desktop - English (United States)'},
  {id:'windows:hazel', label:'Microsoft Hazel Desktop - English (Great Britain)'},
  {id:'windows:george', label:'Microsoft George - English (United Kingdom)'},
  {id:'windows:hortense', label:'Microsoft Hortense Desktop - French'},
];
assert.equal(pack.resolve('pack:jean-audiobook', windows), 'windows:zira', 'female US voice');
assert.equal(pack.resolve('pack:burt-deep-smooth', windows), 'windows:david', 'male US voice');
assert.equal(pack.resolve('pack:nath-british-calm', windows), 'windows:george', 'male British voice');

const android = [
  {id:'android:en-us-x-iob-local', label:'English (United States) iob', language:'en-US'},
  {id:'android:fr-fr-x-local', label:'Français', language:'fr-FR'},
];
assert.equal(pack.resolve('pack:grandpa', android), 'android:en-us-x-iob-local', 'Android: the English voice, never French');
assert.equal(pack.resolve('pack:grandpa', [{id:'android:fr', label:'Français', language:'fr-FR'}]), 'unavailable', 'no English voice');

const device = [{id:'device:a', label:'Samantha', voice:{lang:'en-US'}}, {id:'device:b', label:'Daniel', voice:{lang:'en-GB'}}];
assert.equal(pack.resolve('pack:lil-velvety', device), 'device:a');
assert.equal(pack.resolve('pack:nath-british-calm', device), 'device:b');

const html = fs.readFileSync(path.join(app, 'index.html'), 'utf8');
assert.match(html, /<script src="vendor\/voice-pack\.js" defer><\/script>[\s\S]*<script src="reader\.js"/, 'loaded before the reader');
assert.match(html, /id="narrator-sample"/, 'Hear this voice button');
console.log('PASS Kevo voice pack: 13 bundled voices, offered with a device voice, each read by the best accent and gender match');
