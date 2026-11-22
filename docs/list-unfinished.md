# listUnfinished for voice assistant

Proposed addition to AnF Books / ThingsBook.

`window.listUnfinished()` returns a one-sentence summary of books that are reading or unread (not finished), limited to the three most recently read or added.

Example: "You have 4 unfinished books: Dune by Frank Herbert (62%), Neuromancer by William Gibson (not started), and 2 more."

Fits the existing pattern of whatWasIReading, progressOnBook, searchLibrary, etc. in app.js.

Fully local, no network.

To be implemented in outputs/ThingsBook/app.js with a test in work/tests/library-voice-answers.cjs.
