import { SPAWN, WORLD } from '../config/game';
import type { Level } from '../config/levels';
import { POTHOLES } from '../config/potholes';
import { THEME } from '../config/theme';
import type { Car, Pothole } from '../core/state';
import { ART_GROUND, drawText, fill, toPx } from './pixels';

export function maybeSpawnPothole(potholes: Pothole[], level: Level, speed: number): void {
  const onScreen = potholes.filter((p) => p.x > 0 && p.x < WORLD.width).length;
  const last = potholes[potholes.length - 1];
  const gapOk = !last || SPAWN.spawnX - last.x > SPAWN.minGap;
  if (onScreen >= SPAWN.maxOnScreen || !gapOk) return;
  if (Math.random() >= level.spawnChance * speed) return;

  const type = level.potholes[Math.floor(Math.random() * level.potholes.length)];
  if (type) potholes.push({ x: SPAWN.spawnX, type });
}

export function movePotholes(potholes: Pothole[], speed: number): Pothole[] {
  for (const p of potholes) p.x -= speed;
  return potholes.filter((p) => p.x > SPAWN.despawnX);
}

/** Returns the index of the pothole the car drove into, or -1. */
export function findCollision(car: Car, potholes: Pothole[], carInset: number): number {
  if (!car.onGround || car.y < WORLD.groundY - 3) return -1;
  const carLeft = car.x - car.width / 2 + carInset;
  const carRight = car.x + car.width / 2 - carInset;
  for (let i = potholes.length - 1; i >= 0; i--) {
    const p = potholes[i];
    if (!p) continue;
    const hw = POTHOLES[p.type].halfWidth;
    const left = p.x - hw + SPAWN.hitboxInset;
    const right = p.x + hw - SPAWN.hitboxInset;
    if (carRight > left && carLeft < right) return i;
  }
  return -1;
}

export function drawPotholes(ctx: CanvasRenderingContext2D, potholes: Pothole[]): void {
  const t = THEME.pothole;

  for (const p of potholes) {
    const cfg = POTHOLES[p.type];
    const cx = toPx(p.x);
    const hw = Math.max(toPx(cfg.halfWidth), 2);
    const depth = Math.max(toPx(cfg.depth), 2);

    // Bowl-shaped hole, one pixel column at a time
    for (let i = -hw; i <= hw; i++) {
      const t01 = i / hw;
      const d = Math.max(1, Math.round(depth * (1 - t01 * t01)));
      fill(ctx, t.hole, cx + i, ART_GROUND, 1, d);
    }
    // Broken edges
    fill(ctx, t.rim, cx - hw - 1, ART_GROUND, 1, 1);
    fill(ctx, t.rim, cx + hw + 1, ART_GROUND, 1, 1);
    fill(ctx, t.rim, cx - hw - 3, ART_GROUND + 1, 1, 1);
    fill(ctx, t.rim, cx + hw + 2, ART_GROUND + 1, 1, 1);

    // Label (DEEP / ABYSS)
    if (cfg.label) drawText(ctx, cfg.label, cx, ART_GROUND - 12, t.label, { align: 'center', shadow: t.labelShadow });

    // Damage dots
    const dots = Math.min(Math.ceil((cfg.damage || 1) / 10), 5);
    for (let i = 0; i < dots; i++) fill(ctx, t.damageDot, cx - (dots - 1) * 1.5 + i * 3, ART_GROUND - 5, 2, 2);
  }
}
