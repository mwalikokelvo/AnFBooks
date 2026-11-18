const assert = require('assert');
const { continueReadingSpoken, voiceSearchBooks } = require('../../outputs/ThingsBook/voice-helpers.js');

const books = [
  { title: 'History of Rome', author: 'Author', progress: 42, tags: ['history'] },
  { title: 'Fiction Novel', author: 'Other', progress: 10 },
];

assert.strictEqual(continueReadingSpoken(books, books[0]), 'Continuing History of Rome. You are 42 percent through.');
assert.strictEqual(continueReadingSpoken(books, null), 'You have no book open to continue.');

const results = voiceSearchBooks(books, 'history');
assert.strictEqual(results.length, 1);
assert.strictEqual(results[0].title, 'History of Rome');

console.log('voice-helpers tests passed');
