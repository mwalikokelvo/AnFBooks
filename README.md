# AnF Books

AnF Books is a private reading and listening app for Windows and Android. Your books, notes and
reading positions stay on your own device, encrypted. Nothing is sent anywhere unless you choose to.

AnF Books was called ThingsBook up to version 1.15.1. It is the same app: install it over
ThingsBook as before, and your library, backups and voice pack carry over.

## What it does

- **Reads almost any book:** PDF (up to 500 MB, scanned pages included), EPUB, TXT, Kindle
  (MOBI/AZW3), Word, OpenDocument, RTF, FictionBook, comics (.cbz), Markdown and saved web pages.
  DRM-protected books are refused, never unlocked.
- **Keeps the library private:** everything is encrypted on the device and locked behind your
  password. Encrypted backups move a library between devices, and older backups still restore.
- **Reads aloud:** continuous narration with the system voices or your own private personal voices,
  and it keeps going with the screen off.
- **Organises the library your way:** shelves you can rename and delete, dozens of ways to sort
  (last opened, progress, time left, series, rating, publisher, file name and more), duplicate
  detection on import, and a tooltip on each book showing its progress, size, pages, publisher,
  shelf, when you added it and when you last read it.
- **Syncs your place with KOReader:** EPUB and PDF reading positions go to and from a KOReader
  Progress sync server you choose (library menu › Library tools & backups › KOReader sync). It is
  off until you enter a server, only the book's KOReader ID, page and percentage are sent, and the
  password is not stored.
- **Helps you study:** bookmarks, highlights, notes, search across books (PDF text included),
  offline text recognition for scans, cross-book links, comparisons, flashcards and citations.
- **Finds new books:** Project Gutenberg and OPDS catalogues.

## Install

Download the latest Windows EXE or Android APK from the
[Releases page](https://github.com/mwalikokelvo/ThingsBook/releases). Each release lists checksums.

On Android, install the new APK over the existing app. Do not uninstall first: that deletes the
private library on the phone. Update every device before moving a library with a backup.

`CHANGELOG.md` lists what changed in each version, and `Start-here.txt` sums up the current release.

## Build from source

Run the quick checks on any computer (Linux, macOS or Windows) from the repository root:

```
node work/run-tests.cjs            # every test this computer can run; the rest are listed as skipped
node work/run-tests.cjs --list     # what would run or be skipped
```

The browser tests need Playwright: `npm install --prefix work/test-tools playwright@1.63.0`, then
`node work/test-tools/node_modules/playwright/cli.js install chromium`.

The apps are built on a Windows PC with Node, Rust, the .NET Framework compiler and the Android
tools installed:

```powershell
python work\build-apps.py windows
python work\build-apps.py android
```

A release is one command, which sets the version everywhere, runs the tests, builds both apps and
writes checksums and notes to `outputs/`:

```powershell
python work\release.py 1.16.0            # add --push to push main and the tag
```

Pushing a `v<version>` tag also builds and publishes the release on GitHub
(`.github/workflows/release.yml`). The APK is built only when the repository holds the original
signing key as secrets. Personal voice packs are never bundled into a GitHub build, because the
repository and its releases are public.

## Where things are

- `outputs/ThingsBook/` — the app itself (shared by Windows and Android) and the Android project.
- `work/thingsbook-desktop/` — the Windows desktop shell and its native helpers.
- `core/` — the Rust core (search, storage, personal voices).
- `work/tests/` — the regression tests. `work/build-apps.py` and `work/release.py` build and release.

These folders keep their old names so existing builds and installs keep working.

## Contributing

Read `AGENTS.md` first. Work on a branch, and change `main` only when the owner asks or after the
tests, the Tests workflow and a check in the app are all green.

## Privacy

- Libraries and credentials stay on the device unless you export or download something yourself.
- No analytics or tracking. The app only contacts servers you set up (catalogues, a KOReader sync
  server) or sign in to.
- No private books, backups, recordings, voice packs or signing keys are in this repository.

## License

No project-wide open-source license has been granted. Third-party components keep their own
licenses, included in the vendor and license files.
