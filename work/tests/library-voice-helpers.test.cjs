const { whatWasIReading, voiceSearchLibrary, readAloudProgress } = require('../../outputs/ThingsBook/library-voice-helpers.js');

const books = [
  { id: '1', title: 'Dune', author: 'Herbert', progress: 0.42, status: 'reading', lastOpened: 100 },
  { id: '2', title: 'Foundation', author: 'Asimov', progress: 0, status: 'unread', lastOpened: 50 },
];

console.assert(whatWasIReading(books).text.includes('Dune'), 'whatWasIReading finds last book');
console.assert(voiceSearchLibrary(books, 'asimov').length === 1, 'search finds by author');
console.assert(readAloudProgress(books[0]).includes('42'), 'progress announcement');
console.log('library-voice-helpers tests passed');
