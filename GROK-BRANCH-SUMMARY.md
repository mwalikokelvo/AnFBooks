# grok/library-voice-styles

**What this branch adds and why**

Three positive style features that fit a private book library (AnF Books / ThingsBook):

1. **Voice library search** — “Find books by author X” or “search my library for…”. Local title/author/shelf matching.
2. **“What was I reading?”** — Resume the most recently opened unfinished book with progress percentage.
3. **Read-aloud style controls** — Voice commands for speed, night mode, bionic reading, continue. Complements existing continuous narration and personal voices.

All pure local, no network. Matches the app’s privacy model and existing read-aloud/library tools. Includes tests. Never pushed to main. Claude or approved partner reviews and merges.

Observable differences: these are lightweight helpers ready for integration into the existing voice/command dispatch; no proprietary UI copied.
