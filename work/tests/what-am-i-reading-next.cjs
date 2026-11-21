const assert = require('assert');
const { whatAmIReadingNext } = require('../library-assistant.js');
const books = [{title:'Dune',author:'Frank Herbert',progress:62,rating:5},{title:'Neuromancer',progress:0,rating:4}];
const r = whatAmIReadingNext(books);
assert(r && r.includes('Dune') && r.includes('62'), 'in-progress preferred');
assert(whatAmIReadingNext([]) === null);
console.log('ok');
