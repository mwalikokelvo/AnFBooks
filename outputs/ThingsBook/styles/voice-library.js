/** Voice library helpers for AnF Books. */
export function voiceSearchQuery(query) {
  return `Searching library for: ${query}`;
}
export function whatWasIReading(lastBook) {
  return lastBook ? `You were reading ${lastBook}.` : "No recent book found.";
}
export function readingProgressVoice(title, percent) {
  return `${title} is ${percent} percent complete.`;
}
