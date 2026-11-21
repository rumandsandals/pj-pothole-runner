import type { Tone } from '../config/sounds';

/** Turns a note name like 'C4', 'F#5' or 'Bb3' into a pitch in Hz. */
const NOTE_INDEX: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6,
  G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

export function noteToHz(note: string): number {
  const match = /^([A-G][#b]?)(-?\d)$/.exec(note.trim());
  if (!match) return NaN;
  const index = NOTE_INDEX[match[1] as string];
  if (index === undefined) return NaN;
  const midi = (Number(match[2]) + 1) * 12 + index;
  return 440 * 2 ** ((midi - 69) / 12);
}

export const toHz = (value: number | string): number => (typeof value === 'number' ? value : noteToHz(value));

let noiseBuffer: AudioBuffer | null = null;
function getNoise(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

const SILENT = 0.0001;

/** Schedules one tone to play at `start` (in AudioContext seconds). */
export function playTone(ctx: AudioContext, out: AudioNode, tone: Tone, start: number): void {
  const from = toHz(tone.from);
  if (!Number.isFinite(from) || from <= 0) return; // bad note name: stay silent rather than crash
  const to = tone.to === undefined ? from : toHz(tone.to);
  const duration = Math.max(tone.ms, 5) / 1000;
  const t0 = start + (tone.at ?? 0) / 1000;
  const t1 = t0 + duration;
  const volume = Math.min(Math.max(tone.volume ?? 0.5, 0), 1);

  // Volume envelope
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(SILENT, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.004);
  if (tone.shape === 'hold') {
    gain.gain.setValueAtTime(volume, Math.max(t0 + 0.004, t1 - 0.02));
    gain.gain.linearRampToValueAtTime(SILENT, t1);
  } else {
    gain.gain.exponentialRampToValueAtTime(SILENT, t1);
  }
  gain.connect(out);

  let source: AudioScheduledSourceNode;
  if (tone.wave === 'noise') {
    const noise = ctx.createBufferSource();
    noise.buffer = getNoise(ctx);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(from, t0);
    if (Number.isFinite(to) && to !== from) filter.frequency.exponentialRampToValueAtTime(Math.max(to, 20), t1);
    noise.connect(filter).connect(gain);
    source = noise;
  } else {
    const osc = ctx.createOscillator();
    osc.type = tone.wave;
    osc.frequency.setValueAtTime(from, t0);
    if (Number.isFinite(to) && to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(to, 20), t1);
    osc.connect(gain);
    source = osc;
  }
  source.start(t0);
  source.stop(t1 + 0.03);
  source.onended = () => gain.disconnect();
}
