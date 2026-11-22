// One-sentence library answers for a voice assistant or a script (from Grok): progressOnBook, searchLibrary,
// estimatedTimeLeft and librarySummary. Runs the functions from app.js against small book lists. Node only.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');
const line = start => { const found = source.split('\n').find(l => l.startsWith(start)); assert(found, `${start} is in app.js`); return found + '\n'; };
const from = source.indexOf('\nfunction booksMatching('), to = source.indexOf('window.librarySummary = librarySummary;');
assert(from > 0 && to > from, 'the library answers are in app.js');
for (const name of ['progressOnBook', 'searchLibrary', 'estimatedTimeLeft', 'librarySummary']) assert(source.includes(`window.${name} = ${name};`));
const code = line('function lastBookInProgress(') + line('const timeLeft = ') + line('function readingMinutesLeft(') + line('function readingLeft(')
  + source.slice(from, to).replace(/window\.\w+ = \w+;/g, '');
const ask = (books, call) => { const context = {books}; vm.createContext(context); vm.runInContext(code, context); return vm.runInContext(call, context); };

const library = [
  {title:'Dune Messiah', author:'Frank Herbert', series:'Dune', status:'reading', lastRead:9, pages:300, progress:{percent:10}},
  {title:'Dune', author:'Frank Herbert', series:'Dune', status:'reading', lastRead:5, pages:500, progress:{percent:62.4}},
  {title:'Neuromancer', author:'William Gibson', status:'unread', progress:{percent:0}},
  {title:'Notes', author:'Unknown author', status:'unread', progress:{percent:0}},
  {title:'The Left Hand of Darkness', author:'Ursula K. Le Guin', status:'finished', progress:{percent:100}},
];

// progressOnBook: an exact title wins over a more recently read partial match.
assert.equal(ask(library, 'progressOnBook("dune")'), 'You are 62 percent through Dune by Frank Herbert.');
assert.equal(ask(library, 'progressOnBook("messiah")'), 'You are 10 percent through Dune Messiah by Frank Herbert.');
assert.equal(ask(library, 'progressOnBook("Notes")'), 'You have not started Notes yet.');
assert.equal(ask(library, 'progressOnBook("le guin")'), 'You finished The Left Hand of Darkness by Ursula K. Le Guin.');
assert.equal(ask(library, 'progressOnBook("xyzzy")'), 'I found no book matching "xyzzy" in your library.');
assert.equal(ask(library, 'progressOnBook("  ")'), 'Say the title or author of a book.');

// searchLibrary: title, author or series, at most three named.
assert.equal(ask(library, 'searchLibrary("gibson")'), 'I found 1 book: Neuromancer by William Gibson, 0 percent read.');
assert.match(ask(library, 'searchLibrary("herbert")'), /^I found 2 books: Dune Messiah by Frank Herbert, 10 percent read; Dune by Frank Herbert/);
assert.match(ask(library, 'searchLibrary("e")'), /^I found 5 books: .*; and 2 more\.$/);
assert.equal(ask(library, 'searchLibrary("xyzzy")'), 'I found no books matching "xyzzy" in your library.');
assert.equal(ask(library, 'searchLibrary()'), 'Say a title or author to search your library.');

// estimatedTimeLeft: the Continue reading book (Dune Messiah, 270 pages left = 405 minutes).
assert.equal(ask(library, 'estimatedTimeLeft()'), 'About 6 hours 45 minutes left in Dune Messiah by Frank Herbert.');
assert.equal(ask([{title:'Short', lastRead:1, pages:40, progress:{percent:0}}], 'estimatedTimeLeft()'), 'About 1 hour left in Short.');
assert.equal(ask([{title:'Tiny', lastRead:1, pages:2, progress:{percent:90}}], 'estimatedTimeLeft()'), 'About 1 minute left in Tiny.');
assert.equal(ask([{title:'NoPages', lastRead:1, progress:{percent:20}}], 'estimatedTimeLeft()'), 'I do not know how long NoPages has left, because its page count is missing.');
assert.equal(ask([], 'estimatedTimeLeft()'), 'You have no books in progress.');
// The library tooltip still reads the same.
assert.equal(ask(library, 'readingLeft(books[0])'), ' · about 6 h 45 min left');
assert.equal(ask(library, 'readingLeft(books[2])'), '');

// librarySummary
assert.equal(ask(library, 'librarySummary()'), 'You have 5 books: 2 reading, 2 unread and 1 finished. Average progress is 34 percent.');
assert.equal(ask([{title:'One', status:'reading', progress:{percent:40}}], 'librarySummary()'), 'You have 1 book: 1 reading, 0 unread and 0 finished. Average progress is 40 percent.');
assert.equal(ask([], 'librarySummary()'), 'Your library is empty.');
console.log('library voice answers checks passed.');
