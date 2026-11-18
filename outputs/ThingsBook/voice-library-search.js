// Voice search of the library - stub for Kevo-style assistant features in ThingsBook
// Example: "what was I reading" or "find my book on X"
export function searchLibraryByVoice(query, books) {
  const q = query.toLowerCase();
  return books.filter(b => 
    (b.title || '').toLowerCase().includes(q) ||
    (b.author || '').toLowerCase().includes(q) ||
    (b.notes || '').toLowerCase().includes(q)
  ).slice(0, 5);
}

export function whatWasIReading(books) {
  const recent = books.filter(b => b.lastOpened).sort((a, b) => b.lastOpened - a.lastOpened)[0];
  return recent ? `You were reading ${recent.title} by ${recent.author || 'unknown'}, ${recent.progress || 0}% done.` : 'No recent reading found.';
}
