const { searchLibrary, whatWasIReading, formatWhatWasIReading, suggestReadAloud } = require('../../outputs/ThingsBook/library-voice-helpers.js');

const books = [
  { id: '1', title: 'Dune', author: 'Frank Herbert', progress: 45, lastOpened: 1000, currentPage: 200 },
  { id: '2', title: 'Neuromancer', author: 'William Gibson', progress: 10, lastOpened: 500 },
  { id: '3', title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', shelf: 'Sci-Fi', progress: 80, lastOpened: 2000 },
];

console.log('search Dune:', searchLibrary('dune', books).map(b => b.title));
console.log('what was I reading:', formatWhatWasIReading(whatWasIReading(books)));
console.log('suggest:', suggestReadAloud(books[0]));

// Simple asserts
if (searchLibrary('gibson', books)[0].title !== 'Neuromancer') throw new Error('search failed');
if (!formatWhatWasIReading(whatWasIReading(books)).includes('Left Hand')) throw new Error('what was failed');
console.log('All library voice helper checks passed');
