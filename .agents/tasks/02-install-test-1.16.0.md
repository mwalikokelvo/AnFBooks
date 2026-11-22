# 02: Install test of AnF Books 1.16.0 on the PC

**Goal**: 1.16.0 (the rename to AnF Books) has passed automated tests but nobody has run the released Windows build on the PC. Only you can.

**Branch**: `agy/install-test-1.16.0` from `origin/main`, for the `HANDOFF.md` entry only.

**Steps**:
1. Download `AnF-Books-Independent-1.16.0.exe` and `AnF-Books-1.16.0-SHA256SUMS.txt` from the v1.16.0 GitHub release. Check the hash matches.
2. Run it. Check: the window title says AnF Books; the existing library unlocks with no data lost; a book opens and pages turn; an encrypted backup export starts and shows the recovery-code step (cancel before saving anything if you can't choose a private place). Do not change the owner's password, delete books or restore a backup.
3. Clear superseded builds (owner's standing rule): delete older ThingsBook / AnF Books installer or portable build files (versions below 1.16.0) from Downloads and the build output folders. **Never delete** the library data, backups (`*.thingsbook`), books, the source checkout or the Android signing key. List what you deleted.
4. Leave the Android APK for the owner; just note it is there.

**Report**: a dated entry in a new `HANDOFF.md` at the repository root (create it; one heading `# AnF Books handoff` above your entry): what you checked, what worked, what didn't, what you deleted. Open a pull request with only that file. Write "installed on the PC" only for what you actually ran.

**Done when**: a pull request from `agy/install-test-1.16.0` is open.
