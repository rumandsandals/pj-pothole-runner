import { SPAWN, WORLD } from '../config/game';
import type { Level } from '../config/levels';
import { POTHOLES } from '../config/potholes';
import { THEME } from '../config/theme';
import type { Car, Pothole } from '../core/state';

const MAX_DEPTH = Math.max(...Object.values(POTHOLES).map((p) => p.depth));

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
  const g = WORLD.groundY;
  const t = THEME.pothole;

  for (const p of potholes) {
    const cfg = POTHOLES[p.type];
    const hw = cfg.halfWidth;

    // Hole
    ctx.fillStyle = t.fill;
    ctx.beginPath();
    ctx.moveTo(p.x - hw, g + 1);
    ctx.bezierCurveTo(p.x - hw * 0.45, g + cfg.depth, p.x + hw * 0.45, g + cfg.depth, p.x + hw, g + 1);
    ctx.closePath();
    ctx.fill();

    // Inner shading — deeper holes look darker
    const shade = 0.25 + Math.min(cfg.depth / MAX_DEPTH, 1) * 0.5;
    ctx.fillStyle = `rgba(${t.shadeRgb},${shade})`;
    ctx.beginPath();
    ctx.moveTo(p.x - hw * 0.5, g + 2);
    ctx.bezierCurveTo(p.x - hw * 0.2, g + cfg.depth * 0.72, p.x + hw * 0.2, g + cfg.depth * 0.72, p.x + hw * 0.5, g + 2);
    ctx.closePath();
    ctx.fill();

    // Cracks either side
    ctx.strokeStyle = t.crack;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(p.x - hw - 10, g);
    ctx.lineTo(p.x - hw, g + 1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x + hw + 10, g);
    ctx.lineTo(p.x + hw, g + 1);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label (DEEP / ABYSS)
    if (cfg.label) {
      ctx.fillStyle = t.label;
      ctx.font = `bold ${cfg.depth >= 60 ? 11 : 9}px ${THEME.font}`;
      ctx.textAlign = 'center';
      ctx.fillText(cfg.label, p.x, g - 7);
    }

    // Damage dots
    const dots = Math.min(Math.ceil((cfg.damage || 1) / 10), 5);
    ctx.fillStyle = t.damageDot;
    for (let i = 0; i < dots; i++) {
      ctx.beginPath();
      ctx.arc(p.x - (dots - 1) * 3 + i * 6, g - 17, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
