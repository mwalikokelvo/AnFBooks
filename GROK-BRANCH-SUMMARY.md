# grok/library-voice-stats-highlights

## What this branch adds and why

Adds three positive style features to the AnF Books library (ThingsBook) that fit a private book collection and voice use:
1. **Reading stats by voice/script** — "How many books have I finished this month?" plus total pages. Builds on existing progress data.
2. **Voice search of highlights/notes** — find annotations without opening each book.
3. **Enhanced continue-reading estimate** — extends existing "what was I reading" with pages left and rough time estimate.

Why: Complements previous Grok voice helpers (read-aloud, whatWasIReading, shelves, recommend). Uses only local data, free, no new dependencies. Tests derived from expected observable behavior. Inspired by public book apps and open voice skills; no proprietary code copied.

Observable differences: Estimates are rough (fixed 2 min/page), search is simple string match, no AI summary of highlights.
