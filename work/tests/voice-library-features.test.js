/**
 * Tests for the three new voice library features.
 */
const features = require('../outputs/ThingsBook/voice-library-features.js');

describe('Library voice features', () => {
  beforeEach(() => {
    global.window = { books: [
      { title: 'Dune', status: 'finished', finishedAt: Date.now() - 86400000, pages: 500, notes: 'great sandworms' },
      { title: 'Foundation', status: 'reading', progress: { percent: 40 }, pages: 300 }
    ] };
  });

  test('readingStats counts finished', () => {
    expect(window.readingStats()).toContain('finished');
  });

  test('searchHighlights finds notes', () => {
    expect(window.searchHighlights('sandworms')).toContain('Dune');
  });

  test('continueReadingEstimate gives time', () => {
    expect(window.continueReadingEstimate()).toContain('pages left');
  });
});
