// Assistant-style feature: remember and report the last book the user was reading.
// Fits the local-first library. No proprietary code copied.

export function recordLastRead(bookId, title, position) {
  const entry = { bookId, title, position, at: Date.now() };
  try {
    localStorage.setItem('thingsbook-last-read', JSON.stringify(entry));
  } catch { /* private mode or quota */ }
}

export function getLastRead() {
  try {
    const raw = localStorage.getItem('thingsbook-last-read');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function formatLastReadSpeech() {
  const last = getLastRead();
  if (!last) return 'You have not started a book yet.';
  return `You were last reading ${last.title}.`;
}
