const assert = require('assert');
const { whatWasIReading, voiceSearch, readingProgress } = require('../outputs/ThingsBook/vendor/library-voice-features.js');

const sample = [
  { title: 'Dune', author: 'Herbert', progress: 0.42, lastOpened: 100, shelf: 'SciFi', timeLeftMinutes: 180 },
  { title: 'Pride and Prejudice', author: 'Austen', progress: 0.1, lastOpened: 50, shelf: 'Classics' },
];

assert.ok(whatWasIReading(sample).includes('Dune'));
assert.ok(voiceSearch(sample, 'dune').includes('Dune'));
assert.ok(readingProgress(sample[0]).includes('42'));
console.log('library-voice-features tests passed');
