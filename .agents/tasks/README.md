# Antigravity job queue

Claude writes jobs here so Antigravity builds them on the owner's PC; Claude then only reviews the result. Start the queue in Antigravity with `/pickup`.

- One file per job, numbered in the order to do them: `NN-short-name.md`.
- Each job has: **Goal**, **Branch**, **Files** it may touch, **Steps**, **Checks**, **Done when** (a fact on GitHub that shows the job is finished, so a finished job is skipped next time).
- Finished jobs are not moved or deleted by Antigravity; Claude clears old ones in its next queue update.
- This repository is public: never commit books, backups, voice recordings or keys.
