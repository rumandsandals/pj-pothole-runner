import { SPAWN, TICKS_PER_SECOND } from '../config/game';
import { STORM } from '../config/storm';
import type { Car, FallenTree, Pothole, Storm, Vehicle } from '../core/state';
import { drawLane, laneCount, laneY, randomLane, sameLane, type Lane } from './lanes';
import { ART_HEIGHT, ART_WIDTH, fill, toPx } from './pixels';

/**
 * Thunderstorms (dark sky, lightning, thunder) and the trees they blow down
 * across the road. Settings are in config/storm.ts.
 */

const APPEAR_X = SPAWN.spawnX + STORM.treeHalfWidth;
const between = ([lo, hi]: [number, number]): number => lo + Math.random() * (hi - lo);

export interface StormNews {
  started: boolean;
  thunder: boolean; // lightning just struck
  ended: boolean; // the storm passed (trees start coming down)
}

/** Runs the storm. `progress` = how far through the level you are (0–1). */
export function updateStorm(storm: Storm, progress: number): StormNews {
  const news: StormNews = { started: false, thunder: false, ended: false };
  if (storm.flash > 0) storm.flash--;
  if (storm.startAt === null) return news;
  if (storm.ticks < 0) {
    if (progress < storm.startAt) return news;
    storm.ticks = 0;
    news.started = true;
  }
  const length = STORM.seconds * TICKS_PER_SECOND;
  if (storm.ticks <= length) {
    storm.ticks++;
    const fadedIn = storm.ticks > STORM.fadeSeconds * TICKS_PER_SECOND * 0.5;
    if (fadedIn && storm.ticks < length - 20 && Math.random() < STORM.lightningChancePerSecond / TICKS_PER_SECOND) {
      storm.flash = STORM.flashTicks;
      storm.bolt = makeBolt();
      news.thunder = true;
    }
    if (storm.ticks > length) {
      news.ended = true;
      const [few, many] = STORM.treesAfter;
      storm.treesLeft = few + Math.floor(Math.random() * (many - few + 1));
      storm.nextTreeIn = 0;
    }
  } else {
    storm.ticks++; // keeps counting so the darkness can fade away
  }
  return news;
}

/** How dark the sky is right now (0 = normal). */
export function stormDarkness(storm: Storm): number {
  if (storm.ticks < 0) return 0;
  const fade = STORM.fadeSeconds * TICKS_PER_SECOND;
  const length = STORM.seconds * TICKS_PER_SECOND;
  const fadeIn = Math.min(1, storm.ticks / fade);
  const fadeOut = Math.max(0, Math.min(1, (length + fade - storm.ticks) / fade));
  return STORM.darkness * Math.min(fadeIn, fadeOut);
}

/** A zig-zag lightning bolt: x positions every 12 art pixels down the sky. */
function makeBolt(): number[] {
  let x = 120 + Math.random() * (ART_WIDTH - 240);
  return Array.from({ length: 9 }, () => (x += (Math.random() - 0.5) * 26));
}

/**
 * Drops fallen trees after the storm, moves them with the road, and nudges
 * traffic out of their lane. `blocked` = somewhere a tree mustn't appear
 * (traffic lights, crossings).
 */
export function updateTrees(storm: Storm, trees: FallenTree[], speed: number, potholes: Pothole[], vehicles: Vehicle[], blocked: boolean): FallenTree[] {
  if (storm.treesLeft > 0) {
    storm.nextTreeIn -= speed;
    const potholeNear = potholes.some((p) => Math.abs(p.x - APPEAR_X) < 140);
    if (storm.nextTreeIn <= 0 && !blocked && !potholeNear) {
      trees.push({ x: APPEAR_X, lane: randomLane(), flip: Math.random() < 0.5 });
      storm.treesLeft--;
      storm.nextTreeIn = between(STORM.treeGap);
    }
  }
  for (const t of trees) {
    t.x -= speed;
    // Drivers ahead of a fallen tree pull into another lane to get round it
    for (const v of vehicles) {
      if (sameLane(v.lane, t.lane) && v.x > t.x - 140 && v.x < t.x + 260) v.lane = freeLane(t.lane);
    }
  }
  return trees.filter((t) => t.x > SPAWN.despawnX - STORM.treeHalfWidth);
}

/** Any lane except this one. */
function freeLane(lane: Lane): Lane {
  const options = Array.from({ length: laneCount() }, (_, i) => i).filter((i) => i !== lane);
  return options[Math.floor(Math.random() * options.length)] ?? lane;
}

