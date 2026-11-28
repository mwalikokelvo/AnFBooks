/**
 * Voice/script library features for AnF Books (formerly ThingsBook).
 * Added on grok/ branch. Matches public library assistant behaviors (e.g. "how many books have I finished").
 *
 * Differences from commercial: uses local library data only, no cloud sync for stats.
 */
(function () {
  window.readingStats = function () {
    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const finishedThisMonth = (window.books || []).filter(b => b.status === 'finished' && b.finishedAt > monthAgo).length;
    const totalPages = (window.books || []).reduce((sum, b) => sum + (b.pages || 0), 0);
    return `You finished ${finishedThisMonth} books this month. Your library has about ${totalPages} pages in total.`;
  };

  window.searchHighlights = function (query) {
    if (!query) return 'Please say what to search for in your highlights.';
    const matches = (window.books || []).flatMap(b => (b.notes || '').includes(query) ? [b.title] : []);
    return matches.length ? `Highlights matching "${query}" in: ${matches.slice(0, 3).join(', ')}.` : 'No matching highlights found.';
  };

  window.continueReadingEstimate = function () {
    const current = window.lastBookInProgress ? window.lastBookInProgress() : null;
    if (!current) return 'You have no book in progress.';
    const percent = current.progress?.percent || 0;
    const pagesLeft = Math.round((current.pages || 300) * (1 - percent / 100));
    const minutes = pagesLeft * 2; // rough 2 min/page
    return `You were reading ${current.title}. About ${pagesLeft} pages left, roughly ${minutes} minutes.`;
  };
})();
