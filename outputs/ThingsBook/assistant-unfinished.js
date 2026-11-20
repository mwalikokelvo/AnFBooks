// Assistant helper: count unfinished books.
// Safe to call from voice or scripts. Assumes global 'books' array exists after unlock.

function unfinishedBooksCount() {
  if (!Array.isArray(books)) return 0;
  return books.filter(b => {
    const p = Number(b.progress) || 0;
    return p < 100;
  }).length;
}

// Expose for voice/script use
if (typeof window !== 'undefined') {
  window.unfinishedBooksCount = unfinishedBooksCount;
}

// Simple self-check
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { unfinishedBooksCount };
}
