// Tests for new library style features (Node + vm, same style as existing tests)
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8');
assert(source.includes('window.resumeLastBook = resumeLastBook;'), 'resumeLastBook exported');
assert(source.includes('window.booksFinishedThisMonth = booksFinishedThisMonth;'), 'booksFinishedThisMonth exported');
assert(source.includes('window.similarBooks = similarBooks;'), 'similarBooks exported');

// Minimal extraction of the new functions for isolated test
const start = source.indexOf('function resumeLastBook()');
const end = source.indexOf('function scheduleLibrarySearch');
const snippet = source.slice(start, end);

const books = [
  {id: '1', title: 'Dune', author: 'Frank Herbert', status: 'reading', lastRead: Date.now(), shelfId: 's1'},
  {id: '2', title: 'Dune Messiah', author: 'Frank Herbert', status: 'finished', lastRead: Date.now(), shelfId: 's1'},
  {id: '3', title: 'Neuromancer', author: 'William Gibson', status: 'unread', shelfId: 's2'},
];

const context = { books, lastBookInProgress: () => books[0] };
vm.createContext(context);
vm.runInContext(snippet, context);

assert(context.resumeLastBook().includes('Dune'), 'resume mentions the book');
assert(context.booksFinishedThisMonth().includes('1'), 'counts finished this month');
assert(context.similarBooks('dune').includes('Dune Messiah'), 'finds same-author book');

console.log('ThingsBook library style features: ok');
