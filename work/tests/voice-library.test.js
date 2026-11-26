const { voiceSearchQuery, whatWasIReading, readingProgressVoice } = require('../../outputs/ThingsBook/styles/voice-library.js');
const assert = require('assert');

assert.strictEqual(voiceSearchQuery('Asimov'), 'Searching library for: Asimov');
assert.match(whatWasIReading('Dune'), /Dune/);
assert.match(readingProgressVoice('Dune', 42), /42 percent/);
console.log('All voice library tests passed');
