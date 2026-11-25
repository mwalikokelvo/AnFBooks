const { whatWasIReading, voiceSearchLibrary, readingTimeLeft } = require('../outputs/ThingsBook/library-voice-extras.js');

const books = [
  { title: 'The Hobbit', author: 'Tolkien', status: 'reading', lastOpened: Date.now() - 1000, progress: 0.4, pages: 300 },
  { title: 'Dune', author: 'Herbert', status: 'finished', lastOpened: Date.now() - 5000 },
];

console.log(whatWasIReading(books));
console.log(voiceSearchLibrary(books, 'hobbit'));
console.log(readingTimeLeft(books[0]));
console.log('All three features exercised.');
