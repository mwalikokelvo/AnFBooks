const { booksByAuthor } = require('../library-books-by-author');
const assert = require('assert');

const sample = [
  { title: 'Dune', author: 'Frank Herbert' },
  { title: 'Dune Messiah', author: 'Frank Herbert' },
  { title: 'Children of Dune', author: 'Frank Herbert' },
  { title: 'Foundation', author: 'Isaac Asimov' },
];

assert.ok(booksByAuthor(sample, 'Herbert').includes('Dune'));
assert.ok(booksByAuthor(sample, 'Asimov').includes('Foundation'));
assert.ok(booksByAuthor(sample, 'Unknown').includes('no books'));
console.log('booksByAuthor tests passed');
