const { searchLibrary, whatWasIReading, readingStats } = require('../../outputs/ThingsBook/library-voice-helpers.js');

const books = [
  { title: 'The Hobbit', author: 'Tolkien', progress: 40, lastOpened: 1000 },
  { title: 'Dune', author: 'Herbert', progress: 100, finishedAt: Date.now() },
  { title: 'Project Hail Mary', author: 'Weir', progress: 10, lastOpened: 2000 },
];

console.log(searchLibrary(books, 'hobbit').length === 1 ? 'search ok' : 'search fail');
const last = whatWasIReading(books);
console.log(last && last.title === 'Project Hail Mary' ? 'last ok' : 'last fail');
const stats = readingStats(books);
console.log(stats.finishedThisMonth >= 1 && stats.averageProgress > 0 ? 'stats ok' : 'stats fail');
