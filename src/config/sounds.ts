/**
 * SOUND EFFECTS
 * Every sound is made by the browser on the fly (like an old arcade
 * machine). No audio files, nothing to license.
 *
 * A sound is a list of tones. Each tone:
 *   wave    'square' (buzzy, classic), 'triangle' (soft), 'sawtooth' (harsh),
 *           'sine' (pure) or 'noise' (hiss / crunch)
 *   from    starting pitch: a note like 'C5' or a number in Hz
 *           (for noise it's how bright the hiss is)
 *   to      optional ending pitch, for a slide up or down
 *   ms      how long it lasts
 *   at      optional delay in ms before it starts (to make little tunes)
 *   volume  0 to 1 (default 0.5)
 */

export type Wave = 'square' | 'triangle' | 'sawtooth' | 'sine' | 'noise';

export interface Tone {
  wave: Wave;
  from: number | string;
  to?: number | string;
  ms: number;
  at?: number;
  volume?: number;
  /** 'pluck' fades away (default for effects); 'hold' stays steady then stops (used for music). */
  shape?: 'pluck' | 'hold';
}

/** Overall volumes, 0 to 1. */
export const VOLUME = {
  master: 0.8,
  effects: 0.45,
  music: 0.3,
};

/** What a new player hears before they change anything. */
export const SOUND_DEFAULTS = {
  effectsOn: true,
  musicOn: false,
};

export const SOUNDS = {
  jump: [{ wave: 'square', from: 280, to: 720, ms: 140, volume: 0.35 }],
  land: [
    { wave: 'noise', from: 900, to: 200, ms: 80, volume: 0.7 },
    { wave: 'sine', from: 120, to: 60, ms: 80, volume: 0.4 },
  ],
  hit: [
    { wave: 'noise', from: 2500, to: 300, ms: 180, volume: 0.6 },
    { wave: 'square', from: 180, to: 70, ms: 180, volume: 0.35 },
  ],
  hitBig: [
    { wave: 'noise', from: 3000, to: 150, ms: 320, volume: 0.75 },
    { wave: 'sawtooth', from: 160, to: 45, ms: 320, volume: 0.4 },
  ],
  stuck: [
    { wave: 'noise', from: 2000, to: 100, ms: 400, volume: 0.7 },
    { wave: 'sawtooth', from: 320, to: 50, ms: 700, volume: 0.4 },
    { wave: 'square', from: 'C3', ms: 120, at: 750, volume: 0.3 },
    { wave: 'square', from: 'B2', ms: 120, at: 900, volume: 0.3 },
    { wave: 'square', from: 'A#2', ms: 320, at: 1050, volume: 0.3 },
  ],
  lane: [{ wave: 'triangle', from: 'A4', to: 'D5', ms: 70, volume: 0.25 }],
  rev: [
    { wave: 'sawtooth', from: 70, to: 260, ms: 450, volume: 0.22 },
    { wave: 'sawtooth', from: 260, to: 180, ms: 250, at: 450, volume: 0.18 },
  ],
  bikeCrash: [
    { wave: 'noise', from: 3500, to: 200, ms: 350, volume: 0.65 },
    { wave: 'square', from: 400, to: 90, ms: 300, volume: 0.3 },
  ],
  carCrash: [
    { wave: 'noise', from: 4000, to: 80, ms: 600, volume: 0.8 },
    { wave: 'sawtooth', from: 180, to: 40, ms: 600, volume: 0.45 },
    { wave: 'square', from: 'E5', ms: 60, at: 650, volume: 0.15 },
    { wave: 'square', from: 'E5', ms: 60, at: 760, volume: 0.15 },
  ],
  coin: [
    { wave: 'square', from: 'B5', ms: 60, volume: 0.25 },
    { wave: 'square', from: 'E6', ms: 140, at: 60, volume: 0.25 },
  ],
  click: [{ wave: 'square', from: 'C6', ms: 35, volume: 0.2 }],
  go: [
    { wave: 'square', from: 'C5', ms: 90, volume: 0.3 },
    { wave: 'square', from: 'G5', ms: 200, at: 100, volume: 0.3 },
  ],
  levelClear: [
    { wave: 'square', from: 'C5', ms: 90, volume: 0.3 },
    { wave: 'square', from: 'E5', ms: 90, at: 100, volume: 0.3 },
    { wave: 'square', from: 'G5', ms: 90, at: 200, volume: 0.3 },
    { wave: 'square', from: 'C6', ms: 380, at: 300, volume: 0.3 },
    { wave: 'triangle', from: 'C4', ms: 680, volume: 0.4, shape: 'hold' },
  ],
  eventPop: [
    { wave: 'triangle', from: 'E5', ms: 80, volume: 0.45 },
    { wave: 'triangle', from: 'A5', ms: 160, at: 90, volume: 0.45 },
  ],
  good: [
    { wave: 'square', from: 'E5', ms: 70, volume: 0.28 },
    { wave: 'square', from: 'G#5', ms: 70, at: 80, volume: 0.28 },
    { wave: 'square', from: 'B5', ms: 200, at: 160, volume: 0.28 },
  ],
  bad: [
    { wave: 'sawtooth', from: 'E3', ms: 160, volume: 0.3 },
    { wave: 'sawtooth', from: 'D#3', ms: 360, at: 170, volume: 0.3 },
  ],
  horn: [
    { wave: 'square', from: 'G4', ms: 180, volume: 0.25 },
    { wave: 'square', from: 'B4', ms: 180, volume: 0.2 },
    { wave: 'square', from: 'G4', ms: 300, at: 250, volume: 0.25 },
    { wave: 'square', from: 'B4', ms: 300, at: 250, volume: 0.2 },
  ],
  crash: [
    { wave: 'noise', from: 4000, to: 60, ms: 900, volume: 0.8 },
    { wave: 'sawtooth', from: 200, to: 30, ms: 900, volume: 0.4 },
    { wave: 'square', from: 'G4', ms: 200, at: 1000, volume: 0.3 },
    { wave: 'square', from: 'F#4', ms: 200, at: 1220, volume: 0.3 },
    { wave: 'square', from: 'F4', ms: 200, at: 1440, volume: 0.3 },
    { wave: 'square', from: 'E4', ms: 600, at: 1660, volume: 0.3 },
  ],
  win: [
    { wave: 'square', from: 'G4', ms: 120, volume: 0.3 },
    { wave: 'square', from: 'C5', ms: 120, at: 130, volume: 0.3 },
    { wave: 'square', from: 'E5', ms: 120, at: 260, volume: 0.3 },
    { wave: 'square', from: 'G5', ms: 250, at: 390, volume: 0.3 },
    { wave: 'square', from: 'E5', ms: 120, at: 660, volume: 0.3 },
    { wave: 'square', from: 'G5', ms: 700, at: 790, volume: 0.3 },
    { wave: 'triangle', from: 'C4', ms: 1500, volume: 0.4, shape: 'hold' },
  ],
} satisfies Record<string, Tone[]>;

export type SoundName = keyof typeof SOUNDS;
