/**
 * ThingsBook library voice helpers (pure, no side effects).
 * Style features that fit a private book library.
 */

/** "What was I reading?" — returns the most recently opened unfinished book. */
export function whatWasIReading(books) {
  const reading = books
    .filter(b => b.status === 'reading' || (b.progress > 0 && b.progress < 1))
    .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0));
  if (!reading.length) return { text: 'You have no unfinished books open right now.', book: null };
  const b = reading[0];
  const pct = Math.round((b.progress || 0) * 100);
  return {
    text: `You were last reading "${b.title}" by ${b.author || 'unknown author'}, at ${pct} percent.`,
    book: b,
  };
}

/** Voice search of the library by title, author or notes. */
export function voiceSearchLibrary(books, query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return [];
  return books.filter(b =>
    `${b.title} ${b.author || ''} ${b.notes || ''} ${b.series || ''}`.toLowerCase().includes(q)
  ).slice(0, 5);
}

/** Read-aloud progress announcement. */
export function readAloudProgress(book) {
  if (!book) return 'No book is open.';
  const pct = Math.round((book.progress || 0) * 100);
  const left = book.timeLeft ? ` About ${book.timeLeft} left.` : '';
  return `"${book.title}" is ${pct} percent complete.${left}`;
}
