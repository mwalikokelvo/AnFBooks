// Tests for readingProgressSummary
'use strict';
const assert = require('node:assert/strict');
const { readingProgressSummary } = require('../reading-progress-summary.js');

assert.equal(readingProgressSummary([]), 'You have no books in progress.');
assert.equal(readingProgressSummary([
  { title: 'Old', author: 'A', lastRead: 1, progress: { percent: 40 } },
  { title: 'Dune', author: 'Frank Herbert', lastRead: 5, progress: { percent: 62.4 } },
  { title: 'Done', author: 'C', lastRead: 9, status: 'finished', progress: { percent: 80 } },
]), 'You are 62 percent through Dune by Frank Herbert.');
assert.equal(readingProgressSummary([{ title: 'Notes', lastRead: 2 }]), 'You have no books in progress.');
console.log('readingProgressSummary checks passed.');
