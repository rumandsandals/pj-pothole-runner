import type { Tone, Wave } from './sounds';

/**
 * BACKGROUND MUSIC: three original chiptune loops.
 *   TOWN    — levels 1–3 (the first tune)
 *   CITY    — levels 4–6, faster, in D minor
 *   HIGHWAY — levels 7–9, fastest, in E minor
 * Which tune each level uses is set by `music` in levels.ts. On rainy and
 * stormy levels a slower, softer "moody" version plays (see moody() below).
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

export const TOWN_THEME: Track = {
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

/** City tune: D minor. Bars: Dm | Bb | F | C | Dm | Bb | Gm | A */
export const CITY_THEME: Track = {
  bpm: 162,
  stepsPerBeat: 2,
  channels: [
    {
      wave: 'square',
      volume: 0.11,
      notes: `
        D5 .  F5 A5 D6 .  A5 F5
        Bb5 . A5 F5 D5 .  F5 .
        C6 .  A5 F5 C6 .  D6 C6
        E5 .  G5 C6 E6 .  D6 C6
        D6 .  A5 .  F5 A5 D6 E6
        F6 .  D6 Bb5 F5 . D6 .
        G5 Bb5 D6 . G6 .  F6 D6
        C#6 . A5 .  E5 .  -  -`,
    },
    {
      wave: 'triangle',
      volume: 0.3,
      notes: `
        D2 .  D3 D2 .  D2 D3 .
        Bb1 . Bb2 Bb1 . Bb1 Bb2 .
        F2 .  F3 F2 .  F2 F3 .
        C2 .  C3 C2 .  C2 C3 .
        D2 .  D3 D2 .  D2 D3 .
        Bb1 . Bb2 Bb1 . Bb1 Bb2 .
        G2 .  G3 G2 .  G2 G3 .
        A2 .  A3 A2 .  A2 C#3 E3`,
    },
  ],
  drums: `
    k h s h k k s h
    k h s h k k s h
    k h s h k k s h
    k h s h k s s s
    k h s h k k s h
    k h s h k k s h
    k h s h k k s h
    k s k s k s s s`,
};

/** Highway tune: E minor, fast, with an arpeggio. Bars: Em | C | G | D | Em | C | Am | B */
export const HIGHWAY_THEME: Track = {
  bpm: 176,
  stepsPerBeat: 2,
  channels: [
    {
      wave: 'square',
      volume: 0.11,
      notes: `
        E5 G5 B5 E6 B5 G5 E5 G5
        C6 .  G5 E5 C6 .  E6 .
        D6 .  B5 G5 D6 .  G6 .
        F#6 . D6 A5 F#5 A5 D6 .
        E6 .  B5 .  G5 B5 E6 F#6
        G6 .  E6 C6 G5 .  E6 .
        A5 C6 E6 .  A6 .  G6 E6
        D#6 . B5 .  F#5 . B5 -`,
    },
    {
      wave: 'triangle',
      volume: 0.3,
      notes: `
        E2 E2 E3 E2 E2 E2 E3 E2
        C2 C2 C3 C2 C2 C2 C3 C2
        G2 G2 G3 G2 G2 G2 G3 G2
        D2 D2 D3 D2 D2 D2 D3 D2
        E2 E2 E3 E2 E2 E2 E3 E2
        C2 C2 C3 C2 C2 C2 C3 C2
        A2 A2 A3 A2 A2 A2 A3 A2
        B1 B1 B2 B1 B1 B2 D#3 F#3`,
    },
  ],
  drums: `
    k h s k k h s h
    k h s k k h s h
    k h s k k h s h
    k h s k k s s s
    k h s k k h s h
    k h s k k h s h
    k h s k k h s h
    k s s k s s s s`,
};

export const TRACKS = { town: TOWN_THEME, city: CITY_THEME, highway: HIGHWAY_THEME };
export type TrackId = keyof typeof TRACKS;

/** The rainy-day version of a tune: slower, softer lead, no hi-hats. */
export const MOODY = { tempo: 0.8, leadWave: 'triangle' as Wave, leadVolume: 1.4 };

export function moody(track: Track): Track {
  return {
    ...track,
    bpm: Math.round(track.bpm * MOODY.tempo),
    channels: track.channels.map((c, i) => (i === 0 ? { ...c, wave: MOODY.leadWave, volume: c.volume * MOODY.leadVolume } : c)),
    drums: track.drums.replace(/\bh\b/g, '-'),
  };
}

export const DRUM_SOUNDS: Record<string, Tone> = {
  k: { wave: 'sine', from: 160, to: 40, ms: 140, volume: 0.6 },
  s: { wave: 'noise', from: 3500, to: 1200, ms: 110, volume: 0.25 },
  h: { wave: 'noise', from: 9000, ms: 30, volume: 0.08 },
};
