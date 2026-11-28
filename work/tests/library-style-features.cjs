// Style features for the book library: mostReadAuthor, seriesProgress, voiceBookmark.
// Runs against fixture data. Node only.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');

// Extract the relevant functions (simple approach: include the new ones and helpers they need)
const helpers = `
function lastBookInProgress(){return [...books].filter(b => b.lastRead && b.status !== 'finished' && b.progress?.percent!==100).sort((a,b) => b.lastRead-a.lastRead)[0];}
function booksMatching(query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return [];
  const found = books.filter(b => [b.title, b.author, b.series].some(v => v && v.toLowerCase().includes(q)));
  return found.sort((a,b) => (b.title?.toLowerCase() === q) - (a.title?.toLowerCase() === q) || (b.lastRead || 0) - (a.lastRead || 0));
}
`;

// Pull the three new functions from source
function extractFn(name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(name + ' not found');
  let depth = 0, i = start;
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') { depth--; if (depth === 0) return source.slice(start, i + 1); }
  }
  throw new Error('unclosed ' + name);
}

const code = helpers + extractFn('mostReadAuthor') + extractFn('seriesProgress') + extractFn('voiceBookmark');

const ask = (books, call) => {
  const context = { books, window: {} };
  vm.createContext(context);
  vm.runInContext(code, context);
  return vm.runInContext(call, context);
};

const library = [
  { id: 'b1', title: 'Dune', author: 'Frank Herbert', series: 'Dune', status: 'reading', progress: { percent: 40 }, lastRead: 10 },
  { id: 'b2', title: 'Dune Messiah', author: 'Frank Herbert', series: 'Dune', status: 'finished', progress: { percent: 100 } },
  { id: 'b3', title: 'Neuromancer', author: 'William Gibson', status: 'unread', progress: { percent: 0 } },
];

assert(ask(library, 'mostReadAuthor()').includes('Frank Herbert'), 'most read author');
assert(ask(library, 'seriesProgress("Dune")').includes('1 of 2'), 'series progress');
const bookmarkResult = ask(library, 'voiceBookmark("Dune", "great chapter")');
assert(bookmarkResult.includes('Bookmarked'), 'voice bookmark');
console.log('library-style-features tests passed');
