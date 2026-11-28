# ThingsBook style & voice features (grok/library-style-voice-features)

## Summary (Ponytail)
Adds three positive book-library features: spoken theme switching, a richer "what am I reading" answer with time remaining, and style/mood-aware recommendations based on tags. Pure client-side, fits a private local library, no network. Tests cover the three behaviours. Observable differences from commercial readers: no cloud sync of themes, no AI-generated covers, recommendations are tag-based only.

## Features
1. **Theme switch** — "Set theme to sepia" / "Night mode"
2. **Detailed reading status** — "What am I reading?" now includes progress and estimated minutes left
3. **Style recommendation** — "Recommend a calm book" / "Something adventurous"

## How to wire
Include `voice-library-style.js` after the main app script. The functions are on `window` for voice agents or scripts, matching the existing pattern used by `whatWasIReading` etc.
