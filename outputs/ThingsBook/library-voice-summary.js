// Assistant-style feature for ThingsBook: voice summary of the library.
// Fits a book library: "summarize my library" or "how many books am I reading".

export function summarizeLibrary(books, shelves) {
  const total = books.length;
  const reading = books.filter(b => b.status === 'reading').length;
  const unread = books.filter(b => b.status === 'unread').length;
  const finished = books.filter(b => b.status === 'finished' || b.status === 'read').length;
  const recent = books
    .filter(b => b.lastRead)
    .sort((a, b) => b.lastRead - a.lastRead)[0];

  let summary = `You have ${total} books in your library. `;
  summary += `${reading} currently reading, ${unread} unread, ${finished} finished. `;
  if (recent) {
    summary += `Your most recent read is ${recent.title} by ${recent.author}.`;
  } else {
    summary += `No recent reading activity recorded.`;
  }
  return summary;
}

export function formatVoiceReply(summary) {
  return summary;
}
