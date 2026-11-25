// Three library style features for AnF Books (formerly ThingsBook)
// Voice-oriented helpers that can be called from the main app or Kevo integration.

/**
 * 1. What was I reading? — returns the most recently opened unfinished book.
 */
export function whatWasIReading(books) {
  const recent = (books || [])
    .filter(b => b.status !== 'finished' && b.lastOpened)
    .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))[0];
  if (!recent) return 'You have no unfinished books with a recent reading position.';
  const progress = recent.progress ? Math.round(recent.progress * 100) + '%' : 'unknown progress';
  return `You were last reading "${recent.title}" by ${recent.author || 'Unknown'}. Progress: ${progress}.`;
}

/**
 * 2. Voice search of the library — simple title/author match.
 */
export function voiceSearchLibrary(books, query) {
  if (!query || !query.trim()) return 'What would you like me to search for in your library?';
  const q = query.toLowerCase();
  const matches = (books || []).filter(b =>
    (b.title || '').toLowerCase().includes(q) ||
    (b.author || '').toLowerCase().includes(q) ||
    (b.series || '').toLowerCase().includes(q)
  );
  if (!matches.length) return `No books in your library match "${query}".`;
  return `Found ${matches.length} book${matches.length === 1 ? '' : 's'}: ` +
    matches.slice(0, 3).map(b => `"${b.title}" by ${b.author || 'Unknown'}`).join(', ') +
    (matches.length > 3 ? ' and more.' : '.');
}

/**
 * 3. Reading time left estimate (rough, based on remaining pages or progress).
 */
export function readingTimeLeft(book, wordsPerMinute = 250) {
  if (!book) return 'No book selected.';
  const pages = book.pages || 300; // fallback
  const progress = book.progress || 0;
  const remainingPages = Math.max(0, pages * (1 - progress));
  const minutes = Math.round(remainingPages * 250 / wordsPerMinute); // rough 250 words/page
  if (minutes < 1) return `You have finished or nearly finished "${book.title}".`;
  return `About ${minutes} minutes left in "${book.title}" at ${wordsPerMinute} words per minute.`;
}

// Expose for plain script inclusion if needed
if (typeof window !== 'undefined') {
  window.AnFBooksVoiceExtras = { whatWasIReading, voiceSearchLibrary, readingTimeLeft };
}
