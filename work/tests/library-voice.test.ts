import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { voiceSearchLibrary, whatWasIReading, progressSummary, formatSearchResults, type BookLike } from '../library-voice';

const books: BookLike[] = [
  { title: 'Dune', author: 'Herbert', progress: 40, lastOpened: 1000 },
  { title: 'Foundation', author: 'Asimov', progress: 100, lastOpened: 2000 },
  { title: 'Neuromancer', author: 'Gibson', progress: 10, lastOpened: 500 },
];

describe('library voice', () => {
  it('searches by title or author', () => {
    const r = voiceSearchLibrary(books, 'asimov');
    assert.equal(r.length, 1);
    assert.equal(r[0].title, 'Foundation');
  });
  it('finds what was reading (unfinished, most recent)', () => {
    const b = whatWasIReading(books);
    assert.equal(b?.title, 'Dune');
  });
  it('summarises progress', () => {
    const s = progressSummary(books[0]);
    assert.match(s, /Dune/);
    assert.match(s, /40 percent/);
  });
  it('formats search for speech', () => {
    const s = formatSearchResults(voiceSearchLibrary(books, 'e'));
    assert.match(s, /found/);
  });
});
