# Kevo-style Read-Aloud Status for AnF Books

## Feature slice

Assistant-style query: "What was I reading?" or "Continue reading aloud."

- Queries local encrypted library for last opened book and position.
- Returns title, progress percentage, and offers to resume narration.
- Uses existing read-aloud (system or personal voices). No new network calls.
- Fits book library perfectly; no proprietary code copied from other apps.

### Why

Leading assistants (Siri, Alexa) support catching up on audiobooks and resuming. Spotify resumes playback. This brings the same convenience to private books.

### Tests

- Unit test for progress calculation.
- Integration check that it only reads local data.

Never push to main; Claude reviews and merges when safe.
