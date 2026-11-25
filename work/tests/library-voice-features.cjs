// Voice and script library answers (from Grok): startReadAloud, markAsFinished,
// booksOnShelf, and booksByAuthor. Runs the functions from app.js against fixture data. Node only.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');
const line = start => { const found = source.split('\n').find(l => l.startsWith(start)); assert(found, `${start} is in app.js`); return found + '\n'; };
const from = source.indexOf('\nfunction booksMatching('), to = source.indexOf('function scheduleLibrarySearch');
assert(from > 0 && to > from, 'the library answers are in app.js');
for (const name of ['startReadAloud', 'markAsFinished', 'booksOnShelf', 'booksByAuthor']) {
  assert(source.includes(`window.${name} = ${name};`), `window.${name} is exported`);
}
const code = line('function lastBookInProgress(') + source.slice(from, to).replace(/window\.\w+ = \w+;/g, '');

class MockSpeechSynthesisUtterance {
  constructor(text) { this.text = text; }
}

const ask = (books, call, shelves = [], windowMock = {}) => {
  const context = {books, shelves, window: windowMock, SpeechSynthesisUtterance: MockSpeechSynthesisUtterance};
  if (windowMock && !windowMock.SpeechSynthesisUtterance) {
    windowMock.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  }
  vm.createContext(context);
  vm.runInContext(code, context);
  return vm.runInContext(call, context);
};

const library = [
  {id:'b1', title:'Dune Messiah', author:'Frank Herbert', status:'reading', lastRead:9, added:2, shelfId:'s1', progress:{percent:10}, excerpt:'A beginning is the time for taking the most delicate care...'},
  {id:'b2', title:'Dune', author:'Frank Herbert', status:'reading', lastRead:5, added:1, shelfId:'s1', progress:{percent:62.4}},
  {id:'b3', title:'Neuromancer', author:'William Gibson', status:'unread', added:4, rating:3, shelfId:'s2', progress:{percent:0}},
  {id:'b4', title:'Notes', author:'Unknown author', status:'unread', added:6, shelfId:'s2'},
  {id:'b5', title:'The Left Hand of Darkness', author:'Ursula K. Le Guin', status:'finished', added:3, shelfId:'s2', progress:{percent:100}},
];
const shelves = [
  {id:'s1', name:'Science fiction'},
  {id:'s2', name:'My collection'},
  {id:'s3', name:'Empty shelf'}
];

// startReadAloud
// 1. Without speech synthesis
assert.equal(ask(library, 'startReadAloud("dune")'), 'Speech synthesis not available.');
assert.equal(ask([], 'startReadAloud()'), 'No book found to read aloud.');

// 2. With mock speech synthesis
let spokenText = null;
const mockWindow = {
  speechSynthesis: {
    speak: (utt) => { spokenText = utt.text; }
  },
  SpeechSynthesisUtterance: MockSpeechSynthesisUtterance
};

assert.equal(ask(library, 'startReadAloud("Dune Messiah")', shelves, mockWindow), 'Reading Dune Messiah aloud.');
assert.equal(spokenText, 'A beginning is the time for taking the most delicate care...');

assert.equal(ask(library, 'startReadAloud()', shelves, mockWindow), 'Reading Dune Messiah aloud.');
assert.equal(ask(library, 'startReadAloud("Neuromancer")', shelves, mockWindow), 'Reading Neuromancer aloud.');

// markAsFinished
assert.equal(ask(library, 'markAsFinished("")'), 'Say the title or author of a book to mark as finished.');
assert.equal(ask(library, 'markAsFinished("Nonexistent")'), 'I found no book matching "Nonexistent" in your library.');
const b2Copy = {...library[1], progress: {...library[1].progress}};
assert.equal(ask([b2Copy], 'markAsFinished("dune")'), 'Dune by Frank Herbert marked as finished.');
assert.equal(b2Copy.status, 'finished');
assert.equal(b2Copy.progress.percent, 100);

// booksOnShelf
assert.equal(ask(library, 'booksOnShelf("")', shelves), 'Say the name of a shelf.');
assert.equal(ask(library, 'booksOnShelf("Unknown")', shelves), 'No shelf named "Unknown" found.');
assert.equal(ask(library, 'booksOnShelf("Empty")', shelves), 'Empty shelf is empty.');
assert.equal(ask(library, 'booksOnShelf("Science fiction")', shelves), 'On Science fiction: Dune Messiah, Dune.');

// booksByAuthor
assert.equal(ask(library, 'booksByAuthor("")'), 'Say an author to search your library.');
assert.equal(ask(library, 'booksByAuthor("Asimov")'), 'You have no books by Asimov in your library.');
assert.equal(ask(library, 'booksByAuthor("Herbert")'), 'By Frank Herbert you have Dune Messiah, Dune.');
assert.equal(ask(library, 'booksByAuthor("Gibson")'), 'By William Gibson you have Neuromancer.');

console.log('library voice features checks passed.');
