/**
 * ThingsBook assistant-style helper: recent reading summary.
 * Pure function, no side effects. Fits local-first library.
 * "What was I reading?" style query over the books array.
 */
function recentReadingSummary(books, limit = 3) {
  if (!Array.isArray(books) || !books.length) return 'You have no books in the library yet.';
  const recent = books
    .filter(b => b && (b.lastRead || b.progress))
    .sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0))
    .slice(0, limit);
  if (!recent.length) return 'No recent reading progress recorded.';
  const lines = recent.map(b => {
    const pct = Math.round((b.progress && b.progress.percent) || 0);
    const when = b.lastRead ? new Date(b.lastRead).toLocaleDateString() : 'unknown';
    return (b.title || 'Untitled') + ' by ' + (b.author || 'Unknown') + ' (' + pct + '%, last ' + when + ')';
  });
  return 'You were reading: ' + lines.join('; ') + '.';
}
module.exports = { recentReadingSummary };
