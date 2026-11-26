/**
 * Voice-oriented library helpers for AnF Books.
 * Designed for spoken commands and style features that fit a private book library.
 */

export interface BookLike {
  title: string;
  author?: string;
  progress?: number; // 0-100
  lastOpened?: number; // timestamp
  shelf?: string;
}

/** Simple voice search: matches title or author, case-insensitive, returns top hits. */
export function voiceSearchLibrary(books: BookLike[], query: string, limit = 5): BookLike[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return books
    .filter(b => b.title.toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q))
    .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))
    .slice(0, limit);
}

/** "What was I reading?" — the most recently opened unfinished book. */
export function whatWasIReading(books: BookLike[]): BookLike | null {
  return books
    .filter(b => (b.progress ?? 0) < 100)
    .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))[0] ?? null;
}

/** Spoken progress summary. */
export function progressSummary(book: BookLike | null): string {
  if (!book) return 'You have no unfinished books open recently.';
  const pct = Math.round(book.progress ?? 0);
  const author = book.author ? ` by ${book.author}` : '';
  return `You were reading ${book.title}${author}. You are ${pct} percent through.`;
}

/** Formats search results for speech. */
export function formatSearchResults(results: BookLike[]): string {
  if (!results.length) return 'I found nothing matching that in your library.';
  return `I found ${results.length} book${results.length > 1 ? 's' : ''}: ${results.map(b => b.title).join(', ')}.`;
}
