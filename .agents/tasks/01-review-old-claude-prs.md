# 01: Review Claude's four old pull requests

**Goal**: four pull requests by Claude have waited since mid-November. Say for each whether it is still worth merging, so the list gets cleaned up.

**Branch**: none (review only, change no code).

**Pull requests**: #5 (build-loop skill), #11 (free AI review), #12 (team and duties in `AGENTS.md`), #19 (modern-web-guidance skill).

**Steps**, for each one:
1. Read the description and diff (`gh pr diff <n>`), and compare with current `main`. `AGENTS.md` on `main` already has a "Who works where" table, so #12 may be superseded.
2. Post one comment starting `Antigravity review of <head SHA, first 7 characters>:` followed by one of: `approve`, `changes needed` (list them with file and line), or `superseded, close` (say by what).

**Done when**: each pull request is closed, or has a comment from you starting `Antigravity review of <its current head SHA>`. When the author pushes after your review, the head changes, so you review it again.
