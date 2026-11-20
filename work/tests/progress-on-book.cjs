// window.progressOnBook(query): one sentence about progress on a matching book.
// Runs the function from app.js against a small list of books. Node only, no browser.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');
const pick = name => { const m = source.match(new RegExp(`\\nfunction ${name}\\([^)]*\\)[\\s\\S]*?\\n}\\n`)); assert(m, `${name} is in app.js`); return m[0]; };
assert(source.includes('window.progressOnBook = progressOnBook;'));

const run = (books, query) => {
  const context = {books};
  vm.createContext(context);
  vm.runInContext(pick('progressOnBook'), context);
  return vm.runInContext(`progressOnBook(${JSON.stringify(query)})`, context);
};

assert.equal(run([], 'Dune'), 'No book matching "Dune" in your library.');
assert.equal(run([
  {title:'Dune', author:'Frank Herbert', lastRead:5, progress:{percent:62.4}, status:'reading'},
  {title:'Foundation', author:'Isaac Asimov', lastRead:1, progress:{percent:10}},
], 'Dune'), 'You are 62 percent read on Dune by Frank Herbert.');
assert.equal(run([
  {title:'Notes', author:'Unknown author', lastRead:2, progress:{percent:0}},
], 'Notes'), 'You are not started on Notes.');
assert.equal(run([
  {title:'Finished Book', author:'Author', status:'finished', progress:{percent:100}},
], 'Finished'), 'You are finished on Finished Book by Author.');
console.log('progressOnBook checks passed.');
