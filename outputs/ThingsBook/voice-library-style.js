/**
 * ThingsBook library style & voice helpers (client-side).
 * Three new capabilities for a book library:
 * - setReadingTheme(theme): 'sepia' | 'night' | 'paper' | 'dark'
 * - whatAmIReadingDetailed(): progress + estimated finish
 * - recommendByStyle(mood): prefers tagged books matching mood
 */
(function () {
  const THEMES = ['paper', 'sepia', 'night', 'dark'];

  window.setReadingTheme = function (theme) {
    const t = String(theme || '').toLowerCase();
    if (!THEMES.includes(t)) return 'Unknown theme. Try paper, sepia, night or dark.';
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('tb-theme', t);
    return `Reading theme set to ${t}.`;
  };

  window.whatAmIReadingDetailed = function () {
    const card = document.querySelector('.continue-reading, [data-continue]');
    if (!card) return 'You are not currently reading any book.';
    const title = card.querySelector('.title, h2, h3')?.textContent?.trim() || 'Unknown book';
    const progress = card.dataset.progress || card.querySelector('.progress')?.textContent || '0%';
    const pagesLeft = card.dataset.pagesLeft || 'unknown';
    const minsPerPage = 1.5;
    const minsLeft = pagesLeft !== 'unknown' ? Math.round(Number(pagesLeft) * minsPerPage) : null;
    const finish = minsLeft ? ` about ${minsLeft} minutes left` : '';
    return `You are reading ${title}, ${progress} complete${finish}.`;
  };

  window.recommendByStyle = function (mood) {
    const m = String(mood || 'calm').toLowerCase();
    const books = Array.from(document.querySelectorAll('.book-card, [data-book]'));
    const scored = books.map(el => {
      const tags = (el.dataset.tags || '').toLowerCase();
      const title = el.querySelector('.title')?.textContent || '';
      let score = 0;
      if (m === 'calm' && /calm|cozy|quiet|nature/.test(tags)) score += 2;
      if (m === 'adventure' && /adventure|action|quest/.test(tags)) score += 2;
      if (m === 'learn' && /nonfiction|science|history/.test(tags)) score += 2;
      if (el.dataset.progress && Number(el.dataset.progress) < 100) score += 1;
      return { title, score };
    }).filter(b => b.score > 0).sort((a, b) => b.score - a.score);
    if (!scored.length) return 'No matching books found for that style. Try calm, adventure or learn.';
    return `For a ${m} style, try ${scored[0].title}.`;
  };
})();
