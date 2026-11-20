// Simple test for the reading streak / unfinished summary helper.
// Run with: node work/tests/reading-streak-helper.cjs

function readingStreakSummary(books, now = Date.now()) {
  if (!Array.isArray(books)) return { streak: 0, unfinished: 0, message: 'No library open.' };
  const unfinished = books.filter(b => b && (b.status === 'reading' || (b.progress && b.progress < 1))).length;
  // Very simple streak: count consecutive recent open days (mock; real impl would use lastOpened timestamps)
  const recent = books.filter(b => b && b.lastOpened && (now - b.lastOpened) < 3 * 86400000).length;
  const streak = Math.min(recent, 7);
  const message = unfinished
    ? `You have ${unfinished} book${unfinished === 1 ? '' : 's'} still in progress. Reading streak about ${streak} day${streak === 1 ? '' : 's'}.`
    : `No unfinished books. Reading streak about ${streak} day${streak === 1 ? '' : 's'}.`;
  return { streak, unfinished, message };
}

const sample = [
  { title: 'Book A', status: 'reading', progress: 0.3, lastOpened: Date.now() - 86400000 },
  { title: 'Book B', status: 'finished', progress: 1, lastOpened: Date.now() - 10 * 86400000 },
  { title: 'Book C', status: 'reading', progress: 0.1, lastOpened: Date.now() - 2 * 86400000 }
];

const result = readingStreakSummary(sample);
console.log(result);
if (result.unfinished !== 2) throw new Error('Expected 2 unfinished');
if (result.streak < 1) throw new Error('Expected positive streak');
console.log('reading-streak-helper test passed');
