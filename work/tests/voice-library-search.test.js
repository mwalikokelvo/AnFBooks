const { searchLibraryByVoice, whatWasIReading } = require('../outputs/ThingsBook/voice-library-search.js');

describe('voice library search', () => {
  const books = [
    { title: 'History of Rome', author: 'Smith', progress: 45, lastOpened: 100 },
    { title: 'Modern Physics', author: 'Jones', progress: 10, lastOpened: 50 }
  ];

  it('searches by title', () => {
    const res = searchLibraryByVoice('rome', books);
    expect(res.length).toBe(1);
    expect(res[0].title).toContain('Rome');
  });

  it('reports last reading', () => {
    const res = whatWasIReading(books);
    expect(res).toContain('History of Rome');
  });
});
