// More one-sentence library answers for a voice assistant or a script (from Grok): listUnfinished,
// whatToReadNext and shelvesSummary. Runs the functions from app.js against small book lists. Node only.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');
const line = start => { const found = source.split('\n').find(l => l.startsWith(start)); assert(found, `${start} is in app.js`); return found + '\n'; };
const from = source.indexOf('\nfunction booksMatching('), to = source.indexOf('window.shelvesSummary = shelvesSummary;');
assert(from > 0 && to > from, 'the library answers are in app.js');
for (const name of ['listUnfinished', 'whatToReadNext', 'shelvesSummary']) assert(source.includes(`window.${name} = ${name};`));
const code = line('function lastBookInProgress(') + source.slice(from, to).replace(/window\.\w+ = \w+;/g, '');
const ask = (books, call, shelves = []) => { const context = {books, shelves}; vm.createContext(context); vm.runInContext(code, context); return vm.runInContext(call, context); };

const library = [
  {title:'Dune Messiah', author:'Frank Herbert', status:'reading', lastRead:9, added:2, shelfId:'s1', progress:{percent:10}},
  {title:'Dune', author:'Frank Herbert', status:'reading', lastRead:5, added:1, shelfId:'s1', progress:{percent:62.4}},
  {title:'Neuromancer', author:'William Gibson', status:'unread', added:4, rating:3, shelfId:'s2', progress:{percent:0}},
  {title:'Notes', author:'Unknown author', status:'unread', added:6, shelfId:'s2'},
  {title:'The Left Hand of Darkness', author:'Ursula K. Le Guin', status:'finished', added:3, shelfId:'s2', progress:{percent:100}},
];

// listUnfinished: most recently read first, then most recently added; at most three named.
assert.equal(ask(library, 'listUnfinished()'), 'You have 4 unfinished books: Dune Messiah by Frank Herbert, 10 percent read; Dune by Frank Herbert, 62 percent read; Notes, not started; and 1 more.');
assert.equal(ask([library[2]], 'listUnfinished()'), 'You have 1 unfinished book: Neuromancer by William Gibson, not started.');
// A book at 100 percent counts as finished even if its status was never changed.
assert.equal(ask([library[4], {title:'Done', status:'reading', progress:{percent:100}}], 'listUnfinished()'), 'You have finished every book in your library.');
assert.equal(ask([], 'listUnfinished()'), 'Your library is empty.');

// whatToReadNext: the Continue reading book first, else the best rated unopened book, else the newest.
assert.equal(ask(library, 'whatToReadNext()'), 'Carry on with Dune Messiah by Frank Herbert, 10 percent read.');
assert.equal(ask([{title:'Opened', lastRead:1, progress:{percent:0}}], 'whatToReadNext()'), 'Carry on with Opened.');
assert.equal(ask(library.slice(2), 'whatToReadNext()'), 'Start Neuromancer by William Gibson next.');
assert.equal(ask([library[3], {...library[2], rating:0}], 'whatToReadNext()'), 'Start Notes next.');
assert.equal(ask([library[4]], 'whatToReadNext()'), 'You have finished every book in your library.');
assert.equal(ask([], 'whatToReadNext()'), 'Your library is empty.');

// shelvesSummary: the library's shelf order, the shelfId field, "shelf"/"shelves", "no books", at most five named.
const shelves = [{id:'s1', name:'Science fiction'}, {id:'s2', name:'My collection'}, {id:'s3', name:'Poetry'}];
assert.equal(ask(library, 'shelvesSummary()', shelves), 'You have 3 shelves: Science fiction with 2 books, My collection with 3 books and Poetry with no books.');
assert.equal(ask([library[0]], 'shelvesSummary()', [{id:'s1', name:'Dune'}]), 'You have 1 shelf: Dune with 1 book.');
const many = Array.from({length:7}, (_, i) => ({id:`m${i}`, name:`Shelf ${i + 1}`}));
assert.equal(ask([], 'shelvesSummary()', many), 'You have 7 shelves: Shelf 1 with no books, Shelf 2 with no books, Shelf 3 with no books, Shelf 4 with no books, Shelf 5 with no books and 2 more.');
assert.equal(ask([], 'shelvesSummary()'), 'You have no shelves yet.');
console.log('more library answers checks passed.');
