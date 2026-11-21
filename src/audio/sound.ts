import { MOODY, moody, TRACKS, type TrackId } from '../config/music';
import { SOUND_DEFAULTS, SOUNDS, VOLUME, type SoundName } from '../config/sounds';
import { MusicPlayer } from './music';
import { playTone } from './synth';

const STORAGE_KEYS = { effects: 'pjPotholeRunner.effectsOn', music: 'pjPotholeRunner.musicOn' };

function loadSetting(key: string, fallback: boolean): boolean {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === '1';
  } catch {
    return fallback; // private browsing etc. — just use the default
  }
}

function saveSetting(key: string, on: boolean): void {
  try {
    localStorage.setItem(key, on ? '1' : '0');
  } catch {
    /* not saved, but the game keeps working */
  }
}

/**
 * All game audio. Browsers only allow sound after the player clicks or
 * presses a key, so nothing plays until unlock() is called from one.
 */
class SoundSystem {
  effectsOn = loadSetting(STORAGE_KEYS.effects, SOUND_DEFAULTS.effectsOn);
  musicOn = loadSetting(STORAGE_KEYS.music, SOUND_DEFAULTS.musicOn);

  private ctx: AudioContext | null = null;
  private effectsOut: GainNode | null = null;
  private music: MusicPlayer | null = null;
  private listeners: Array<() => void> = [];
  private track: { id: TrackId; moody: boolean } = { id: 'town', moody: false };

  private trackData() {
    const t = TRACKS[this.track.id];
    return this.track.moody ? moody(t) : t;
  }

  /** Changes the background tune (e.g. a new tune every few levels; moody when it rains). */
  setTrack(id: TrackId, isMoody = false): void {
    if (this.track.id === id && this.track.moody === isMoody) return;
    this.track = { id, moody: isMoody };
    this.music?.setTrack(this.trackData());
    this.music?.setTempoScale(isMoody ? MOODY.tempo : 1);
  }

  private bpm: number | null = null;

  /** Sets the music tempo (beats per minute), e.g. faster on later levels. */
  setTempo(bpm: number): void {
    this.bpm = bpm;
    this.music?.setTempo(bpm);
  }

  /** Call from any click / key press. Safe to call many times. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return; // very old browser: play silently
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = VOLUME.master;
      master.connect(ctx.destination);
      this.effectsOut = ctx.createGain();
      this.effectsOut.gain.value = VOLUME.effects;
      this.effectsOut.connect(master);
      const musicOut = ctx.createGain();
      musicOut.gain.value = VOLUME.music;
      musicOut.connect(master);
      this.music = new MusicPlayer(ctx, musicOut, this.trackData());
      this.music.setTempoScale(this.track.moody ? MOODY.tempo : 1);
      if (this.bpm !== null) this.music.setTempo(this.bpm);
      this.ctx = ctx;
      document.addEventListener('visibilitychange', () => this.onVisibility());
    }
    if (this.ctx.state === 'suspended' && !document.hidden) void this.ctx.resume();
    if (this.musicOn) this.music?.start();
  }

  play(name: SoundName): void {
    const ctx = this.ctx;
    if (!this.effectsOn || !ctx || !this.effectsOut || ctx.state !== 'running') return;
    const start = ctx.currentTime + 0.01;
    for (const tone of SOUNDS[name]) playTone(ctx, this.effectsOut, tone, start);
  }

  setEffects(on: boolean): void {
    this.effectsOn = on;
    saveSetting(STORAGE_KEYS.effects, on);
    this.notify();
  }

  setMusic(on: boolean): void {
    this.musicOn = on;
    saveSetting(STORAGE_KEYS.music, on);
    if (on) this.unlock();
    else this.music?.stop();
    this.notify();
  }

  onChange(listener: () => void): void {
    this.listeners.push(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }

  /** Go quiet when the tab is hidden; pick up again when it's back. */
  private onVisibility(): void {
    if (!this.ctx) return;
    if (document.hidden) void this.ctx.suspend();
    else void this.ctx.resume();
  }
}

export const sound = new SoundSystem();
