// Test the three new library voice helpers by extracting and running them in a sandbox.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const appSrc = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8');
const start = appSrc.indexOf('function lastBookInProgress');
const end = appSrc.indexOf('function booksMatching');
assert(start > 0 && end > start, 'helpers section found');
const helpers = appSrc.slice(start, end);

const sandbox = {
  books: [
    { id: '1', title: 'Dune', author: 'Frank Herbert', progress: { percent: 40 }, status: 'reading', lastRead: Date.now(), shelf: 's1' },
    { id: '2', title: 'Neuromancer', author: 'William Gibson', progress: { percent: 0 }, status: 'unread', lastRead: 0, shelf: 's1' },
  ],
  shelves: [{ id: 's1', name: 'Sci-Fi' }],
  lastBookInProgress: () => sandbox.books[0],
  booksMatching: (q) => sandbox.books.filter(b => b.title.toLowerCase().includes(q.toLowerCase())),
  window: {},
};
vm.createContext(sandbox);
vm.runInContext(helpers + '\nwindow.voiceSearchLibrary = voiceSearchLibrary; window.timeLeftInBook = timeLeftInBook; window.booksOnShelf = booksOnShelf;', sandbox);

assert(sandbox.window.voiceSearchLibrary('Dune').includes('Dune'));
assert(sandbox.window.timeLeftInBook('Dune').includes('hours'));
assert(sandbox.window.booksOnShelf('Sci-Fi').includes('Dune'));
console.log('library-voice-extras tests passed');
