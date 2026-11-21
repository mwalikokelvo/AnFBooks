// window.libraryCount(): one sentence about the size of the library.
// Runs the function from app.js against a small list of books. Node only, no browser.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');
const pick = name => { const m = source.match(new RegExp(`\\nfunction ${name}\\(\\)[\\s\\S]*?\\n}\\n|\\nfunction ${name}\\(\\)\\{.*\\}\\n`)); assert(m, `${name} is in app.js`); return m[0]; };
assert(source.includes('window.libraryCount = libraryCount;'));

const run = books => { const context = {books}; vm.createContext(context); vm.runInContext(pick('libraryCount'), context); return vm.runInContext('libraryCount()', context); };

assert.equal(run([]), 'Your library is empty.');
assert.equal(run([
  {title:'Dune', status:'reading', progress:{percent:62}},
  {title:'Done', status:'finished', progress:{percent:100}},
  {title:'New', progress:{percent:0}},
]), 'You have 3 books in your library, of which 2 are still in progress.');
assert.equal(run([{title:'One', progress:{percent:10}}]), 'You have 1 book in your library, of which 1 are still in progress.');
console.log('libraryCount checks passed.');
