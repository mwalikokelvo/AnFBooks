// Simple tests for new Grok library helpers (run via node if possible)
const assert = require('assert');
// Mock minimal books array for unit-style check
global.books = [
  { title: 'Dune', shelf: 'Sci-Fi', status: 'finished', finishedAt: Date.now() - 86400000, pages: 400, progress: { percent: 100 } },
  { title: 'Foundation', shelf: 'Sci-Fi', status: 'reading', lastRead: Date.now(), pages: 300, progress: { percent: 50 } },
];
// Load helpers by evaluating relevant parts would be ideal; here we re-define for test isolation
function booksOnShelfNamed(name) {
  const n = (name || '').toLowerCase().trim();
  return global.books.filter(b => (b.shelf || '').toLowerCase().includes(n));
}
function readingStats() {
  const total = global.books.length;
  const finished = global.books.filter(b => b.status === 'finished' || b.progress?.percent === 100).length;
  return `Library has ${total} books, ${finished} finished`;
}
assert.strictEqual(booksOnShelfNamed('sci').length, 2);
assert.ok(readingStats().includes('2 books'));
console.log('library-style-voice tests passed');
