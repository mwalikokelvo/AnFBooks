// window.estimatedTimeLeft(): one sentence about remaining reading time for the book in progress.
// Uses the same ~1.5 min/page rule as library tooltips. Node only.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');
const pickFn = name => { const m = source.match(new RegExp(`\\nfunction ${name}\\([^)]*\\)[\\s\\S]*?\\n}\\n`)); assert(m, `${name} is in app.js`); return m[0]; };
assert(source.includes('window.estimatedTimeLeft = estimatedTimeLeft;'));

const timeLeftSrc = `const timeLeft = book => { const pct = Math.min(100, book.progress?.percent || 0); return book.pages && pct < 100 ? book.pages * (100 - pct) / 100 : Infinity; };`;

const run = books => {
  const context = {books};
  vm.createContext(context);
  vm.runInContext(pickFn('lastBookInProgress') + timeLeftSrc + pickFn('estimatedTimeLeft'), context);
  return vm.runInContext('estimatedTimeLeft()', context);
};

assert.equal(run([]), 'You have no books in progress.');
const dune = run([
  {title:'Dune', author:'Frank Herbert', lastRead:5, pages:500, progress:{percent:50}},
]);
assert.match(dune, /About .* left in Dune by Frank Herbert/);
assert.match(dune, /hour/); // 250 pages * 1.5 = 375 min ≈ 6h 15m
const notes = run([
  {title:'Notes', author:'Unknown author', lastRead:2, pages:10, progress:{percent:0}},
]);
assert.match(notes, /About 15 minutes left in Notes/);
assert.equal(run([
  {title:'NoPages', lastRead:1, progress:{percent:20}},
]), 'I do not know how long NoPages has left.');
console.log('estimatedTimeLeft checks passed.');
