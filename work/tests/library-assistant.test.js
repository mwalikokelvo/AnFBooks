import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { whatWasIReading, searchLibrary } from '../lib/library-assistant.js';

describe('Library assistant', () => {
  const books = [
    { title: 'Dune', author: 'Frank Herbert', lastRead: 1000, progress: { percent: 45 }, status: 'reading' },
    { title: '1984', author: 'George Orwell', lastRead: 2000, progress: { percent: 10 }, status: 'reading' },
    { title: 'Finished Book', lastRead: 3000, progress: { percent: 100 }, status: 'finished' },
  ];

  it('reports the most recently read in-progress book', () => {
    assert.equal(whatWasIReading(books), 'You were reading 1984 by George Orwell, 10 percent read.');
    assert.equal(whatWasIReading([]), 'You have no books in your library.');
    assert.equal(whatWasIReading([{ title: 'Done', progress: { percent: 100 }, status: 'finished' }]), 'You have no books in progress.');
  });

  it('searches by title or author', () => {
    const results = searchLibrary(books, 'dune');
    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'Dune');
    assert.equal(searchLibrary(books, 'orwell').length, 1);
    assert.equal(searchLibrary(books, 'xyz').length, 0);
  });
});
