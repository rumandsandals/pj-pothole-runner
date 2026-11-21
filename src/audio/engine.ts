import { ENGINE } from '../config/sounds';

/**
 * The car's engine: two detuned oscillators (a buzzy sawtooth and a low
 * square for rumble) through a soft filter. setSpeed() moves the pitch
 * through simulated gears, with a short lift when changing gear.
 */
export class Engine {
  private readonly saw: OscillatorNode;
  private readonly sub: OscillatorNode;
  private readonly filter: BiquadFilterNode;
  private readonly gain: GainNode;
  private gear = 0;
  private running = false;

  constructor(private readonly ctx: AudioContext, destination: AudioNode) {
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = ENGINE.brightness;
    this.filter.Q.value = 2;
    this.saw = ctx.createOscillator();
    this.saw.type = 'sawtooth';
    this.sub = ctx.createOscillator();
    this.sub.type = 'square';
    const subGain = ctx.createGain();
    subGain.gain.value = 0.5;
    this.saw.connect(this.filter);
    this.sub.connect(subGain).connect(this.filter);
    this.filter.connect(this.gain).connect(destination);
    this.saw.frequency.value = ENGINE.idleHz;
    this.sub.frequency.value = ENGINE.idleHz / 2;
    this.saw.start();
    this.sub.start();
  }

  /** speed = how fast the car is going (null = silent, e.g. on a menu). */
  setSpeed(speed: number | null): void {
    const now = this.ctx.currentTime;
    if (speed === null) {
      if (this.running) this.gain.gain.setTargetAtTime(0, now, 0.08);
      this.running = false;
      return;
    }
    if (!this.running) this.gain.gain.setTargetAtTime(ENGINE.volume, now, 0.15);
    this.running = true;

    // Which gear are we in, and how far through it?
    const tops = ENGINE.gears;
    let gear = tops.findIndex((top) => speed <= top);
    if (gear < 0) gear = tops.length - 1;
    const low = gear === 0 ? 0 : (tops[gear - 1] ?? 0);
    const high = tops[gear] ?? low + 1;
    const share = Math.min(1, Math.max(0, (speed - low) / (high - low)));
    const hz = speed < 0.05 ? ENGINE.idleHz : ENGINE.gearLowHz + share * (ENGINE.gearHighHz - ENGINE.gearLowHz);

    if (gear > this.gear && this.gear >= 0) {
      // Shift up: lift off for a moment
      const dip = ENGINE.shiftDipMs / 1000;
      this.gain.gain.cancelScheduledValues(now);
      this.gain.gain.setValueAtTime(this.gain.gain.value, now);
      this.gain.gain.linearRampToValueAtTime(ENGINE.volume * 0.35, now + dip * 0.4);
      this.gain.gain.linearRampToValueAtTime(ENGINE.volume, now + dip);
    }
    this.gear = gear;
    this.saw.frequency.setTargetAtTime(hz, now, 0.06);
    this.sub.frequency.setTargetAtTime(hz / 2 + 0.7, now, 0.06); // slightly detuned for a throaty beat
    this.filter.frequency.setTargetAtTime(ENGINE.brightness + share * 350, now, 0.1);
  }
}
