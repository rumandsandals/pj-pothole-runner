import { DRUM_SOUNDS, type Track } from '../config/music';
import type { Tone } from '../config/sounds';
import { playTone } from './synth';

interface NoteEvent {
  tone: Tone;
  steps: number; // length in steps
}

/** Reads the note rows in music.ts into a step-by-step schedule. */
function compile(track: Track): { length: number; byStep: Map<number, NoteEvent[]> } {
  const byStep = new Map<number, NoteEvent[]>();
  const add = (step: number, event: NoteEvent): void => {
    const list = byStep.get(step) ?? [];
    list.push(event);
    byStep.set(step, list);
  };
  let length = 0;

  for (const channel of track.channels) {
    const tokens = channel.notes.trim().split(/\s+/);
    length = Math.max(length, tokens.length);
    let current: NoteEvent | null = null;
    tokens.forEach((token, step) => {
      if (token === '.') {
        if (current) current.steps++;
        return;
      }
      current = null;
      if (token === '-') return;
      current = { tone: { wave: channel.wave, from: token, ms: 0, volume: channel.volume, shape: 'hold' }, steps: 1 };
      add(step, current);
    });
  }

  const drums = track.drums.trim().split(/\s+/);
  length = Math.max(length, drums.length);
  drums.forEach((token, step) => {
    const tone = DRUM_SOUNDS[token];
    if (tone) add(step, { tone, steps: 0 });
  });

  return { length, byStep };
}

const LOOKAHEAD_S = 0.15; // schedule this far ahead so timing stays tight
const TIMER_MS = 25;

/** Plays a Track on repeat until stopped. */
export class MusicPlayer {
  private timer: number | undefined;
  private out: GainNode | null = null;
  private step = 0;
  private nextTime = 0;
  private song: ReturnType<typeof compile>;
  private stepSeconds: number;
  private stepsPerBeat: number;
  private bpmOverride: number | null = null;

  constructor(
    private readonly ctx: AudioContext,
    private readonly destination: AudioNode,
    track: Track,
  ) {
    this.song = compile(track);
    this.stepsPerBeat = track.stepsPerBeat;
    this.stepSeconds = 60 / track.bpm / track.stepsPerBeat;
  }

  /** Plays at this tempo instead of the tune's own (changes smoothly, mid-song). */
  setTempo(bpm: number): void {
    this.bpmOverride = bpm;
    this.stepSeconds = 60 / bpm / this.stepsPerBeat;
  }

  /** Switches to another tune (starts it from the beginning if music is playing). */
  setTrack(track: Track): void {
    this.song = compile(track);
    this.stepsPerBeat = track.stepsPerBeat;
    this.stepSeconds = 60 / track.bpm / track.stepsPerBeat;
    if (this.bpmOverride !== null) this.setTempo(this.bpmOverride);
    if (this.playing) {
      this.stop();
      this.start();
    }
  }

  get playing(): boolean {
    return this.timer !== undefined;
  }

  start(): void {
    if (this.playing || this.song.length === 0) return;
    this.out = this.ctx.createGain();
    this.out.connect(this.destination);
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.05;
    this.timer = window.setInterval(() => this.schedule(), TIMER_MS);
    this.schedule();
  }

  stop(): void {
    window.clearInterval(this.timer);
    this.timer = undefined;
    const out = this.out;
    this.out = null;
    if (!out) return;
    // Quick fade so already-scheduled notes don't cut off with a click
    const now = this.ctx.currentTime;
    out.gain.setValueAtTime(out.gain.value, now);
    out.gain.linearRampToValueAtTime(0, now + 0.08);
    window.setTimeout(() => out.disconnect(), 400);
  }

  private schedule(): void {
    if (!this.out) return;
    // If the tab was asleep, don't try to catch up on missed notes
    if (this.nextTime < this.ctx.currentTime - 0.2) this.nextTime = this.ctx.currentTime + 0.05;
    while (this.nextTime < this.ctx.currentTime + LOOKAHEAD_S) {
      for (const event of this.song.byStep.get(this.step) ?? []) {
        const tone = event.steps > 0 ? { ...event.tone, ms: event.steps * this.stepSeconds * 1000 * 0.92 } : event.tone;
        playTone(this.ctx, this.out, tone, this.nextTime);
      }
      this.nextTime += this.stepSeconds;
      this.step = (this.step + 1) % this.song.length;
    }
  }
}
