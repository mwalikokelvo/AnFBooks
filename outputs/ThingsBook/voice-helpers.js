/**
 * Voice helpers for AnF Books library assistant features.
 * Fits book library: voice search, read-aloud, "what was I reading".
 * Local only; no external APIs required.
 */

/** Returns a spoken sentence for "continue reading" or similar. */
export function continueReadingSpoken(books, continueCardBook) {
  if (!continueCardBook) return 'You have no book open to continue.';
  const title = continueCardBook.title || 'a book';
  const progress = continueCardBook.progress != null ? ` You are ${Math.round(continueCardBook.progress)} percent through.` : '';
  return `Continuing ${title}.${progress}`;
}

/** Simple voice search filter over local books. */
export function voiceSearchBooks(books, query) {
  if (!query || !books) return [];
  const q = query.toLowerCase();
  return books.filter(b =>
    (b.title || '').toLowerCase().includes(q) ||
    (b.author || '').toLowerCase().includes(q) ||
    (b.tags || []).some(t => t.toLowerCase().includes(q))
  ).slice(0, 5);
}
