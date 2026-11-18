// window.howMuchLeft(): one sentence about progress on the book currently open or on the Continue reading card.
// Inspired by voice assistants (Siri, Alexa etc.) for personal library use. No proprietary code.
// For ThingsBook / AnF Books: assistant-style feature that fits a book library.
'use strict';

// Minimal extraction of the idea; full integration would live next to whatWasIReading in app.js.
function howMuchLeft(books, activeId) {
  const book = books.find(b => b.id === activeId) || books.find(b => b.progress > 0);
  if (!book) return 'You have no book open and nothing in progress.';
  const pct = Math.round((book.progress || 0) * 100);
  const left = book.pages ? Math.round(book.pages * (1 - (book.progress || 0))) : null;
  const title = book.title || 'this book';
  if (left != null && left > 0) {
    return `You are ${pct}% through ${title}, about ${left} pages left.`;
  }
  return `You are ${pct}% through ${title}.`;
}

// Test
if (require.main === module) {
  const sample = [
    { id: '1', title: 'Test Book', progress: 0.42, pages: 300 },
    { id: '2', title: 'Other', progress: 0 }
  ];
  const msg = howMuchLeft(sample, '1');
  if (!msg.includes('42%') || !msg.includes('Test Book') || !msg.includes('174')) {
    console.error('Test failed:', msg);
    process.exit(1);
  }
  console.log('howMuchLeft test passed:', msg);
}

module.exports = { howMuchLeft };
