// Grok library voice features 2026-11-27
// Append or include after books array is populated.
// Assumes global books, lastBookInProgress, whatWasIReading, readBook exist.

function finishedThisMonth() {
  const now = new Date();
  const ym = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const done = (typeof books !== 'undefined' ? books : []).filter(b => b.status === 'finished' && b.finishedAt && String(b.finishedAt).startsWith(ym));
  const n = done.length;
  if (!n) return 'You have not marked any books finished this month.';
  const titles = done.slice(0, 3).map(b => b.title).join(', ');
  return `You finished ${n} book${n === 1 ? '' : 's'} this month: ${titles}${n > 3 ? ' and more' : ''}.`;
}
if (typeof window !== 'undefined') window.finishedThisMonth = finishedThisMonth;

function resumeReading() {
  const book = typeof lastBookInProgress === 'function' ? lastBookInProgress() : null;
  if (!book) return 'You have no book currently in progress.';
  if (typeof readBook === 'function') {
    readBook(book.id).catch(() => {});
    return `Resuming ${book.title}.`;
  }
  return typeof whatWasIReading === 'function' ? whatWasIReading() : `Last book: ${book.title}.`;
}
if (typeof window !== 'undefined') window.resumeReading = resumeReading;

function recommendBook() {
  const list = typeof books !== 'undefined' ? books : [];
  const inProgress = list.filter(b => b.status === 'reading' && (b.progress?.percent || 0) < 100);
  if (inProgress.length) {
    const pick = inProgress.sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0))[0];
    return `You could continue ${pick.title}${pick.author ? ' by ' + pick.author : ''}, at ${Math.round(pick.progress?.percent || 0)} percent.`;
  }
  const unread = list.filter(b => b.status === 'unread' || !b.status);
  if (!unread.length) return 'Your library looks fully read. Add more books.';
  const recentAuthor = list.find(b => b.author && b.lastRead)?.author;
  const byRecent = recentAuthor ? unread.filter(b => b.author === recentAuthor) : [];
  const pick = (byRecent.length ? byRecent : unread)[Math.floor(Math.random() * (byRecent.length || unread.length))];
  return `Try ${pick.title}${pick.author ? ' by ' + pick.author : ''}.`;
}
if (typeof window !== 'undefined') window.recommendBook = recommendBook;

function booksFinishedCount() {
  const n = (typeof books !== 'undefined' ? books : []).filter(b => b.status === 'finished').length;
  return `You have finished ${n} book${n === 1 ? '' : 's'} in your library.`;
}
if (typeof window !== 'undefined') window.booksFinishedCount = booksFinishedCount;
