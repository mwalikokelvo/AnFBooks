/**
 * "What was I reading?" assistant helper for AnF Books.
 * Finds the book with the most recent lastOpened timestamp and returns a spoken-style summary.
 * Call from a voice command, button, or Kevo-style integration.
 */
(function (global) {
  'use strict';

  function whatWasIReading(books) {
    if (!Array.isArray(books) || !books.length) {
      return 'You have no books in your library yet.';
    }
    const withProgress = books.filter(b => b.lastOpened || b.progress != null);
    if (!withProgress.length) {
      return 'You have not started reading any books yet.';
    }
    const latest = withProgress.reduce((a, b) => {
      const aTime = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
      const bTime = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
      return aTime > bTime ? a : b;
    });
    const progress = latest.progress != null ? Math.round(latest.progress * 100) : 0;
    const title = latest.title || 'an untitled book';
    const author = latest.author ? ` by ${latest.author}` : '';
    return `You were last reading ${title}${author}. You are about ${progress} percent through it.`;
  }

  global.ThingsWhatWasIReading = { whatWasIReading };
})(typeof window !== 'undefined' ? window : globalThis);
