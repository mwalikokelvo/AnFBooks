/**
 * ThingsBook / AnF Books library voice helpers.
 * Style features that fit a private book library:
 * 1. Voice search of the library (by title, author, shelf)
 * 2. "What was I reading" — last opened book + progress
 * 3. Read-aloud enhancements: spoken progress, next chapter cue, speed suggestion
 *
 * Inspired by voice assistants and reader apps (public behavior of Siri/Alexa book queries,
 * KOReader progress, read-aloud in many apps). Implemented from scratch.
 */

export interface BookMeta {
  id: string;
  title: string;
  author: string;
  shelf?: string;
  progress: number; // 0-100
  lastOpened?: number; // timestamp
  pages?: number;
  currentPage?: number;
}

export function searchLibrary(query: string, books: BookMeta[]): BookMeta[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    (b.shelf || '').toLowerCase().includes(q)
  ).sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0));
}

export function whatWasIReading(books: BookMeta[]): BookMeta | null {
  if (!books.length) return null;
  return [...books].sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))[0];
}

export function formatWhatWasIReading(book: BookMeta | null): string {
  if (!book) return "You haven't opened any books recently.";
  return `You were last reading "${book.title}" by ${book.author}, at ${Math.round(book.progress)}% progress${book.currentPage ? `, around page ${book.currentPage}` : ''}.`;
}

export function suggestReadAloud(book: BookMeta, currentSpeed = 1.0): string {
  const remaining = 100 - book.progress;
  let suggestion = `Continuing "${book.title}" at ${Math.round(book.progress)}%. `;
  if (remaining < 10) suggestion += "You're almost finished. ";
  if (currentSpeed < 1.2) suggestion += "You could try a slightly faster read-aloud speed for the remaining pages.";
  else suggestion += "Current speed looks comfortable.";
  return suggestion;
}

export function markFinishedByVoice(bookId: string, books: BookMeta[]): BookMeta[] {
  return books.map(b => b.id === bookId ? { ...b, progress: 100 } : b);
}
