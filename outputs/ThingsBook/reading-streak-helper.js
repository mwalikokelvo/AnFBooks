// Assistant helper: reading streak and unfinished books summary.
// Can be called from voice command or script. Pure, local only.

function readingStreakSummary(books, now = Date.now()) {
  if (!Array.isArray(books)) return { streak: 0, unfinished: 0, message: 'No library open.' };
  const unfinished = books.filter(b => b && (b.status === 'reading' || (typeof b.progress === 'number' && b.progress < 1))).length;
  const recentDays = new Set();
  for (const b of books) {
    if (b && b.lastOpened) {
      const day = Math.floor(b.lastOpened / 86400000);
      if (now / 86400000 - day < 14) recentDays.add(day);
    }
  }
  const streak = Math.min(recentDays.size, 30);
  const message = unfinished
    ? `You have ${unfinished} book${unfinished === 1 ? '' : 's'} still in progress. About ${streak} day${streak === 1 ? '' : 's'} with recent reading activity.`
    : `No unfinished books right now. About ${streak} day${streak === 1 ? '' : 's'} with recent reading activity.`;
  return { streak, unfinished, message };
}

// Expose for the app if loaded
if (typeof window !== 'undefined') window.readingStreakSummary = readingStreakSummary;
if (typeof module !== 'undefined') module.exports = { readingStreakSummary };
