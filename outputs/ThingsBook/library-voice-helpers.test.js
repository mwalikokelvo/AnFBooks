// Simple node test for library-voice-helpers
const { searchLibrary, formatSearchResults, getReadingStats, whatWasIReading, recommendNext } = require('./library-voice-helpers.js');

const books = [
  { title: 'Dune', author: 'Herbert', progress: 45, lastOpened: Date.now() - 86400000 },
  { title: 'Foundation', author: 'Asimov', progress: 100, finished: true, lastOpened: Date.now() - 172800000 },
  { title: 'Neuromancer', author: 'Gibson', progress: 10, lastOpened: Date.now() },
];

console.log(formatSearchResults(searchLibrary(books, 'dune')));
console.log(getReadingStats(books));
console.log(whatWasIReading(books));
console.log(recommendNext(books));
console.log('Tests passed if above printed sensible strings.');
