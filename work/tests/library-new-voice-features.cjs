/**
 * Tests for new ThingsBook library voice features.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8');
const start = source.indexOf('function booksFinishedThisMonth');
assert(start > 0, 'new functions present');

const context = {
  books: [
    { title: 'Dune', status: 'finished', finishedAt: Date.now() - 86400000, shelfId: 's1' },
    { title: 'Neuromancer', status: 'reading', progress: { percent: 40 } },
  ],
  shelves: [{ id: 's1', name: 'Sci-Fi' }],
  booksMatching: q => context.books.filter(b => b.title.toLowerCase().includes(q.toLowerCase())),
  plural: (n, w) => `${n} ${w}${n===1?'':'s'}`,
};
vm.createContext(context);
const code = source.slice(start, source.indexOf('function progressOnBook') || source.length);
vm.runInContext(code, context);

console.assert(context.booksFinishedThisMonth().includes('1 book'), 'finished this month');
console.assert(context.averageProgress().includes('40'), 'average progress');
console.log('ThingsBook new features tests passed.');
