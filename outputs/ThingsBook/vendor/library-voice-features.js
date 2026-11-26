/**
 * Library Voice Features for AnF Books (formerly ThingsBook).
 * Style features fitting a private book library.
 *
 * 1. Resume last reading
 * 2. Voice search
 * 3. Progress / time-left report
 */
export function whatWasIReading(library) {
  const last = library.sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))[0];
  if (!last) return 'You have no books in your library yet.';
  const pct = Math.round((last.progress || 0) * 100);
  return `You were last reading ${last.title} by ${last.author || 'unknown author'}, at ${pct} percent.`;
}

export function voiceSearch(library, query) {
  const q = (query || '').toLowerCase();
  const hits = library.filter(b =>
    (b.title || '').toLowerCase().includes(q) ||
    (b.author || '').toLowerCase().includes(q) ||
    (b.shelf || '').toLowerCase().includes(q)
  );
  if (hits.length === 0) return `No books matching "${query}".`;
  return `Found ${hits.length} book${hits.length > 1 ? 's' : ''}: ` + hits.slice(0, 3).map(b => b.title).join(', ') + (hits.length > 3 ? ' and more.' : '.');
}

export function readingProgress(book) {
  if (!book) return 'No book selected.';
  const pct = Math.round((book.progress || 0) * 100);
  const left = book.timeLeftMinutes ? `${book.timeLeftMinutes} minutes left` : 'time left unknown';
  return `${book.title} is ${pct} percent complete, ${left}.`;
}
