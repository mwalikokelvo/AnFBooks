# Changelog

## Unreleased

- Library style voice features from Grok: `window.whatWasIReading()` (last book you were on),
  `window.booksByGenre(genre)` (filter-style answer for genre/tag), `window.voiceBookmark(note)` (quick voice bookmark),
  and `window.readAloudStatus()`. Load library-voice-extras.js to expose them.

- Library voice features from Grok: `window.startReadAloud(query)` (local Web Speech read-aloud of current or queried book),
  `window.markAsFinished(query)` (marks a book finished by voice), `window.booksOnShelf(shelfName)` (lists books on a named shelf),
  and `window.booksByAuthor(query)` (lists books by a specified author).
- `window.recommendBookFromLibrary()` suggests an unfinished book in one sentence: the best rated one (4 stars or more),
  or else one you tagged. For a voice assistant or a script. From Grok.
- More one-sentence library answers for a voice assistant or a script, from Grok: `window.progressOnBook(query)`
  ("How far am I in Dune?"), `window.searchLibrary(query)` (up to three books by title, author or series),
  `window.estimatedTimeLeft()` (time left in the book on the Continue reading card, at the tooltips' 1.5 minutes a page)
  and `window.librarySummary()` (books reading, unread and finished, and the average progress).
- Three more one-sentence library answers for a voice assistant or a script: `window.listUnfinished()` (up to three
  unfinished books with their progress), `window.whatToReadNext()` (the Continue reading book, or else the best rated
  book you have not opened) and `window.shelvesSummary()` (your shelves and how many books are on each). From Grok.
- Those answers never call an unfinished book "100 percent read", and "what to read next" suggests a book read part
  way with no read date (restored or synced) instead of saying every book is finished.
- Assistants: added Google Chrome's modern-web-guidance skill in `.agents/skills/` (offline web best-practice guides), with its usage tracking removed. See `PRIVACY-PATCH.md` in that folder.
- Free AI review on every pull request (`.github/workflows/ai-review.yml`), using OpenRouter's free models, so reviews
  keep coming when Cursor Bugbot's quota runs out.

## 1.16.0 — 2026-11-18

### Name
- ThingsBook is now **AnF Books**: the window and app titles, the Android app name and share-sheet entry,
  messages, the KOReader device name for new sync setups, backup and notes file names, and the release
  files (`AnF-Books-Independent-<version>.exe`, `AnF-Books-Android-<version>.apk`). It installs over
  ThingsBook as before: the Android app ID, signing key, storage, settings and the `.thingsbook` backup
  format are unchanged, so the library, backups and voice pack carry over.
