import { ANIMATION, SPAWN, WORLD } from '../config/game';
import type { Level } from '../config/levels';
import { POTHOLES } from '../config/potholes';
import { THEME } from '../config/theme';
import type { Car, Pothole } from '../core/state';
import { drawLane, laneY, randomLane, sameLane, type Lane } from './lanes';
import { drawText, fill, toPx } from './pixels';

export function maybeSpawnPothole(potholes: Pothole[], level: Level, speed: number): void {
  const onScreen = potholes.filter((p) => p.x > 0 && p.x < WORLD.width).length;
  const last = potholes[potholes.length - 1];
  const gapOk = !last || SPAWN.spawnX - last.x > SPAWN.minGap;
  if (onScreen >= SPAWN.maxOnScreen || !gapOk) return;
  if (Math.random() >= level.spawnChance * speed) return;

  const type = level.potholes[Math.floor(Math.random() * level.potholes.length)];
  if (type) potholes.push({ x: SPAWN.spawnX, type, lane: randomLane() });
}

export function movePotholes(potholes: Pothole[], speed: number): Pothole[] {
  for (const p of potholes) p.x -= speed;
  return potholes.filter((p) => p.x > SPAWN.despawnX);
}

/** Returns the index of the pothole the car drove into, or -1. */
export function findCollision(car: Car, potholes: Pothole[], carInset: number): number {
  if (!car.onGround || car.hop > 3) return -1;
  const carLeft = car.x - car.width / 2 + carInset;
  const carRight = car.x + car.width / 2 - carInset;
  for (let i = potholes.length - 1; i >= 0; i--) {
    const p = potholes[i];
    if (!p || !sameLane(car.lanePos, p.lane)) continue;
    const hw = POTHOLES[p.type].halfWidth;
    const left = p.x - hw + SPAWN.hitboxInset;
    const right = p.x + hw - SPAWN.hitboxInset;
    if (carRight > left && carLeft < right) return i;
  }
  return -1;
}

/** How tall a hole looks on the road surface (art pixels): deeper = bigger. */
const holeHeight = (depth: number): number => Math.max(2, Math.round(toPx(depth) / 5));

/** Draws the potholes in one lane (call far lane first, then near). */
export function drawPotholes(ctx: CanvasRenderingContext2D, potholes: Pothole[], lane: Lane, time: number): void {
  const t = THEME.pothole;
  const blinkEvery = ANIMATION.labelBlinkEvery;
  const blinkOff = blinkEvery > 0 && Math.floor(time / blinkEvery) % 2 === 1;

  for (const p of potholes) {
    if (drawLane(p.lane) !== lane) continue;
    const cfg = POTHOLES[p.type];
    const cx = toPx(p.x);
    const surface = toPx(laneY(p.lane));
    const hw = Math.max(toPx(cfg.halfWidth), 2);
    const h = holeHeight(cfg.depth);
    const top = surface - Math.floor(h / 2);

    // Oval hole, one pixel row at a time
    for (let row = 0; row < h; row++) {
      const fromCentre = (row + 0.5 - h / 2) / (h / 2);
      const half = Math.round(hw * Math.sqrt(Math.max(0, 1 - fromCentre * fromCentre)));
      fill(ctx, t.hole, cx - half, top + row, half * 2 + 1, 1);
    }
    // Broken edges: lighter chips at the ends and along the far rim
    fill(ctx, t.rim, cx - hw - 1, surface, 1, 1);
    fill(ctx, t.rim, cx + hw + 1, surface, 1, 1);
    fill(ctx, t.rim, cx - hw - 3, surface + 1, 1, 1);
    fill(ctx, t.rim, cx + hw + 2, surface - 1, 1, 1);
    fill(ctx, t.rim, cx - Math.floor(hw / 2), top - 1, Math.max(2, hw), 1);

    // Label (DEEP / ABYSS); car-trapping holes flash theirs
    if (cfg.label && !(cfg.trapsCar && blinkOff)) {
      drawText(ctx, cfg.label, cx, surface - 17, t.label, { align: 'center', shadow: t.labelShadow });
    }

    // Damage dots
    const dots = Math.min(Math.ceil((cfg.damage || 1) / 10), 5);
    for (let i = 0; i < dots; i++) fill(ctx, t.damageDot, cx - (dots - 1) * 1.5 + i * 3, surface - 9, 2, 2);
  }
}
