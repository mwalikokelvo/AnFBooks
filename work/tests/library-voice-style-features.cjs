// Voice library style features (from Grok): setReadAloudSpeed, listRecentlyFinished, putBookOnShelf.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');
for (const name of ['setReadAloudSpeed', 'listRecentlyFinished', 'putBookOnShelf']) {
  assert(source.includes(`window.${name} = ${name};`), `window.${name} is exported`);
}
const from = source.indexOf('\nfunction booksMatching(');
const to = source.indexOf('function scheduleLibrarySearch');
assert(from > 0 && to > from, 'library answers block present');
const line = start => {
  const found = source.split('\n').find(l => l.startsWith(start));
  assert(found, `${start} is in app.js`);
  return found + '\n';
};
const code = line('function lastBookInProgress(') + source.slice(from, to).replace(/window\.\w+ = \w+;/g, '');

const now = Date.now();
const shelves = [
  { id: 's1', name: 'Fiction' },
  { id: 's2', name: 'Theology' },
];
const library = [
  { id: 'b1', title: 'Dune Messiah', author: 'Frank Herbert', status: 'reading', progress: { percent: 10 }, lastRead: now - 1e6, shelfId: 's1' },
  { id: 'b2', title: 'Neuromancer', author: 'William Gibson', status: 'finished', progress: { percent: 100 }, finishedAt: now - 2 * 864e5, lastRead: now - 2 * 864e5, shelfId: 's1' },
  { id: 'b3', title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', status: 'finished', progress: { percent: 100 }, finishedAt: now - 40 * 864e5, lastRead: now - 40 * 864e5, shelfId: 's2' },
  { id: 'b4', title: 'Notes', author: 'Unknown author', status: 'unread', progress: { percent: 0 }, shelfId: 's2' },
];

function ask(call, windowMock = {}) {
  const context = {
    books: library.map(b => ({ ...b, progress: { ...(b.progress || {}) } })),
    shelves: shelves.map(s => ({ ...s })),
    window: windowMock,
    document: {
      getElementById: id => (id === 'narrator-speed' ? { value: '1', dispatchEvent() {} } : null),
    },
    Event: function Event() {},
    updateBook: async () => {},
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  return vm.runInContext(call, context);
}

// setReadAloudSpeed
assert.equal(ask('setReadAloudSpeed(1.25)'), 'Read-aloud speed set to 1.25.');
assert.equal(ask('setReadAloudSpeed(0.4)'), 'Say a speed between 0.5 and 2, for example 1.25.');
assert.equal(ask('setReadAloudSpeed(3)'), 'Say a speed between 0.5 and 2, for example 1.25.');
assert.equal(ask('setReadAloudSpeed("x")'), 'Say a speed between 0.5 and 2, for example 1.25.');

// listRecentlyFinished
assert.match(ask('listRecentlyFinished(30)'), /Finished in the last 30 days: Neuromancer/);
assert.match(ask('listRecentlyFinished(1)'), /You finished no books in the last 1 days./);
assert.match(ask('listRecentlyFinished()'), /Neuromancer/);

// putBookOnShelf
assert.equal(ask('putBookOnShelf("Dune Messiah", "Theology")'), 'Moved Dune Messiah to Theology.');
assert.equal(ask('putBookOnShelf("", "Fiction")'), 'Say which book to move.');
assert.equal(ask('putBookOnShelf("Dune", "")'), 'Say which shelf to put it on.');
assert.equal(ask('putBookOnShelf("xyzzy", "Fiction")'), 'I found no book matching "xyzzy" in your library.');
assert.equal(ask('putBookOnShelf("Notes", "Nowhere")'), 'No shelf named "Nowhere" found.');

console.log('library voice style features checks passed.');
