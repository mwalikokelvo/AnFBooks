// window.searchLibrary(query): spoken search of the library by title, author or series.
// Runs the function from app.js against a small list of books. Node only, no browser.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');
const pick = name => { const m = source.match(new RegExp(`\\nfunction ${name}\\([^)]*\\)[\\s\\S]*?\\n}\\n`)); assert(m, `${name} is in app.js`); return m[0]; };
assert(source.includes('window.searchLibrary = searchLibrary;'));

const books = [
  {title:'Dune', author:'Frank Herbert', series:'Dune', progress:{percent:62}},
  {title:'Dune Messiah', author:'Frank Herbert', series:'Dune', progress:{percent:10}},
  {title:'Neuromancer', author:'William Gibson', progress:{percent:0}},
  {title:'The Left Hand of Darkness', author:'Ursula K. Le Guin', progress:{percent:100}},
];

const run = query => { const context = {books}; vm.createContext(context); vm.runInContext(pick('searchLibrary'), context); return vm.runInContext(`searchLibrary(${JSON.stringify(query)})`, context); };

assert.match(run(''), /Say a title or author/);
assert.match(run('dune'), /found 2 books/);
assert.match(run('herbert'), /Frank Herbert/);
assert.match(run('gibson'), /Neuromancer/);
assert.match(run('xyzzy'), /no books matching/);
console.log('searchLibrary checks passed.');
