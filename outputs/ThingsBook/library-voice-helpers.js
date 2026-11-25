/**
 * Library voice helpers for AnF Books (ThingsBook).
 * Pure functions over the in-memory books array.
 */

function searchLibrary(books, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return books.slice(0, 10);
  return books.filter((b) =>
    (b.title || '').toLowerCase().includes(q) ||
    (b.author || '').toLowerCase().includes(q) ||
    (b.shelf || '').toLowerCase().includes(q)
  ).slice(0, 10);
}

function formatSearchResults(results) {
  if (results.length === 0) return 'No books matched that search in your library.';
  const lines = results.map((b, i) => `${i + 1}. ${b.title || 'Untitled'} by ${b.author || 'Unknown'}${b.progress != null ? `, ${Math.round(b.progress)}% done` : ''}`);
  return `Found ${results.length} book${results.length === 1 ? '' : 's'}: ${lines.join('; ')}.`;
}

function getReadingStats(books) {
  const total = books.length;
  const finished = books.filter((b) => b.finished || (b.progress || 0) >= 100).length;
  const inProgress = books.filter((b) => (b.progress || 0) > 0 && (b.progress || 0) < 100).length;
  const unread = total - finished - inProgress;
  const avg = total ? Math.round(books.reduce((s, b) => s + (b.progress || 0), 0) / total) : 0;
  return `Library stats: ${total} books total, ${finished} finished, ${inProgress} in progress, ${unread} unread. Average progress ${avg} percent.`;
}

function whatWasIReading(books) {
  const recent = books
    .filter((b) => b.lastOpened)
    .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))[0];
  if (!recent) return 'You have not opened any books recently.';
  const when = recent.lastOpened ? new Date(recent.lastOpened).toLocaleDateString() : 'unknown';
  return `You were last reading "${recent.title || 'Untitled'}" by ${recent.author || 'Unknown'}, opened on ${when}, at ${Math.round(recent.progress || 0)} percent.`;
}

function recommendNext(books) {
  const unfinished = books.filter((b) => (b.progress || 0) > 0 && (b.progress || 0) < 100);
  if (unfinished.length === 0) {
    const any = books.find((b) => !(b.finished || (b.progress || 0) >= 100));
    return any ? `You might start "${any.title || 'Untitled'}".` : 'All your books appear finished. Time for a new one.';
  }
  const next = unfinished.sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];
  return `Continue with "${next.title || 'Untitled'}" by ${next.author || 'Unknown'}, already ${Math.round(next.progress || 0)} percent done.`;
}

module.exports = { searchLibrary, formatSearchResults, getReadingStats, whatWasIReading, recommendNext };
