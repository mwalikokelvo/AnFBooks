// Library assistant helpers for voice/text queries in AnF Books.
// These stay local and use only the in-memory books list.

/**
 * Suggests the next book to read from the library.
 * Prefers an in-progress book (progress > 0 and < 100), then a high-rated unread one.
 * Returns a short spoken-style sentence or null if none.
 */
export function whatAmIReadingNext(books) {
  if (!Array.isArray(books) || books.length === 0) return null;
  const inProgress = books
    .filter(b => (b.progress || 0) > 0 && (b.progress || 0) < 100)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0) || (b.rating || 0) - (a.rating || 0));
  if (inProgress.length) {
    const book = inProgress[0];
    const pct = Math.round(book.progress || 0);
    return `You were reading ${book.title || 'a book'}${book.author ? ' by ' + book.author : ''}. You are ${pct} percent through it.`;
  }
  const unread = books
    .filter(b => !(b.progress || 0))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.added || 0) - (a.added || 0));
  if (unread.length) {
    const book = unread[0];
    return `You might start ${book.title || 'a book'}${book.author ? ' by ' + book.author : ''}.`;
  }
  return 'You have finished every book in the library.';
}
