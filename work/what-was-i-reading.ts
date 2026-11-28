/**
 * ThingsBook — “What was I reading?”
 * Returns the most recently opened unfinished book + progress + suggestion to resume.
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  progress?: number; // 0-100
  lastOpened?: number;
  finished?: boolean;
}

export function whatWasIReading(books: Book[]): { book: Book | null; speech: string } {
  const candidates = books
    .filter(b => !b.finished && (b.progress ?? 0) < 100 && b.lastOpened)
    .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0));
  const book = candidates[0] || null;
  if (!book) return { book: null, speech: 'You have no unfinished books open recently. Would you like a recommendation?' };
  const pct = Math.round(book.progress || 0);
  return {
    book,
    speech: `You were last reading ${book.title} by ${book.author}, about ${pct} percent through. Shall I resume?`,
  };
}
