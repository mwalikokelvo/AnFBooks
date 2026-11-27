/**
 * Voice library search helpers for AnF Books.
 * "search my library for X", "books by author Y", "what was I reading".
 * Operate on local library data; no network.
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  progress: number; // 0-100
  lastOpened?: number;
  shelf?: string;
}

export function searchLibrary(books: Book[], query: string): Book[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    (b.shelf && b.shelf.toLowerCase().includes(q))
  ).slice(0, 10);
}

export function whatWasIReading(books: Book[]): string {
  const recent = books
    .filter(b => b.lastOpened && b.progress > 0 && b.progress < 100)
    .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))[0];
  if (!recent) return 'You have no unfinished books recently opened.';
  return `You were reading ${recent.title} by ${recent.author}, at ${Math.round(recent.progress)} percent.`;
}

export function booksByAuthor(books: Book[], author: string): Book[] {
  const a = author.toLowerCase();
  return books.filter(b => b.author.toLowerCase().includes(a));
}
