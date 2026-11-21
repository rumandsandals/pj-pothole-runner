import type { Tone, Wave } from './sounds';

/**
 * BACKGROUND MUSIC: an original chiptune loop.
 *
 * Each channel is a row of steps separated by spaces. One step = one
 * eighth-note at the tempo below.
 *   C4, F#5, Bb3 …  play that note
 *   .               keep holding the previous note
 *   -               silence
 * Drums use k (kick), s (snare), h (hi-hat) and - (nothing).
 * Every channel should have the same number of steps; the loop repeats forever.
 * The bars below are 8 steps each: Am | F | C | G | Am | F | C | E
 */

export interface MusicChannel {
  wave: Wave;
  volume: number;
  notes: string;
}

export interface Track {
  bpm: number;
  stepsPerBeat: number;
  channels: MusicChannel[];
  drums: string;
}

export const DRIVING_THEME: Track = {
  bpm: 150,
  stepsPerBeat: 2,
  channels: [
    {
      // Lead melody
      wave: 'square',
      volume: 0.12,
      notes: `
        E5 .  A5 .  C6 B5 A5 E5
        F5 .  A5 .  C6 .  A5 F5
        G5 .  E5 .  G5 C6 .  G5
        B5 .  D6 .  B5 G5 D5 -
        E5 E5 A5 .  C6 B5 A5 C6
        D6 .  C6 A5 F5 .  A5 .
        E5 G5 C6 .  E6 .  D6 C6
        B5 .  G#5 . E5 .  -  -`,
    },
    {
      // Bass line
      wave: 'triangle',
      volume: 0.3,
      notes: `
        A2 A3 A2 A3 A2 A3 A2 A3
        F2 F3 F2 F3 F2 F3 F2 F3
        C3 C4 C3 C4 C3 C4 C3 C4
        G2 G3 G2 G3 G2 G3 G2 G3
        A2 A3 A2 A3 A2 A3 A2 A3
        F2 F3 F2 F3 F2 F3 F2 F3
        C3 C4 C3 C4 C3 C4 C3 C4
        E2 E3 E2 E3 E2 E3 E2 G#2`,
    },
  ],
  drums: `
    k h s h k h s h
    k h s h k h s h
    k h s h k h s h
    k h s h k k s s
    k h s h k h s h
    k h s h k h s h
    k h s h k h s h
    k h s h k s s s`,
};

export const DRUM_SOUNDS: Record<string, Tone> = {
  k: { wave: 'sine', from: 160, to: 40, ms: 140, volume: 0.6 },
  s: { wave: 'noise', from: 3500, to: 1200, ms: 110, volume: 0.25 },
  h: { wave: 'noise', from: 9000, ms: 30, volume: 0.08 },
};
