// window.whatWasIReading(): one sentence about the book on the Continue reading card.
// Runs the two functions from app.js against a small list of books. Node only, no browser.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8');
const pick = name => { const m = source.match(new RegExp(`\\nfunction ${name}\\(\\)[\\s\\S]*?\\n}\\n|\\nfunction ${name}\\(\\)\\{.*\\}\\n`)); assert(m, `${name} is in app.js`); return m[0]; };
assert(source.includes('const resume = lastBookInProgress();'), 'the Continue reading card uses the same book');
assert(source.includes('window.whatWasIReading = whatWasIReading;'));

const run = books => { const context = {books}; vm.createContext(context); vm.runInContext(pick('lastBookInProgress') + pick('whatWasIReading'), context); return vm.runInContext('whatWasIReading()', context); };

assert.equal(run([]), 'You have no books in progress.');
assert.equal(run([
  {title:'Old', author:'A', lastRead:1, progress:{percent:40}},
  {title:'Dune', author:'Frank Herbert', lastRead:5, progress:{percent:62.4}},
  {title:'Done', author:'C', lastRead:9, status:'finished', progress:{percent:80}},
  {title:'Whole', author:'D', lastRead:8, progress:{percent:100}},
  {title:'Never opened', author:'E', progress:{percent:0}},
]), 'You were reading Dune by Frank Herbert, 62 percent read.');
assert.equal(run([{title:'Notes', author:'Unknown author', lastRead:2}]), 'You were reading Notes, 0 percent read.');
console.log('whatWasIReading checks passed.');
