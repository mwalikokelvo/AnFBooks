/**
 * Reading session stats for voice: "how long have I been reading", "reading time today".
 * Local only; track start of session.
 */

let sessionStart = 0;

export function startReadingSession(): string {
  sessionStart = Date.now();
  return 'Reading session started.';
}

export function getReadingTime(): string {
  if (!sessionStart) return 'No reading session is active.';
  const mins = Math.floor((Date.now() - sessionStart) / 60000);
  return `You have been reading for ${mins} minute${mins === 1 ? '' : 's'}.`;
}

export function endReadingSession(): string {
  const msg = getReadingTime();
  sessionStart = 0;
  return msg + ' Session ended.';
}
