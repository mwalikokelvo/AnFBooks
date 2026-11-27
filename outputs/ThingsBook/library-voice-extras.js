// Additional library voice helpers for AnF Books (ThingsBook).
// Attach to window for voice assistant / script use. Inspired by Alexa/Siri library queries and read-aloud.

(function() {
  if (typeof window === 'undefined') return;

  /** What was I reading? Last opened or continue-reading book. */
  window.whatWasIReading = function() {
    // Placeholder: in real app, query the Continue reading card or last opened.
    // Returns a one-sentence answer.
    const cont = document.querySelector('.continue-reading, [data-continue]') || { textContent: 'Dune' };
    const title = (cont.textContent || 'your last book').trim().split('\n')[0];
    return `You were reading ${title}.`;
  };

  /** Books by genre or tag. */
  window.booksByGenre = function(genre) {
    const g = (genre || 'fiction').toLowerCase();
    // In full implementation, filter library by tags/genre.
    return `Looking for ${g} books in your library. Try searching the shelves.`;
  };

  /** Mark current page or add a quick bookmark by voice. */
  window.voiceBookmark = function(note) {
    const n = note || 'voice bookmark';
    return `Bookmark noted: ${n}. (Full implementation updates the book's progress/notes.)`;
  };

  /** Enhanced read-aloud status. */
  window.readAloudStatus = function() {
    return 'Read-aloud is available. Say start read aloud or choose a voice.';
  };
})();
