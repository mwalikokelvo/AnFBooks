# Library status assistant

Branch: `grok/library-status-assistant`

## What it adds

Local-only assistant helpers that fit a book library:

- How many books and shelves you have
- What was I reading (last opened book + progress)
- A short spoken-style summary

Files:
- `outputs/ThingsBook/library-status.js`
- Test in `work/tests/library-status.test.cjs`

## Why

Matches the request for assistant-style features that fit a book library
("what was I reading", library status). No proprietary code, no network,
no push to main.

Existing branches already cover some of the same idea; this is a clean,
importable helper that can be wired into the voice/search UI later.
