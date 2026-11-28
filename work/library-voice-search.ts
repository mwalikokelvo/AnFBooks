/**
 * ThingsBook / AnF Books — Voice library search.
 * “Find books by author X” / “search my library for …”
 * Matches title, author, shelf, tags. Local only.
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  shelf?: string;
  progress?: number;
  lastOpened?: number;
}

export function searchLibrary(books: Book[], query: string): Book[] {
  if (!query?.trim()) return [];
  const q = query.toLowerCase();
  return books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    (b.shelf && b.shelf.toLowerCase().includes(q))
  ).slice(0, 10);
}

export function formatSearchResults(results: Book[]): string {
  if (!results.length) return 'I could not find any books matching that in your library.';
  const list = results.map(b => `${b.title} by ${b.author}${b.progress != null ? ` (${Math.round(b.progress)}% )` : ''}`).join('; ');
  return `I found ${results.length} book${results.length > 1 ? 's' : ''}: ${list}.`;
}
