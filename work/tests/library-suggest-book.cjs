// Test for suggestBook (Grok): offline suggestion of an unread or lightly started book.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8');
const from = source.indexOf('function suggestBook()');
assert(from > 0, 'suggestBook is in app.js');
const code = source.slice(from, source.indexOf('function librarySummary()'));
const ask = (books, call) => {
  const context = { books, Math };
  vm.createContext(context);
  vm.runInContext(code, context);
  return vm.runInContext(call, context);
};

const library = [
  { title: 'Dune', author: 'Frank Herbert', status: 'reading', progress: { percent: 62 } },
  { title: 'Neuromancer', author: 'William Gibson', status: 'unread', progress: { percent: 0 } },
  { title: 'Finished', author: 'Someone', status: 'finished', progress: { percent: 100 } },
];

const suggestion = ask(library, 'suggestBook()');
assert(suggestion.includes('Neuromancer'), 'suggests the unread book');
assert(suggestion.includes('0 percent'), 'includes progress');

const allDone = ask([{ title: 'Done', status: 'finished', progress: { percent: 100 } }], 'suggestBook()');
assert(allDone.includes('well underway'), 'handles finished library');

console.log('library suggest book checks passed.');
