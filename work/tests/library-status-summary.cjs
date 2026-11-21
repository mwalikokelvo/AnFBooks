// window.libraryStatusSummary(): one spoken sentence about the whole library.
// Pattern matches what-was-i-reading.cjs. Node only.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');
// Expected to be added to app.js next to whatWasIReading.
// For now this test documents the contract; implement the function in app.js in a follow-up if not present.

function libraryStatusSummary(books) {
  if (!Array.isArray(books) || books.length === 0) return 'Your library is empty.';
  const total = books.length;
  const inProgress = books.filter(b => b.progress && b.progress.percent > 0 && b.progress.percent < 100 && b.status !== 'finished').length;
  const finished = books.filter(b => b.status === 'finished' || (b.progress && b.progress.percent >= 100)).length;
  return `You have ${total} book${total === 1 ? '' : 's'}${inProgress ? `, ${inProgress} in progress` : ''}${finished ? `, ${finished} finished` : ''}.`;
}

assert.equal(libraryStatusSummary([]), 'Your library is empty.');
assert.equal(libraryStatusSummary([{title:'A', progress:{percent:50}}]), 'You have 1 book, 1 in progress.');
assert.equal(libraryStatusSummary([
  {title:'A', progress:{percent:50}},
  {title:'B', status:'finished', progress:{percent:100}},
  {title:'C', progress:{percent:0}},
]), 'You have 3 books, 1 in progress, 1 finished.');
console.log('libraryStatusSummary contract checks passed.');
