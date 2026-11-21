import { PEDESTRIANS } from '../config/pedestrians';
import { TRAFFIC_RULES } from '../config/traffic';
import { LIGHTS } from '../config/trafficLights';
import type { Level } from '../config/levels';
import type { Car, Signal } from '../core/state';
import { groundPx, laneLineYs, roadTop } from './lanes';
import { drawDog, drawLeash, drawPerson, makeStroller, makeWalkers, type Stroller, type Walker } from './pedestrians';
import { ART_HEIGHT, fill, toPx } from './pixels';

/**
 * Things on or beside the road: zebra crossings (with people crossing),
 * traffic lights with their stop lines, and people strolling on the
 * pavement. They all scroll with the road.
 */

const APPEAR_X = TRAFFIC_RULES.spawnAheadX; // they appear just off the right edge
const GONE_X = -80;

export interface Crossing {
  x: number;
  walkers: Walker[];
  started: boolean; // people have begun to cross
  passed: boolean; // you've driven over it
}

/** Somewhere traffic must stop: a red / amber light (Mat Rempit ignore these) or a busy crossing (everyone stops). */
export interface StopPoint {
  x: number;
  everyone: boolean;
}

/** Places this level's lights and crossings as you reach them. */
export function placeFurniture(level: Level, levelDistance: number, length: number, placed: string[], signals: Signal[], crossings: Crossing[]): void {
  level.trafficLights.forEach((at, i) => {
    const key = `light${i}`;
    if (!placed.includes(key) && levelDistance >= at * length) {
      placed.push(key);
      signals.push({ x: APPEAR_X, phase: 'green', timer: 0, decided: false, stoppedTicks: 0, ran: false });
    }
  });
  level.crossings.forEach((at, i) => {
    const key = `zebra${i}`;
    if (!placed.includes(key) && levelDistance >= at * length) {
      placed.push(key);
      crossings.push({ x: APPEAR_X, walkers: makeWalkers(), started: false, passed: false });
    }
  });
}

/** True when a pothole spawning now would land on a crossing or at a light. */
export const blocksPotholes = (signals: Signal[], crossings: Crossing[]): boolean =>
  signals.some((s) => s.x > APPEAR_X - 160) || crossings.some((c) => c.x > APPEAR_X - 120);

/** Someone is on the road at this crossing (or about to step out). */
const busy = (c: Crossing): boolean => c.started && c.walkers.some((w) => w.t < 1);

/**
 * Moves lights, crossings and walkers with the road and runs each light's
 * cycle. Returns what you just did wrong (so the game can add heat).
 */
export function updateFurniture(
  signals: Signal[],
  crossings: Crossing[],
  speed: number,
  car: Car,
  stopped: boolean,
): { signals: Signal[]; crossings: Crossing[]; ranRed: number; noGiveWay: number } {
  let ranRed = 0;
  let noGiveWay = 0;
  const front = car.x + car.width / 2;

  for (const s of signals) {
    s.x -= speed;
    const ahead = s.x - car.x;
    if (!s.decided && ahead < LIGHTS.changeWhenWithin) {
      s.decided = true;
      if (Math.random() < LIGHTS.redChance) {
        s.phase = 'amber';
        s.timer = LIGHTS.amberTicks;
      }
    } else if (s.phase === 'amber' && --s.timer <= 0) {
      s.phase = 'red';
      s.timer = LIGHTS.maxRedTicks;
    } else if (s.phase === 'red') {
      if (stopped && ahead > 0) s.stoppedTicks++;
      if (--s.timer <= 0 || s.stoppedTicks >= LIGHTS.greenAfterStoppedTicks) s.phase = 'green';
    }
    if (s.phase === 'red' && !s.ran && s.x < front && s.x > car.x - car.width) {
      s.ran = true;
      ranRed++;
    }
  }

  for (const c of crossings) {
    c.x -= speed;
    // People step out when you get close
    if (!c.started && c.walkers.length > 0 && c.x - car.x < PEDESTRIANS.startWithin) c.started = true;
    if (c.started) {
      for (const w of c.walkers) {
        if (w.delay > 0) {
          w.delay--;
          continue;
        }
        w.t = Math.min(1.2, w.t + (w.hurry ? 3 : 1) / PEDESTRIANS.crossTicks);
      }
    }
    // You drove over the crossing while people were on it
    if (!c.passed && c.x < front) {
      c.passed = true;
      const onRoad = c.walkers.filter((w) => w.delay <= 0 && w.t > 0.02 && w.t < 1);
      if (onRoad.length > 0) {
        noGiveWay++;
        for (const w of c.walkers) w.hurry = true; // they scramble out of the way
      }
    }
  }

  return {
    signals: signals.filter((s) => s.x > GONE_X),
    crossings: crossings.filter((c) => c.x > GONE_X),
    ranRed,
    noGiveWay,
  };
}

