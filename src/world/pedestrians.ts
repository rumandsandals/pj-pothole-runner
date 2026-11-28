import { DOGS, LOOKS, PEDESTRIANS } from '../config/pedestrians';
import type { ColourKey } from '../config/theme';
import { fill } from './pixels';

/**
 * People (and dogs) drawn in pixel art: crossing at zebra crossings and
 * strolling along the pavement.
 */

export interface Look {
  skin: ColourKey;
  hair: ColourKey;
  tudung: ColourKey | null;
  top: ColourKey;
  bottom: ColourKey;
}

export interface DogLook {
  coat: ColourKey;
  patch: ColourKey;
}

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)] as T;

export function randomLook(): Look {
  return {
    skin: pick(LOOKS.skin),
    hair: pick(LOOKS.hair),
    tudung: Math.random() < LOOKS.tudungChance ? pick(LOOKS.tudung) : null,
    top: pick(LOOKS.top),
    bottom: pick(LOOKS.bottom),
  };
}

export const randomDog = (): DogLook => ({ ...pick(DOGS) });

/**
 * A person about 22 px tall, standing on (x, foot). `frame` swings the legs
 * and arms; `facing` 1 = right, -1 = left.
 */
export function drawPerson(ctx: CanvasRenderingContext2D, x: number, foot: number, look: Look, frame: number, facing: 1 | -1 = 1): void {
  const left = Math.round(x) - 3;
  const top = Math.round(foot) - 22;
  const step = frame % 2;
  // legs
  fill(ctx, look.bottom, left + 1 + (step ? -1 : 0), top + 14, 2, 7);
  fill(ctx, look.bottom, left + 4 + (step ? 1 : 0), top + 14, 2, 7);
  fill(ctx, '0', left + (step ? 0 : 1), top + 21, 3, 1); // shoes
  fill(ctx, '0', left + 4 + (step ? 1 : 0), top + 21, 3, 1);
  // body and arms
  fill(ctx, look.top, left, top + 7, 7, 8);
  fill(ctx, look.skin, left - 1 + (step ? 0 : 1), top + 8, 1, 6);
  fill(ctx, look.skin, left + 7 - (step ? 0 : 1), top + 8, 1, 6);
  // head
  fill(ctx, look.skin, left + 1, top + 1, 5, 6);
  if (look.tudung) {
    fill(ctx, look.tudung, left, top, 7, 3);
    fill(ctx, look.tudung, left, top + 3, 1, 5);
    fill(ctx, look.tudung, left + 6, top + 3, 1, 5);
    fill(ctx, look.tudung, left, top + 7, 7, 2); // drape over the shoulders
  } else {
    fill(ctx, look.hair, left + 1, top, 5, 2);
    fill(ctx, look.hair, facing === 1 ? left + 1 : left + 5, top + 2, 1, 2);
  }
  fill(ctx, '0', facing === 1 ? left + 4 : left + 2, top + 3, 1, 1); // eye
}

/** A person lying on the road after being hit (kept simple and non-graphic). */
export function drawPersonDown(ctx: CanvasRenderingContext2D, x: number, foot: number, look: Look): void {
  const left = Math.round(x) - 11;
  const top = Math.round(foot) - 5;
  fill(ctx, 'g', left - 1, top + 5, 24, 1); // shadow
  fill(ctx, look.bottom, left, top + 2, 8, 3); // legs
  fill(ctx, '0', left - 1, top + 2, 1, 3); // shoes
  fill(ctx, look.top, left + 8, top + 1, 8, 4); // body
  fill(ctx, look.skin, left + 10, top, 4, 1); // arm
  fill(ctx, look.tudung ?? look.skin, left + 16, top + 1, 5, 4); // head
  if (!look.tudung) fill(ctx, look.hair, left + 19, top + 1, 2, 4);
}

/** A small dog about 8 px tall, trotting. */
export function drawDog(ctx: CanvasRenderingContext2D, x: number, foot: number, dog: DogLook, frame: number, facing: 1 | -1 = 1): void {
  const left = Math.round(x) - 6;
  const top = Math.round(foot) - 8;
  const step = frame % 2;
  const f = (dx: number, dy: number, w: number, h: number, c: ColourKey): void =>
    fill(ctx, c, facing === 1 ? left + dx : left + 12 - dx - w, top + dy, w, h);
  f(1, 3, 9, 3, dog.coat); // body
  f(9, 0, 4, 4, dog.coat); // head
  f(9, 0, 2, 2, dog.patch); // ear
  f(12, 2, 1, 1, '0'); // nose
  f(0, 1 + step, 1, 2, dog.coat); // wagging tail
  f(2 + step, 6, 1, 2, dog.coat); // legs
  f(5 - step, 6, 1, 2, dog.coat);
  f(8 + step, 6, 1, 2, dog.coat);
}

/** A leash from the person's hand to the dog's collar. */
export function drawLeash(ctx: CanvasRenderingContext2D, handX: number, handY: number, dogX: number, dogY: number): void {
  const steps = Math.max(Math.abs(dogX - handX), Math.abs(dogY - handY), 1);
  for (let i = 0; i <= steps; i += 2) {
    fill(ctx, '8', handX + ((dogX - handX) * i) / steps, handY + ((dogY - handY) * i) / steps + Math.sin((i / steps) * Math.PI) * 2, 1, 1);
  }
}

// ── People crossing the road ─────────────────────────────────
export interface Walker {
  offset: number; // where along the crossing they walk (world units from its centre)
  delay: number; // ticks before stepping out
  t: number; // 0 = on the far kerb, 1 = across
  look: Look;
  dog: DogLook | null;
  hurry: boolean; // scrambling out of the way of a car that didn't stop
  down?: boolean; // hit by your car, lying on the road
}

export function makeWalkers(): Walker[] {
  if (Math.random() >= PEDESTRIANS.crossingChance) return [];
  const [min, max] = PEDESTRIANS.peoplePerCrossing;
  const count = min + Math.floor(Math.random() * (max - min + 1));
  return Array.from({ length: count }, (_, i) => ({
    offset: -10 + i * 9 + Math.round(Math.random() * 4),
    delay: i * PEDESTRIANS.stagger,
    t: 0,
    look: randomLook(),
    dog: Math.random() < PEDESTRIANS.dogChance ? randomDog() : null,
    hurry: false,
  }));
}

// ── People strolling on the pavement ─────────────────────────
export interface Stroller {
  x: number; // world position
  dir: 1 | -1;
  speed: number;
  look: Look;
  dog: DogLook | null;
}

export function makeStroller(fromRight: boolean, appearX: number): Stroller {
  const [lo, hi] = PEDESTRIANS.strollSpeed;
  return {
    x: fromRight ? appearX : -30,
    dir: Math.random() < 0.5 ? 1 : -1,
    speed: lo + Math.random() * (hi - lo),
    look: randomLook(),
    dog: Math.random() < PEDESTRIANS.strollerDogChance ? randomDog() : null,
  };
}
