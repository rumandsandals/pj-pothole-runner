import { CAR, PHYSICS, WORLD } from '../config/game';
import { THEME } from '../config/theme';
import type { Car } from '../core/state';

export function updateCar(car: Car): void {
  if (!car.onGround) {
    car.vy += PHYSICS.gravity;
    car.y += car.vy;
    if (car.y >= WORLD.groundY) {
      car.y = WORLD.groundY;
      car.vy = 0;
      car.onGround = true;
    }
  }
  if (car.invulnerable > 0) car.invulnerable--;
}

/** Returns true once the car has fully sunk into an ABYSS pothole. */
export function updateSinking(car: Car): boolean {
  if (car.sinkY <= 0) return false;
  car.sinkY = Math.min(car.sinkY + CAR.sinkSpeed, car.sinkTarget);
  return car.sinkY >= car.sinkTarget;
}

export function canJump(car: Car): boolean {
  return car.onGround && !car.trapped && car.sinkY === 0;
}

export function jump(car: Car): void {
  car.vy = PHYSICS.jumpForce;
  car.onGround = false;
}

export function resetAfterRecovery(car: Car): void {
  car.trapped = false;
  car.sinkY = 0;
  car.sinkTarget = 0;
  car.invulnerable = CAR.invulnerableAfterRecovery;
}

export function drawCar(ctx: CanvasRenderingContext2D, car: Car, tick: number): void {
  const blinkHidden = car.invulnerable > 0 && Math.floor(tick / 4) % 2 === 0;
  if (blinkHidden) return;

  const t = THEME.car;
  const stuck = car.trapped || car.sinkY > 0;
  ctx.globalAlpha = stuck ? 0.65 : 1;
  const x = car.x - car.width / 2;
  const y = car.y - car.height + car.sinkY;
  const w = car.width;
  const h = car.height;

  // Shadow
  ctx.fillStyle = t.shadow;
  ctx.beginPath();
  ctx.ellipse(car.x, WORLD.groundY + 2, w / 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body + roof
  ctx.fillStyle = t.body;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = t.roof;
  ctx.fillRect(x + 8, y - 11, w - 16, 11);

  // Windows
  ctx.fillStyle = t.window;
  ctx.fillRect(x + 10, y - 10, 11, 8);
  ctx.fillRect(x + 24, y - 10, 10, 8);
  ctx.fillStyle = t.glare;
  ctx.fillRect(x + 10, y - 10, 4, 3);
  ctx.fillRect(x + 24, y - 10, 3, 3);

  // Headlights
  ctx.fillStyle = t.headlight;
  ctx.fillRect(x + w - 4, y + 4, 4, 4);
  ctx.fillRect(x + w - 4, y + h - 9, 4, 4);

  // Wheels
  for (const wx of [x + 7, x + w - 13]) {
    ctx.fillStyle = t.tyre;
    ctx.fillRect(wx - 1, y + h - 4, 12, 9);
    ctx.fillStyle = t.rim;
    ctx.fillRect(wx + 1, y + h - 2, 8, 5);
    ctx.fillStyle = t.hub;
    ctx.beginPath();
    ctx.arc(wx + 5, y + h, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smoke when stuck
  if (car.trapped || car.sinkY > 5) {
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = `rgba(${t.smokeRgb},${0.45 - i * 0.1})`;
      ctx.beginPath();
      ctx.arc(x - 5 - i * 6, y + h - 8 + i * 1.5, 3 + i, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
