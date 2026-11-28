/**
 * Tests for the three new library style/voice features.
 */
const { JSDOM } = require('jsdom');

describe('Library style voice features', () => {
  let window, document;

  beforeEach(() => {
    const dom = new JSDOM(`<!DOCTYPE html><html><body>
      <div class="continue-reading" data-progress="42%" data-pages-left="120">
        <h2 class="title">Dune</h2>
      </div>
      <div class="book-card" data-tags="adventure sci-fi" data-progress="10"><span class="title">Foundation</span></div>
      <div class="book-card" data-tags="calm nature" data-progress="0"><span class="title">Walden</span></div>
    </body></html>`);
    window = dom.window;
    document = window.document;
    global.document = document;
    global.localStorage = { getItem: () => null, setItem: () => {} };
    // Load the script
    eval(require('fs').readFileSync(require('path').join(__dirname, '../outputs/ThingsBook/voice-library-style.js'), 'utf8'));
  });

  test('setReadingTheme accepts known themes', () => {
    expect(window.setReadingTheme('sepia')).toContain('sepia');
    expect(document.documentElement.getAttribute('data-theme')).toBe('sepia');
  });

  test('whatAmIReadingDetailed includes progress', () => {
    const reply = window.whatAmIReadingDetailed();
    expect(reply).toContain('Dune');
    expect(reply).toContain('42%');
  });

  test('recommendByStyle prefers matching tags', () => {
    const reply = window.recommendByStyle('adventure');
    expect(reply).toContain('Foundation');
  });
});
