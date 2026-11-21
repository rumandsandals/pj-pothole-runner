import { TRAFFIC_RULES } from '../config/traffic';
import { LIGHTS } from '../config/trafficLights';
import type { Level } from '../config/levels';
import type { Car, Signal } from '../core/state';
import { groundPx, laneLineYs, roadTop } from './lanes';
import { ART_HEIGHT, fill, toPx } from './pixels';

/**
 * Things painted on or standing beside the road: zebra crossings, and
 * traffic lights with their stop lines. They scroll with the road.
 */

const APPEAR_X = TRAFFIC_RULES.spawnAheadX; // they appear just off the right edge
const GONE_X = -80;

/** Places this level's lights and crossings as you reach them. */
export function placeFurniture(level: Level, levelDistance: number, length: number, placed: string[], signals: Signal[], crossings: number[]): void {
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
      crossings.push(APPEAR_X);
    }
  });
}

/** True when a pothole spawning now would land on a crossing or at a light. */
export const blocksPotholes = (signals: Signal[], crossings: number[]): boolean =>
  signals.some((s) => s.x > APPEAR_X - 160) || crossings.some((x) => x > APPEAR_X - 120);

/**
 * Moves lights and crossings with the road and runs each light's cycle.
 * Returns the lights you just ran on red (so the game can add heat).
 */
export function updateFurniture(signals: Signal[], crossings: number[], speed: number, car: Car, stopped: boolean): { signals: Signal[]; crossings: number[]; ranRed: Signal[] } {
  const ranRed: Signal[] = [];
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
    // The front of your car crossed the stop line on red
    if (s.phase === 'red' && !s.ran && s.x < car.x + car.width / 2 && s.x > car.x - car.width) {
      s.ran = true;
      ranRed.push(s);
    }
  }
  const moved = crossings.map((x) => x - speed);
  return { signals: signals.filter((s) => s.x > GONE_X), crossings: moved.filter((x) => x > GONE_X), ranRed };
}

/** The nearest light ahead of you that's amber or red, within `distance`. */
export function stopLightAhead(signals: Signal[], car: Car, distance: number): Signal | null {
  let best: Signal | null = null;
  for (const s of signals) {
    const ahead = s.x - (car.x + car.width / 2);
    if (s.phase !== 'green' && ahead > -4 && ahead < distance && (!best || s.x < best.x)) best = s;
  }
  return best;
}

// ── Drawing ──────────────────────────────────────────────────

/** Zebra crossings and stop lines, painted across every lane. */
export function drawRoadMarkings(ctx: CanvasRenderingContext2D, signals: Signal[], crossings: number[]): void {
  const top = Math.round(toPx(roadTop())) + 2;
  const bottom = ART_HEIGHT;
  for (const x of crossings) {
    const cx = Math.round(toPx(x));
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