/** Returns the index of the tree the car drove into, or -1. Jumping high enough clears it. */
export function findTreeHit(car: Car, trees: FallenTree[], inset: number): number {
  if (car.hop > STORM.treeHeight) return -1;
  const carLeft = car.x - car.width / 2 + inset;
  const carRight = car.x + car.width / 2 - inset;
  return trees.findIndex(
    (t) => sameLane(car.lanePos, t.lane) && carRight > t.x - STORM.treeHalfWidth + 4 && carLeft < t.x + STORM.treeHalfWidth - 4,
  );
}

// ── Drawing ──────────────────────────────────────────────────

/** Fallen trees in one lane (call far lane first, then near): trunk, broken roots, leafy crown. */
export function drawTrees(ctx: CanvasRenderingContext2D, trees: FallenTree[], lane: Lane): void {
  for (const t of trees) {
    if (drawLane(t.lane) !== lane) continue;
    const cx = Math.round(toPx(t.x));
    const ground = Math.round(toPx(laneY(t.lane))) + 2;
    const half = Math.round(toPx(STORM.treeHalfWidth));
    const dir = t.flip ? -1 : 1; // which end the crown is at
    // Map "along the tree" (0 = roots, 1 = crown tip) to screen x
    const at = (share: number): number => cx - dir * half + dir * share * half * 2;
    const box = (share: number, w: number, dy: number, h: number, colour: Parameters<typeof fill>[1]): void => {
      const x = at(share);
      fill(ctx, colour, dir > 0 ? x : x - w, ground + dy, w, h);
    };

    // Shadow on the road
    fill(ctx, 'g', cx - half, ground, half * 2, 2);
    // Trunk, lying along the lane, thicker at the roots
    box(0.06, Math.round(half * 1.3), -9, 8, '0');
    box(0.07, Math.round(half * 1.28), -8, 6, '4');
    box(0.07, Math.round(half * 1.28), -8, 1, 'f'); // bark highlight
    box(0.3, 3, -6, 1, '0'); // bark knots
    box(0.5, 4, -5, 1, '0');
    // Torn-up roots and a clump of earth at the base
    box(0, 6, -12, 13, '0');
    box(0.01, 4, -11, 11, '4');
    box(-0.04, 3, -13, 3, '4');
    box(-0.05, 2, -4, 3, '4');
    box(0.0, 2, -15, 3, '0');
    // Broken branches poking up
    box(0.55, 2, -14, 6, '4');
    box(0.62, 6, -15, 2, '4');
    // Leafy crown, lying on its side at the far end
    box(0.66, Math.round(half * 0.7), -20, 18, '3');
    box(0.62, Math.round(half * 0.3), -15, 12, '3');
    box(0.72, Math.round(half * 0.45), -24, 8, '3');
    box(0.7, Math.round(half * 0.25), -18, 4, 'b');
    box(0.8, Math.round(half * 0.2), -22, 3, 'b');
    box(0.88, Math.round(half * 0.12), -12, 3, 'b');
    // Scattered leaves on the road
    for (let i = 0; i < 6; i++) box(0.2 + i * 0.15, 2, 1 + (i % 2), 1, i % 2 ? 'b' : '3');
    // Warning: hazard triangle in front of it
    const sign = at(t.flip ? 1.08 : -0.08);
    fill(ctx, '0', sign - 4, ground - 9, 9, 9);
    fill(ctx, '9', sign - 3, ground - 8, 7, 7);
    fill(ctx, '0', sign, ground - 7, 1, 3);
    fill(ctx, '0', sign, ground - 3, 1, 1);
  }
}

/** Dark storm sky, and lightning flashes with a bolt. Drawn over the scene, under the HUD. */
export function drawStorm(ctx: CanvasRenderingContext2D, storm: Storm): void {
  const dark = stormDarkness(storm);
  if (dark > 0) {
    ctx.fillStyle = `rgba(16, 20, 40, ${dark})`;
    ctx.fillRect(0, 0, ART_WIDTH, ART_HEIGHT);
    // Heavier cloud band across the top of the sky
    ctx.fillStyle = `rgba(10, 12, 26, ${dark * 0.7})`;
    ctx.fillRect(0, 0, ART_WIDTH, 50);
  }
  if (storm.flash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.06 * storm.flash})`;
    ctx.fillRect(0, 0, ART_WIDTH, ART_HEIGHT);
    // The bolt, zig-zagging down from the clouds
    if (storm.flash > STORM.flashTicks / 2) {
      for (let i = 1; i < storm.bolt.length; i++) {
        const x0 = storm.bolt[i - 1] ?? 0;
        const x1 = storm.bolt[i] ?? 0;
        const steps = 12;
        for (let k = 0; k < steps; k++) {
          const x = x0 + ((x1 - x0) * k) / steps;
          const y = (i - 1) * 12 + k;
          fill(ctx, 'c', x - 1, y, 3, 1);
          fill(ctx, '7', x, y, 1, 1);
        }
      }
    }
  }
}
