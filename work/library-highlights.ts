/**
 * Voice highlights: "read my highlights", "highlights from this book".
 * Assumes local highlight store; returns spoken summary.
 */

export interface Highlight {
  bookId: string;
  text: string;
  page?: number;
}

export function formatHighlights(highlights: Highlight[], bookTitle?: string): string {
  if (!highlights.length) return 'No highlights found.';
  const intro = bookTitle ? `Highlights from ${bookTitle}: ` : 'Your highlights: ';
  const texts = highlights.slice(0, 5).map(h => h.text.trim()).filter(Boolean);
  return intro + texts.join('. ');
}
