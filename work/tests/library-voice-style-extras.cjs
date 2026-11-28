/**
 * Tests for new ThingsBook library voice style features.
 * booksByGenre, readingStats, markFavorite.
 */

const assert = require('assert');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '../outputs/ThingsBook/app.js'), 'utf8');

function pick(name) {
  const start = source.indexOf(`function ${name}`);
  const end = source.indexOf(`window.${name}`, start);
  return source.slice(start, end + `window.${name} = ${name};`.length);
}

const library = [
  { id: '1', title: 'Dune', author: 'Herbert', genre: 'sci-fi', status: 'reading', progress: { percent: 40 } },
  { id: '2', title: 'Foundation', author: 'Asimov', genre: 'sci-fi', status: 'finished' },
  { id: '3', title: 'Pride and Prejudice', author: 'Austen', genre: 'romance', status: 'unread' },
];

function run(fnSource, books = library) {
  const context = { books, lastBookInProgress: () => books[0], booksMatching: (q) => books.filter(b => b.title.toLowerCase().includes(q.toLowerCase())) };
  vm.createContext(context);
  vm.runInContext(fnSource, context);
  return context;
}

const ctx = run(pick('booksByGenre') + pick('readingStats') + pick('markFavorite'));

assert(ctx.booksByGenre('sci-fi').includes('Found 2'));
assert(ctx.readingStats().includes('3 books'));
assert(ctx.markFavorite('Dune').includes('favorite'));
console.log('ThingsBook new voice style features checks passed.');
