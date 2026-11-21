// Test for howMuchLeft assistant helper
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, '../../outputs/ThingsBook/app.js'), 'utf8');
assert(appJs.includes('function howMuchLeft'), 'howMuchLeft function missing');
assert(appJs.includes('window.howMuchLeft = howMuchLeft'), 'not exposed on window');
assert(appJs.includes('About '), 'missing time estimate phrasing');
console.log('how-much-left tests passed');
