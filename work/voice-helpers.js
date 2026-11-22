/**
 * Voice-friendly helpers for AnF Books / ThingsBook library.
 * These can be exposed on window for a voice assistant or script.
 * Fits the existing pattern of progressOnBook, searchLibrary, etc.
 */

export function whatWasIReading(library) {
  // library: array of books with lastOpened, title, progress
  if (!library || !library.length) return 'You have no books in your library.';
  const recent = library
    .filter(b => b.lastOpened)
    .sort((a, b) => b.lastOpened - a.lastOpened)[0];
  if (!recent) return 'You have not opened any books recently.';
  const prog = recent.progress ? ` You are about ${Math.round(recent.progress * 100)} percent through it.` : '';
  return `You were last reading ${recent.title}${prog}`;
}

export function resumeReadingSuggestion(library) {
  const recent = library
    ?.filter(b => b.lastOpened && b.progress < 1)
    .sort((a, b) => b.lastOpened - a.lastOpened)[0];
  if (!recent) return 'Nothing unfinished to resume.';
  return `Would you like to continue ${recent.title}? You were ${Math.round((recent.progress || 0) * 100)} percent through.`;
}
