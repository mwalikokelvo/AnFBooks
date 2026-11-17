const { recentReadingSummary } = require('../../outputs/ThingsBook/assistant-recent.js');
const assert = require('assert');

const books = [
  { title: 'Dune', author: 'Herbert', progress: { percent: 42 }, lastRead: Date.now() - 86400000 },
  { title: 'Neuromancer', author: 'Gibson', progress: { percent: 10 }, lastRead: Date.now() },
  { title: 'Unread', author: 'Someone' }
];
const summary = recentReadingSummary(books);
assert.ok(summary.includes('Neuromancer'));
assert.ok(summary.includes('Dune'));
assert.ok(!summary.includes('Unread') || summary.includes('No recent'));
console.log('assistant-recent tests passed');
