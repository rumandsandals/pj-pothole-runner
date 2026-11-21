import type { ColourKey } from '../config/theme';
import type { Bit, GameState } from '../core/state';
import { fill, toPx } from './pixels';

/**
 * Little flying pixels (dust, exhaust, asphalt chips) and screen shake.
 * Positions and speeds are in world units; sizes in art pixels.
 */

const MAX_BITS = 300; // safety limit so effects can never slow the game down

function add(bits: Bit[], bit: Bit): void {
  if (bits.length < MAX_BITS) bits.push(bit);
}

const between = (a: number, b: number): number => a + Math.random() * (b - a);

/** A soft puff that drifts back and up (wheel dust, exhaust). */
export function puff(bits: Bit[], x: number, y: number, colour: ColourKey, speed: number): void {
  add(bits, {
    x,
    y,
    vx: -speed * between(0.3, 0.6),
    vy: between(-0.6, -0.15),
    gravity: 0,
    life: Math.round(between(14, 24)),
    colour,
    size: Math.random() < 0.3 ? 3 : 2,
  });
}

/** Chips and dust thrown up into the air, falling back with gravity. */
export function burst(bits: Bit[], x: number, y: number, count: number, colours: ColourKey[], power = 1): void {
  for (let i = 0; i < count; i++) {
    add(bits, {
      x: x + between(-8, 8),
      y,
      vx: between(-2.5, 2.5) * power,
      vy: between(-5, -1.5) * power,
      gravity: 0.35,
      life: Math.round(between(18, 34)),
      colour: colours[i % colours.length] ?? '6',
      size: Math.random() < 0.35 ? 3 : 2,
    });
  }
}

export function updateBits(bits: Bit[]): Bit[] {
  for (const b of bits) {
    b.vy += b.gravity;
    b.x += b.vx;
    b.y += b.vy;
    b.life--;
  }
  return bits.filter((b) => b.life > 0);
}

export function drawBits(ctx: CanvasRenderingContext2D, bits: Bit[]): void {
  for (const b of bits) {
    // Shrink to one pixel as they fade
    const size = b.life < 6 ? 1 : b.size;
    fill(ctx, b.colour, toPx(b.x), toPx(b.y), size, size);
  }
}

// ── Screen shake ────────────────────────────────────────────
export function startShake(state: GameState, shake: { ticks: number; strength: number }): void {
  if (shake.strength <= 0 || shake.ticks <= 0) return;
  if (shake.strength >= state.shake.strength || state.shake.ticks <= 0) state.shake = { ...shake };
}

export function updateShake(state: GameState): void {
  if (state.shake.ticks > 0) state.shake.ticks--;
}

/** Random offset in art pixels for this frame (0,0 when not shaking). */
export function shakeOffset(state: GameState): [number, number] {
  if (state.shake.ticks <= 0) return [0, 0];
  const s = state.shake.strength;
  const r = (): number => Math.round(between(-s, s));
  return [r(), r()];
}
