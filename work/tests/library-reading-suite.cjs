// Tests for reading pace estimation, reading streak summary, and bookmark snippet helpers.
// Node only.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8').replace(/\r\n/g, '\n');
const line = start => { const found = source.split('\n').find(l => l.startsWith(start)); assert(found, `${start} is in app.js`); return found + '\n'; };

for (const name of ['readingPaceEstimate', 'readingStreakSummary', 'lastBookmarkSnippet']) {
  assert(source.includes(`window.${name} = ${name};`), `${name} is exported to window`);
}

const from = source.indexOf('\nfunction booksMatching(');
const to = source.indexOf('function scheduleLibrarySearch()');
assert(from > 0 && to > from, 'the library answers are in app.js');

const code = line('function lastBookInProgress(')
  + line('const timeLeft = ')
  + line('function readingMinutesLeft(')
  + line('function readingLeft(')
  + source.slice(from, to).replace(/window\.\w+ = \w+;/g, '');

const ask = (books, call) => {
  const context = { books, window: {} };
  vm.createContext(context);
  vm.runInContext(code, context);
  return vm.runInContext(call, context);
};

const now = 1732428000000; // Mock current timestamp
const dayMs = 86400000;

const library = [
  {
    title: 'Dune Messiah',
    author: 'Frank Herbert',
    status: 'reading',
    lastRead: now - 2 * dayMs,
    pages: 300,
    progress: { percent: 50 },
    excerpt: 'The spice expands consciousness across Arrakis.'
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    status: 'finished',
    lastRead: now - 10 * dayMs,
    pages: 500,
    progress: { percent: 100 },
    notes: 'A masterpiece of ecology and political ambition.'
  },
  {
    title: 'Neuromancer',
    author: 'William Gibson',
    status: 'unread',
    progress: { percent: 0 }
  },
  {
    title: 'NoPagesBook',
    author: 'Unknown',
    status: 'reading',
    lastRead: now - 3 * dayMs,
    progress: { percent: 20 }
  }
];

// --- 1. readingPaceEstimate ---
// 150 pages left in Dune Messiah @ 250 words/page = 37,500 words. At 250 wpm = 150 minutes (2 hours 30 minutes).
assert.equal(
  ask(library, 'readingPaceEstimate("messiah", 250)'),
  'At 250 words per minute, you have about 2 hours 30 minutes left in Dune Messiah by Frank Herbert.'
);

// Custom pace: 500 wpm = 75 minutes (1 hour 15 minutes).
assert.equal(
  ask(library, 'readingPaceEstimate("messiah", 500)'),
  'At 500 words per minute, you have about 1 hour 15 minutes left in Dune Messiah by Frank Herbert.'
);

// Finished book
assert.equal(
  ask(library, 'readingPaceEstimate("dune", 250)'),
  'You have already finished Dune by Frank Herbert.'
);

// Book without pages
assert.equal(
  ask(library, 'readingPaceEstimate("NoPagesBook")'),
  'I cannot estimate reading pace for NoPagesBook, because its page count is missing.'
);

// Book not found
assert.equal(
  ask(library, 'readingPaceEstimate("Solaris")'),
  'I found no book matching "Solaris" in your library.'
);

// --- 2. readingStreakSummary ---
// Dune Messiah (2 days ago) and NoPagesBook (3 days ago) read this week; Dune finished 10 days ago (this month)
assert.equal(
  ask(library, `readingStreakSummary(${now})`),
  'You read 2 books this week and finished 1 book this month. Keep up the momentum!'
);

// Empty library
assert.equal(ask([], `readingStreakSummary(${now})`), 'Your library is empty.');

// Inactive library (no books read in the past 30 days)
const oldLibrary = [{ title: 'Ancient', lastRead: now - 100 * dayMs, status: 'reading' }];
assert.equal(
  ask(oldLibrary, `readingStreakSummary(${now})`),
  'You have not read any books this week. Open a book to start a reading streak!'
);

// --- 3. lastBookmarkSnippet ---
// With excerpt
assert.equal(
  ask(library, 'lastBookmarkSnippet("messiah")'),
  'In Dune Messiah by Frank Herbert, your last bookmark note is: "The spice expands consciousness across Arrakis.".'
);

// With notes but no excerpt
assert.equal(
  ask(library, 'lastBookmarkSnippet("dune")'),
  'In Dune by Frank Herbert, your latest note is: "A masterpiece of ecology and political ambition.".'
);

// With no notes or excerpt: reports percentage
assert.equal(
  ask(library, 'lastBookmarkSnippet("NoPagesBook")'),
  'In NoPagesBook by Unknown, your last recorded position is 20 percent read.'
);

// Default to lastBookInProgress when no query provided
assert.equal(
  ask(library, 'lastBookmarkSnippet()'),
  'In Dune Messiah by Frank Herbert, your last bookmark note is: "The spice expands consciousness across Arrakis.".'
);

console.log('library-reading-suite checks passed successfully.');
