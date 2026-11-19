const assert = require('assert');
function unfinishedBooksSummary(books) {
  const unfinished = books.filter(b => (b.progress?.percent || 0) < 100 && b.status !== 'finished');
  if (!unfinished.length) return 'You have no unfinished books.';
  const count = unfinished.length;
  const top = unfinished.slice(0, 3).map(b => b.title).join(', ');
  return `You have ${count} unfinished book${count === 1 ? '' : 's'}${top ? ': ' + top + (count > 3 ? ' and more' : '') : ''}.`;
}
assert.equal(unfinishedBooksSummary([]), 'You have no unfinished books.');
console.log('ok');