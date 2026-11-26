// Test for Grok library voice style features
const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, '../../outputs/ThingsBook/app.js');
const src = fs.readFileSync(appPath, 'utf8');

if (!src.includes('function booksFinishedCount')) throw new Error('missing booksFinishedCount');
if (!src.includes('function genreSummary')) throw new Error('missing genreSummary');
if (!src.includes('function addVoiceNote')) throw new Error('missing addVoiceNote');
if (!src.includes('window.booksFinishedCount')) throw new Error('missing export');

console.log('library-voice-styles tests passed');
