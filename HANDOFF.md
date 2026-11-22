# AnF Books handoff

## 2026-11-22 — Install test of AnF Books 1.16.0 on Windows PC

Tested by Antigravity on the owner's Windows PC.

### What was checked & what worked
- **Release download & integrity**: downloaded `AnF-Books-Independent-1.16.0.exe` and `AnF-Books-1.16.0-SHA256SUMS.txt` from GitHub release `v1.16.0`. SHA256 matches `6c0579b50504b3d6713e147d1825167a8a870e95c057b8d9c70673abade3c6df` exactly.
- **Installed on the PC**: extracted runtime 1.16.0 and launched `AnF-Books-Independent-1.16.0.exe`.
- **Window title**: confirmed title displays `AnF Books · Your private reading room`.
- **Existing library unlock**: unlocked automatically with Windows DPAPI device protection; 0 data lost, all 7 existing books preserved in the vault.
- **Reading & page turns**: opened existing book (*Five Loaves and Two Fish*), verified initial position at page 15, turned page to page 16, and closed reader cleanly.
- **Encrypted backup export & recovery code**: clicked Export encrypted backup; backup dialog opened showing summary (7 books · 2 shelves · 26.9 MB) and 9-character recovery code step for transfer to another device. Cancelled and closed dialog before saving anything.
- **Safety**: did not change the owner's password, did not delete any books, did not restore a backup.
- **Automated test suite**: ran `node work/run-tests.cjs` — 27 passed, 0 failed, 48 skipped.

### Superseded builds & files
- Inspected `Downloads` and build output folders (`outputs/`). No older ThingsBook / AnF Books installer or portable build files below 1.16.0 were present to delete.
- Android APK `AnF-Books-Android-1.16.0.apk` is present on the v1.16.0 GitHub release and left for the owner.
