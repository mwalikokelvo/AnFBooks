# Note for every assistant working on ThingsBook

From Claude, at the owner's request (13 November 2026).

## Do not commit to `main` unless it is proven safe

Between 1.14.3 and 1.15.0, about 110 automated commits went straight to `main`. Many of them cut
`outputs/ThingsBook/index.html`, `app.js` and `CHANGELOG.md` short and then rebuilt them from memory.
The result: the backup safety step disappeared, restore stopped accepting older backups, the
protected-PDF dialog broke, reader buttons were duplicated, the changelog was reduced to one line, and
the Tests workflow failed on every push for days. It all had to be repaired by hand before 1.15.0.

So, from now on:

1. **Work on your own branch** (for example `grok/<topic>` or `gemini/<topic>`), not on `main`.
2. **Commit to `main` only when the owner tells you to,** or when you have verified all of these
   yourself:
   - `node work/run-tests.cjs` reports **0 failed** (run it from the repository root; install
     Playwright as in `.github/workflows/tests.yml` so the browser tests run too).
   - The **Tests** workflow on GitHub is green for your branch.
   - You opened the app and checked that the feature works and nothing around it broke.
   If any of these is red or unknown, do not push to `main`. Leave the branch and say what is left.
3. **Never rewrite a whole file from memory.** Change only the lines you mean to change. If your tool
   can only write whole files, read the full current file first and check that the new file is not
   shorter than the old one except where you deliberately removed something.
4. **Do not remove safety features** (the backup recovery-code confirmation, encryption, the
   protected-PDF dialog) to make something simpler or make a test pass.
5. **Keep a change small and useful.** One feature or fix per branch, with a test, and a line under
   "Unreleased" in `CHANGELOG.md`. Don't stack dozens of tiny variations of the same idea.
6. **Releases are built by the Release workflow** (`.github/workflows/release.yml`) after
   `python work/set-version.py <version> --release-notes`. Only release from a green `main`.

`work/tests/integrity.cjs` now fails if `index.html` is cut short, has duplicate ids, loses an element
the app uses, or if the changelog loses a release. A failing integrity test means a file was damaged:
fix the file, never the test.

Never commit private material: personal voice packs or recordings, books, backups, or the Android
signing key. This repository is public.

## Engineering rules (owner's master handoff, 17 November 2026)

These apply to every assistant. `CLAUDE.md`, `GEMINI.md` and `.github/copilot-instructions.md` all
point here, so this is the one rulebook.

- **Pure Rust in `core/`.** No OpenSSL or other C libraries that break the Linux CI, Windows or the
  Android UniFFI build. Encryption stays as it is (AES-256-GCM with Argon2 over SQLite, already pure
  Rust); do not switch the library to SQLCipher, which would mean migrating everyone's encrypted data.
  Any Rust networking uses `rustls`.
- **No telemetry.** No analytics or tracking SDKs. Network calls only to servers the owner configured
  (OPDS catalogs, a KOReader sync server).
- **Push, not polling.** No `setInterval` or `requestAnimationFrame` loops, and no sleep loops in Rust,
  to watch for state changes. React to events (page turns, file writes, IPC messages).
- **Replace in place.** No `*_v2` copies, compatibility shims or dead code kept "for later". Fix the
  broken code where it is, update every caller in the same commit, delete what is unused.
  `cargo clippy --all-targets -- -D warnings` must pass in `core/` (CI checks it).
- **Speed budgets** (checked by tests): EPUB 2/3 open, spine parse and chapter load under 150 ms;
  OPDS feed parse under 100 ms; KOReader sync payload diff/merge under 50 ms.

## Who works where

| Assistant | Branch prefix | Good for | Limit |
|---|---|---|---|
| Hermes (free, local) | `hermes/` | Docs, test scaffolds, `cargo check` in `core/` | Never a full build on the 8 GB PC |
| Antigravity / Gemini | `gemini/` or `agy/` | Reader UI, EPUB/OPDS test fixtures | One Rust build on the PC at a time |
| Claude Code | `claude/` | Rust core, storage, UniFFI boundaries, reviews | Checks go to the `verifier` agent |
| Grok / Cursor (cloud) | `grok/`, `cursor/` | Large refactors, full test runs | 2 tries per failure |
| Copilot (GitHub) | `copilot/` | Small bounded fixes with named files and a test command | No open-ended features |
| Codex | `codex/` | Rust, CI, packaging; reviews pull requests | Never merges its own |

- **Two strikes.** If a build, test or speed check fails twice on the same thing, stop, leave the
  branch, and write down what failed instead of retrying.
- **Before a pull request**, run the checks above (Claude Code: hand them to `.claude/agents/verifier.md`).
- Reviews: never let a review comment trigger an automatic commit, and never have bots reply to bots.
