/**
 * Assistant-style helpers for the AnF Books library.
 * Pure functions so they can be tested and called from voice or UI.
 * "what was I reading" and simple title search.
 */

export function whatWasIReading(books) {
  if (!Array.isArray(books) || books.length === 0) return 'You have no books in your library.';
  const recent = [...books]
    .filter(b => b.lastRead && b.status !== 'finished' && (b.progress?.percent ?? 0) !== 100)
    .sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0))[0];
  if (!recent) return 'You have no books in progress.';
  const by = recent.author ? ` by ${recent.author}` : '';
  const pct = Math.round(recent.progress?.percent || 0);
  return `You were reading ${recent.title}${by}, ${pct} percent read.`;
}

export function searchLibrary(books, query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return (books || []).filter(b =>
    (b.title && b.title.toLowerCase().includes(q)) ||
    (b.author && b.author.toLowerCase().includes(q)) ||
    (b.series && b.series.toLowerCase().includes(q))
  ).slice(0, 10);
}
