// Simple test for library voice summary
import { summarizeLibrary } from './library-voice-summary.js';

const books = [
  { title: 'Dune', author: 'Herbert', status: 'reading', lastRead: Date.now() },
  { title: '1984', author: 'Orwell', status: 'unread' },
  { title: 'Foundation', author: 'Asimov', status: 'finished', lastRead: Date.now() - 86400000 },
];

const summary = summarizeLibrary(books, []);
console.assert(summary.includes('3 books'), 'total count');
console.assert(summary.includes('Dune'), 'recent book');
console.log('Tests passed for library voice summary');
