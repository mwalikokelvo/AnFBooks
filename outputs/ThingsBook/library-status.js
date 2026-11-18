/**
 * ThingsBook library status assistant helpers.
 * Safe, local-only features that fit a book library:
 * - how many books / shelves
 * - what was I reading (last opened)
 * - simple voice-searchable summary
 *
 * No network. Uses the existing local books array.
 */

export function libraryStatus(books, shelves) {
  const total = Array.isArray(books) ? books.length : 0;
  const shelfCount = Array.isArray(shelves) ? shelves.length : 0;
  const reading = Array.isArray(books)
    ? books.filter(b => b && (b.progress > 0 || b.lastOpened))
    : [];
  const last = reading
    .slice()
    .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))[0];

  return {
    totalBooks: total,
    totalShelves: shelfCount,
    currentlyReadingCount: reading.length,
    lastReadTitle: last ? (last.title || last.filename || 'Untitled') : null,
    lastReadProgress: last && typeof last.progress === 'number' ? last.progress : null,
    summary: total === 0
      ? 'Your library is empty. Import a book to get started.'
      : `You have ${total} book${total === 1 ? '' : 's'} across ${shelfCount} shelf${shelfCount === 1 ? '' : 'ves'}.` +
        (last ? ` Last opened: ${last.title || 'a book'}.` : ''),
  };
}

export function whatWasIReading(books) {
  if (!Array.isArray(books) || books.length === 0) {
    return 'You have no books in your library yet.';
  }
  const withTime = books.filter(b => b && b.lastOpened);
  if (withTime.length === 0) {
    return 'You have not opened any books yet.';
  }
  const last = withTime.slice().sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))[0];
  const title = last.title || last.filename || 'Untitled';
  const prog = typeof last.progress === 'number' ? ` You were at ${Math.round(last.progress)}%.` : '';
  return `You were last reading "${title}".${prog}`;
}
