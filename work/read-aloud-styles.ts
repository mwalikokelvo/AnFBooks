/**
 * ThingsBook — Read-aloud style controls (voice commands).
 * Speed, continue, night/bionic modes. Fits existing read-aloud + personal voices.
 */

export interface ReadAloudState {
  speed: number; // 0.5 - 2.0
  nightMode: boolean;
  bionic: boolean;
  currentBookId?: string;
}

export function adjustReadAloud(state: ReadAloudState, command: string): { state: ReadAloudState; speech: string } {
  const lower = command.toLowerCase();
  const next = { ...state };
  let speech = 'Read-aloud updated.';

  if (lower.includes('faster') || lower.includes('speed up')) {
    next.speed = Math.min(2, (next.speed || 1) + 0.25);
    speech = `Reading speed set to ${next.speed} times.`;
  } else if (lower.includes('slower') || lower.includes('slow down')) {
    next.speed = Math.max(0.5, (next.speed || 1) - 0.25);
    speech = `Reading speed set to ${next.speed} times.`;
  } else if (lower.includes('night') || lower.includes('dark mode')) {
    next.nightMode = true;
    speech = 'Night mode enabled for reading.';
  } else if (lower.includes('bionic')) {
    next.bionic = !next.bionic;
    speech = next.bionic ? 'Bionic reading enabled.' : 'Bionic reading disabled.';
  } else if (lower.includes('continue') || lower.includes('resume reading')) {
    speech = 'Continuing read-aloud from your last position.';
  }

  return { state: next, speech };
}