/** Everywhere traffic should stop right now: red / amber lights and crossings with people on them. */
export function stopPoints(signals: Signal[], crossings: Crossing[]): StopPoint[] {
  return [
    ...signals.filter((s) => s.phase !== 'green').map((s) => ({ x: s.x, everyone: false })),
    ...crossings.filter((c) => busy(c) || (!c.started && c.walkers.length > 0)).map((c) => ({ x: c.x - 22, everyone: true })),
  ];
}

/** The nearest place ahead of you that you must stop for, within `distance`. */
export function stopAhead(signals: Signal[], crossings: Crossing[], car: Car, distance: number): number | null {
  let best: number | null = null;
  const front = car.x + car.width / 2;
  const candidates = [
    ...signals.filter((s) => s.phase !== 'green').map((s) => s.x),
    ...crossings.filter((c) => busy(c) && !c.passed).map((c) => c.x - 22),
  ];
  for (const x of candidates) {
    const ahead = x - front;
    if (ahead > -4 && ahead < distance && (best === null || x < best)) best = x;
  }
  return best;
}

// ── Strollers on the pavement ───────────────────────────────
export function updateStrollers(strollers: Stroller[], speed: number, allowed: boolean): Stroller[] {
  if (allowed && strollers.length < PEDESTRIANS.maxStrollers && Math.random() < PEDESTRIANS.strollerChance) {
    strollers.push(makeStroller(true, APPEAR_X));
  }
  for (const p of strollers) p.x += p.dir * p.speed - speed;
  return strollers.filter((p) => p.x > GONE_X && p.x < APPEAR_X + 40);
}

// ── Drawing ──────────────────────────────────────────────────

/** Zebra crossings and stop lines, painted across every lane. */
export function drawRoadMarkings(ctx: CanvasRenderingContext2D, signals: Signal[], crossings: Crossing[]): void {
  const top = Math.round(toPx(roadTop())) + 2;
  const bottom = ART_HEIGHT;
  for (const c of crossings) {
    const cx = Math.round(toPx(c.x));
    for (let y = top; y < bottom; y += 8) fill(ctx, '7', cx - 20, y, 40, 4); // white bars across the road
  }
  for (const s of signals) {
    const sx = Math.round(toPx(s.x));
    fill(ctx, '7', sx - 2, top, 3, bottom - top); // stop line
    for (const y of laneLineYs()) fill(ctx, '5', sx - 2, Math.round(toPx(y)) - 1, 3, 2); // lane gaps
  }
}

/** The traffic light pole on the far kerb, with its red / amber / green lamps. */
export function drawSignalPoles(ctx: CanvasRenderingContext2D, signals: Signal[], time: number): void {
  const ground = groundPx();
  for (const s of signals) {
    const x = Math.round(toPx(s.x)) + 4;
    fill(ctx, '5', x, ground - 66, 3, 66); // pole
    fill(ctx, '0', x - 4, ground - 92, 11, 30); // signal head
    fill(ctx, 'g', x - 3, ground - 91, 9, 28);
    const lamps: Array<[Signal['phase'], number, '8' | '9' | 'b']> = [['red', 0, '8'], ['amber', 9, '9'], ['green', 18, 'b']];
    for (const [phase, dy, colour] of lamps) {
      const on = s.phase === phase && !(phase === 'amber' && Math.floor(time / 6) % 2 === 1);
      fill(ctx, on ? colour : '5', x - 1, ground - 89 + dy, 5, 6);
      if (on) fill(ctx, '7', x, ground - 88 + dy, 1, 1);
    }
    fill(ctx, 'a', x - 4, ground - 62, 11, 2); // reflective strip
  }
}

/** People (and dogs) waiting at or walking across the zebra crossings. */
export function drawCrossingPeople(ctx: CanvasRenderingContext2D, crossings: Crossing[], time: number): void {
  const fromY = groundPx() + 6; // the far kerb
  const toY = ART_HEIGHT + 26; // walk off the bottom of the screen
  for (const c of crossings) {
    const cx = toPx(c.x);
    for (const w of c.walkers) {
      if (w.t >= 1.2) continue;
      const walking = c.started && w.delay <= 0;
      const foot = fromY + (toY - fromY) * Math.max(0, w.t);
      const frame = walking ? Math.floor(time / (w.hurry ? 3 : 7)) : 0;
      const x = cx + w.offset;
      if (w.dog) {
        drawDog(ctx, x + 10, foot + 1, w.dog, frame);
        drawLeash(ctx, x + 4, foot - 12, x + 12, foot - 6);
      }
      drawPerson(ctx, x, foot, w.look, frame);
    }
  }
}

/** People strolling along the far pavement, some with dogs. */
export function drawStrollers(ctx: CanvasRenderingContext2D, strollers: Stroller[], time: number): void {
  const foot = groundPx() + 2;
  for (const p of strollers) {
    const x = toPx(p.x);
    const frame = Math.floor((time + p.x) / 8);
    if (p.dog) {
      const dogX = x + p.dir * 16;
      drawDog(ctx, dogX, foot, p.dog, frame, p.dir);
      drawLeash(ctx, x + p.dir * 3, foot - 12, dogX - p.dir * 4, foot - 6);
    }
    drawPerson(ctx, x, foot, p.look, frame, p.dir);
  }
}
