/**
 * Voice-oriented library helpers for AnF Books (ThingsBook).
 * Pure functions over the in-memory `books` array.
 * Three positive capabilities:
 * 1. searchLibrary(query) - ranked title/author matches for voice search
 * 2. whatWasIReading() - last unfinished book with progress
 * 3. readingStats() - finished this month + average progress
 */

function normalize(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

export function searchLibrary(books, query) {
  const q = normalize(query);
  if (!q) return [];
  return books
    .map(b => {
      const title = normalize(b.title || b.name || '');
      const author = normalize(b.author || '');
      const score = (title.includes(q) ? 3 : 0) + (author.includes(q) ? 2 : 0) + (title.startsWith(q) ? 1 : 0);
      return { book: b, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(x => x.book);
}

export function whatWasIReading(books) {
  const unfinished = books.filter(b => (b.progress || 0) < 100 && b.lastOpened);
  if (!unfinished.length) return null;
  unfinished.sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0));
  const b = unfinished[0];
  return {
    title: b.title || b.name || 'Unknown',
    author: b.author || 'Unknown author',
    progress: Math.round(b.progress || 0),
    lastOpened: b.lastOpened,
  };
}

export function readingStats(books, now = new Date()) {
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const finishedThisMonth = books.filter(b => (b.progress || 0) >= 100 && (b.finishedAt || b.lastOpened || 0) >= startOfMonth).length;
  const withProgress = books.filter(b => typeof b.progress === 'number');
  const avg = withProgress.length ? Math.round(withProgress.reduce((s, b) => s + b.progress, 0) / withProgress.length) : 0;
  return { finishedThisMonth, averageProgress: avg, totalBooks: books.length };
}
