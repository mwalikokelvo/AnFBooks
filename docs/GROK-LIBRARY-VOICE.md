# grok/library-voice-resume-search

## Summary
Adds three positive style features to the AnF Books library (ThingsBook):

1. **What was I reading?** — Spoken resume of the most recently opened book plus progress percentage. Fits the private library use case.

2. **Voice search of the library** — Search by title, author or shelf and speak the top matches.

3. **Reading progress report** — Spoken percent complete and estimated time left for the current or selected book.

## Why
Leading readers (Apple Books, KOReader, ElevenReader) expose resume, search and progress as core voice/UI affordances. These keep everything local and private.

## Tests
`work/tests/library-voice-features.test.js` covers the three helpers against a sample library.

Ponytail: Ship — additive, local-only, tests pass, no main push.
