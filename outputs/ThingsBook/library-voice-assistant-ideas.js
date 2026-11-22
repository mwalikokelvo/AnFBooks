/**
 * Assistant-style features for ThingsBook / AnF Books library.
 * Fits book library: voice search of the library, read-aloud status, "what am I reading" / "what was I reading".
 * Builds on existing window.progressOnBook, window.searchLibrary, etc. from previous Grok/Claude work.
 * No proprietary code copied; ideas from public voice assistant capabilities (Siri, Alexa) adapted to local private library.
 * Positive: keeps everything on-device, encrypted, no telemetry.
 */

// Example: expose for voice or script
if (typeof window !== 'undefined') {
  window.whatAmIReading = function() {
    // Would query the continue reading card or last opened book
    const last = /* existing last opened logic */ null;
    return last ? `You are reading ${last.title} by ${last.author}, at ${last.progress || 0}%` : 'You have no book open recently.';
  };

  window.voiceSearchLibrary = function(query) {
    // Reuse or extend existing searchLibrary
    return window.searchLibrary ? window.searchLibrary(query) : 'Search not available.';
  };
}

// Why: Leading assistants support "what was I reading" style memory of context, local search without cloud.
// Spotify research informs music in AnF, but for books: progress tracking, recommendations from local shelves only.
