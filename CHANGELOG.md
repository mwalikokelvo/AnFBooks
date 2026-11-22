# Changelog

## Unreleased

- `window.booksByGenre(query)` lists up to three books matching a genre or tag in one sentence, for a voice assistant or a script. From Grok.
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
