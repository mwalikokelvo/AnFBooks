/**
 * Test for the library status assistant helpers.
 * node work/tests/library-status.test.cjs
 */

const assert = require('assert');
const { libraryStatus, whatWasIReading } = require('../../outputs/ThingsBook/library-status.js');

const empty = libraryStatus([], []);
assert.strictEqual(empty.totalBooks, 0);
assert.ok(empty.summary.includes('empty'));

const books = [
  { title: 'Dune', lastOpened: 100, progress: 40 },
  { title: 'Neuromancer', lastOpened: 200, progress: 10 },
];
const status = libraryStatus(books, [{ name: 'Sci-Fi' }]);
assert.strictEqual(status.totalBooks, 2);
assert.strictEqual(status.lastReadTitle, 'Neuromancer');

const was = whatWasIReading(books);
assert.ok(was.includes('Neuromancer'));
assert.ok(was.includes('10%'));

console.log('PASS: library-status helpers');
