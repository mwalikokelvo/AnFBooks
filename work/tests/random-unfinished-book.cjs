// "Suggest a random unfinished book" for a voice assistant or script. From Grok.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');
assert(source.includes('function randomUnfinishedBook('), 'randomUnfinishedBook is in app.js');
assert(source.includes('window.randomUnfinishedBook = randomUnfinishedBook;'), 'exported');
const from = source.indexOf('function randomUnfinishedBook(');
const to = source.indexOf('window.randomUnfinishedBook = randomUnfinishedBook;') + 'window.randomUnfinishedBook = randomUnfinishedBook;'.length;
const code = source.slice(from, to);
const ask = (books, call) => { const context = {books, window: {}, unfinishedPercent: b => Math.min(99, Math.round(b.progress?.percent || 0)), spokenBy: b => b.author ? ` by ${b.author}` : ''}; vm.createContext(context); vm.runInContext(code, context); return vm.runInContext(call, context); };

const library = [
  {title:'Dune', author:'Frank Herbert', status:'reading', progress:{percent:50}},
  {title:'Neuromancer', status:'unread', progress:{percent:0}},
];
const answer = ask(library, 'randomUnfinishedBook()');
assert.match(answer, /How about (Dune by Frank Herbert, 50 percent read|Neuromancer, not started)\?/);
assert.equal(ask([], 'randomUnfinishedBook()'), 'Your library is empty.');
assert.equal(ask([{title:'Done', status:'finished', progress:{percent:100}}], 'randomUnfinishedBook()'), 'You have finished every book in your library.');
console.log('randomUnfinishedBook tests passed');
