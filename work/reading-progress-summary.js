// readingProgressSummary(): one sentence about progress on the book in progress.
// Suitable for a voice assistant or script. Mirrors the style of whatWasIReading.
'use strict';

function lastBookInProgress(books) {
  if (!Array.isArray(books)) return null;
  const candidates = books.filter(b => b && b.progress && typeof b.progress.percent === 'number' && b.progress.percent > 0 && b.progress.percent < 100 && b.status !== 'finished');
  if (!candidates.length) return null;
  return candidates.sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0))[0];
}

function readingProgressSummary(books) {
  const book = lastBookInProgress(books);
  if (!book) return 'You have no books in progress.';
  const pct = Math.round(book.progress.percent);
  const author = book.author && book.author !== 'Unknown author' ? ` by ${book.author}` : '';
  return `You are ${pct} percent through ${book.title}${author}.`;
}

// For Node tests / scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { lastBookInProgress, readingProgressSummary };
}
