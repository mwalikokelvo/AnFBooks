# grok/thingsbook-library-voice-style

## What this branch adds

Three style features that fit a private book library (AnF Books / ThingsBook), reverse-engineered from public voice assistant and reader app behaviors (library search by voice, “what was I reading”, read-aloud progress cues). Implemented as pure helpers in `outputs/ThingsBook/library-voice-helpers.js` ready for wiring into the existing voice/reader.

1. **Voice search of the library**: Filter books by title, author or shelf substring. Returns ranked by last opened.
2. **“What was I reading”**: Returns the most recently opened book with progress and page cue. Spoken reply format included.
3. **Read-aloud style helpers**: Spoken progress suggestion, near-finish cue, and optional speed nudge. Plus `markFinishedByVoice` for completion.

## Why

Recent main already has read-aloud, mark finished, shelves and voice answers. These deepen the library-as-conversation experience without leaving the device (all local, no telemetry).

## Tests

`work/tests/library-voice-helpers.test.js` exercises search, last-reading recall and suggestion formatting.

## Remaining differences vs originals

- Search is simple substring (no fuzzy or full-text index yet; the app already has better search).
- “What was I reading” uses lastOpened timestamp (assumes it is maintained).
- Read-aloud speed is advisory only; actual TTS speed control depends on existing speech engine hooks.
- No proprietary reader or assistant code copied.

Never pushed to main. Ready for review.
