/**
 * Test for voice-friendly library search helper.
 * Safe, local, no network.
 */
const assert = require('assert');

// Stub: in real integration this would query the encrypted library.
function searchLibrary(query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.toLowerCase();
  // Demo data for test; real impl uses core search.
  const books = [
    { title: 'Dune', author: 'Frank Herbert' },
    { title: 'Project Hail Mary', author: 'Andy Weir' },
    { title: 'The Martian', author: 'Andy Weir' },
  ];
  return books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
}

assert.deepEqual(searchLibrary('dune'), [{ title: 'Dune', author: 'Frank Herbert' }]);
assert.deepEqual(searchLibrary('weir').length, 2);
assert.deepEqual(searchLibrary(''), []);

console.log('voice-library-search tests passed');
