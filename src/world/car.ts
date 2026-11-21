import { CAR, PHYSICS, WORLD } from '../config/game';
import { CAR_SPRITE } from '../config/sprites';
import { THEME } from '../config/theme';
import type { Car } from '../core/state';
import { drawSprite, fill, toPx } from './pixels';

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

const SPRITE_W = CAR_SPRITE[0]?.length ?? 0;
const SPRITE_H = CAR_SPRITE.length;

/** Where the car's sprite is drawn, in art pixels. */
export function carSpriteBox(car: Car): { left: number; top: number; width: number; height: number } {
  return {
    left: toPx(car.x) - Math.floor(SPRITE_W / 2),
    top: toPx(car.y + car.sinkY) - SPRITE_H + 1,
    width: SPRITE_W,
    height: SPRITE_H,
  };
}

export function drawCar(ctx: CanvasRenderingContext2D, car: Car, tick: number): void {
  const blinkHidden = car.invulnerable > 0 && Math.floor(tick / 4) % 2 === 0;
  if (blinkHidden) return;

  const box = carSpriteBox(car);

  // Shadow on the road while jumping
  if (!car.onGround) {
    const shrink = Math.min(Math.floor((WORLD.groundY - car.y) / 12), 6);
    fill(ctx, '0', box.left + 3 + shrink, toPx(WORLD.groundY) + 1, SPRITE_W - 6 - shrink * 2, 1);
  }

  drawSprite(ctx, CAR_SPRITE, box.left, box.top, { X: THEME.car.body, Y: THEME.car.trim });

  // Smoke when stuck
  if (car.trapped || car.sinkY > 5) {
    for (let i = 0; i < 4; i++) {
      const size = 2 + Math.floor(i / 2);
      fill(ctx, THEME.smoke, box.left - 3 - i * 3, box.top + 6 - i * 2 - ((tick >> 3) % 2), size, size);
    }
  }
}
