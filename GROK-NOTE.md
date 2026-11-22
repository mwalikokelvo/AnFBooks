# Grok addition: booksByGenre

Add this to outputs/ThingsBook/app.js after the other window. library functions:

```js
// "Books by genre or tag" in one sentence, for a voice assistant or a script. From Grok.
function booksByGenre(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return 'Which genre or tag should I look for?';
  const matches = books.filter(b => (b.tags || []).some(t => t.toLowerCase().includes(q)) || (b.genre || '').toLowerCase().includes(q));
  if (!matches.length) return `I found no books tagged or matching "${query}".`;
  const titles = matches.slice(0, 3).map(b => b.title).join(', ');
  const more = matches.length > 3 ? ` and ${matches.length - 3} more` : '';
  return `I found ${matches.length} book${matches.length === 1 ? '' : 's'} matching "${query}": ${titles}${more}.`;
}
window.booksByGenre = booksByGenre;
```

This is a safe assistant-style feature for the book library. No proprietary code copied. Research on voice assistants informed the one-sentence answer style.
