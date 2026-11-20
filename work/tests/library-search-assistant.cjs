// window.searchLibraryAssistant(query): spoken summary of library matches by title or author.
// Node only, extracts the function from app.js.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');
const pick = name => { const m = source.match(new RegExp(`\\nfunction ${name}\\([^)]*\\)[\\s\\S]*?\\n}\\n`)); assert(m, `${name} is in app.js`); return m[0]; };
assert(source.includes('window.searchLibraryAssistant = searchLibraryAssistant;'));

const run = (books, query) => {
  const context = { books };
  vm.createContext(context);
  vm.runInContext(pick('searchLibraryAssistant'), context);
  return vm.runInContext(`searchLibraryAssistant(${JSON.stringify(query)})`, context);
};

assert.equal(run([], ''), 'Say what to look for, for example search my library for Dune.');
assert.equal(run([{title:'Dune', author:'Frank Herbert', progress:{percent:30}}], 'dune'), 'Found Dune by Frank Herbert, 30 percent read.');
assert.equal(run([{title:'Dune', author:'Frank Herbert'}, {title:'Foundation', author:'Isaac Asimov'}], 'science'), 'No books matching science.');
assert.ok(run([{title:'Dune', author:'Frank Herbert'}, {title:'Dune Messiah', author:'Frank Herbert'}, {title:'Children of Dune', author:'Frank Herbert'}], 'dune').includes('Found 3 books'));
console.log('library search assistant checks passed.');
