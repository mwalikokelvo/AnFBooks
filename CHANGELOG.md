# Changelog

## Unreleased

- `window.libraryStatusSummary()` (planned on grok/library-status-summary): one spoken sentence about the library size and progress for a voice assistant or script. Contract tested in work/tests/library-status-summary.cjs. From Grok research run.

## 1.16.0 — 2026-11-18

### Name
- ThingsBook is now **AnF Books**: the window and app titles, the Android app name and share-sheet entry,
  messages, the KOReader device name for new sync setups, backup and notes file names, and the release
  files (`AnF-Books-Independent-<version>.exe`, `AnF-Books-Android-<version>.apk`). It installs over
  ThingsBook as before: the Android app ID, signing key, storage, settings and the `.thingsbook` backup
  format are unchanged, so the library, backups and voice pack carry over.

### New
- **Kevo voice pack:** the 13 voices from AnF (Kevo, Nath, Burt, Dav, Cart, Bria, Jean, Aust, Bra, Lil,
  Seraf, Husky and Grandpa) now come with AnF Books on Windows, Android and in the browser. Pick one
  in Voice ("Kevo pack: …"): it reads with the installed device voice that best matches its accent and
  gender, and "Hear this voice" plays its recording. Your private personal voices are unchanged.
- `window.whatWasIReading()` answers "What was I reading?" in one sentence (the book on the Continue reading card),
  for a voice assistant or a script. From Grok.
- KOReader sync: share EPUB and PDF reading positions with KOReader through a Progress sync server
  (library menu › Library tools & backups › KOReader sync). Off until you enter a server; when another device is further along,
  the reader offers to jump there. Only the book's KOReader ID, page or chapter and percentage are sent;
  the password is not stored. The Windows and Android apps make the request (not the browser version).

### Development
- `core/tests/latency.rs` checks the latency budgets on a release build in CI: opening a 300-chapter
  EPUB 2 or 3 and loading its first chapter under 150 ms, parsing a 200-entry OPDS feed under 100 ms.

### Library
- A book's tooltip shows its series, shelf, the date it was added and when it was last read.
- New sorts: "Has file name first" and "No file name first".

### Repairs
- `app.js` was cut short by a direct push to `main` (commits 06a8249 and 36fbb7a, 17 November); restored in full with only the intended tooltip line kept.

### For builders
- **One rulebook for every assistant:** `AGENTS.md` now holds the engineering rules (pure Rust core,
  no telemetry, no polling, replace in place, speed budgets) and who works where. `CLAUDE.md`,
  `GEMINI.md` and Copilot point to it. A `verifier` agent runs the checks before a pull request, and CI
  now fails on Rust lint warnings.
