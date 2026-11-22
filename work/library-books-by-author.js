/**
 * Library assistant helper: books by a given author.
 * Returns a short spoken-style sentence listing up to three books.
 * For use by Kevo / voice or scripts, matching other window.* helpers.
 */

function booksByAuthor(books, authorQuery) {
  if (!authorQuery || !authorQuery.trim()) return 'Which author, sir?';
  const q = authorQuery.toLowerCase().trim();
  const matches = (books || []).filter(b => (b.author || '').toLowerCase().includes(q)).slice(0, 3);
  if (matches.length === 0) return `You have no books by ${authorQuery}, sir.`;
  const titles = matches.map(b => b.title || 'Untitled').join(', ');
  const more = matches.length < (books.filter(b => (b.author || '').toLowerCase().includes(q)).length) ? ' and more' : '';
  return `By ${authorQuery} you have ${titles}${more}, sir.`;
}

// Expose for tests / future window.booksByAuthor
module.exports = { booksByAuthor };
