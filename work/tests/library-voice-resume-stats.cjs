'use strict';
const assert = require('assert');

// Minimal smoke test for the three new library voice helpers.
// In the real app these are attached to window after books is populated.

function plural(n, word) { return `${n} ${word}${n === 1 ? '' : 's'}`; }
const spokenBy = book => book.author && book.author !== 'Unknown author' ? ` by ${book.author}` : '';

function listFinished(books) {
  const finished = books.filter(b => b.status === 'finished' || (b.progress?.percent || 0) >= 100);
  if (!finished.length) return books.length ? 'You have not finished any books yet.' : 'Your library is empty.';
  const list = finished.slice(0, 3).map(b => `${b.title}${spokenBy(b)}`).join('; ');
  return `You have finished ${plural(finished.length, 'book')}: ${list}.`;
}

function finishedThisMonth(books) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const count = books.filter(b => (b.status === 'finished' || (b.progress?.percent || 0) >= 100) && (b.lastRead || 0) >= start).length;
  return count ? `You finished ${plural(count, 'book')} this month.` : 'You have not finished any books this month yet.';
}

const sample = [
  { title: 'Dune', author: 'Frank Herbert', status: 'finished', progress: { percent: 100 }, lastRead: Date.now() },
  { title: 'Neuromancer', author: 'William Gibson', status: 'reading', progress: { percent: 40 }, lastRead: Date.now() - 86400000 },
];

assert(listFinished(sample).includes('Dune'));
assert(listFinished([]).includes('empty'));
assert(finishedThisMonth(sample).includes('1 book'));
assert(finishedThisMonth([]).includes('not finished'));

console.log('ThingsBook voice helpers smoke test passed');
