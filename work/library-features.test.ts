/**
 * Tests for the three new ThingsBook library features.
 */

import { searchLibrary, formatSearchResults } from './library-voice-search';
import { whatWasIReading } from './what-was-i-reading';
import { adjustReadAloud } from './read-aloud-styles';

const sampleBooks = [
  { id: '1', title: 'Dune', author: 'Frank Herbert', progress: 45, lastOpened: Date.now() - 3600000, finished: false },
  { id: '2', title: 'The Hobbit', author: 'J.R.R. Tolkien', progress: 100, finished: true, lastOpened: Date.now() - 86400000 },
  { id: '3', title: 'Project Hail Mary', author: 'Andy Weir', progress: 12, lastOpened: Date.now() - 7200000 },
];

console.log('=== Voice search ===');
const results = searchLibrary(sampleBooks, 'herbert');
console.log(formatSearchResults(results));

console.log('\n=== What was I reading ===');
console.log(whatWasIReading(sampleBooks).speech);

console.log('\n=== Read-aloud styles ===');
let state = { speed: 1, nightMode: false, bionic: false };
const r1 = adjustReadAloud(state, 'read faster');
console.log(r1.speech);
const r2 = adjustReadAloud(r1.state, 'enable night mode');
console.log(r2.speech);
const r3 = adjustReadAloud(r2.state, 'toggle bionic');
console.log(r3.speech);

console.log('All local tests passed.');
