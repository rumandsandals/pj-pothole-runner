import { ANIMATION, CAR, PHYSICS, WORLD } from '../config/game';
import { CAR_BODY_SPRITE, WHEEL_FRAME_1, WHEEL_FRAME_2, WHEEL_POSITIONS } from '../config/sprites';
import { THEME } from '../config/theme';
import type { Car } from '../core/state';
import { drawSprite, fill, toPx } from './pixels';

/** Moves the car. Returns true on the tick it lands from a jump. */
export function updateCar(car: Car): boolean {
  let landed = false;
  if (!car.onGround) {
    car.vy += PHYSICS.gravity;
    car.y += car.vy;
    if (car.y >= WORLD.groundY) {
      car.y = WORLD.groundY;
      car.vy = 0;
      car.onGround = true;
      car.squash = ANIMATION.landingSquashTicks;
      landed = true;
    }
  }
  if (car.invulnerable > 0) car.invulnerable--;
  if (car.squash > 0) car.squash--;
  return landed;
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

const BODY_W = CAR_BODY_SPRITE[0]?.length ?? 0;
const BODY_H = CAR_BODY_SPRITE.length;
const WHEEL_H = WHEEL_FRAME_1.length;

/** Where the whole car (body + wheels) is drawn, in art pixels. */
export function carSpriteBox(car: Car): { left: number; top: number; width: number; height: number } {
  const height = BODY_H + WHEEL_H;
  return {
    left: toPx(car.x) - Math.floor(BODY_W / 2),
    top: toPx(car.y + car.sinkY) - height + 1,
    width: BODY_W,
    height,
  };
}

/** Which wheel picture to show, so wheels turn as the road moves. */
export function wheelFrame(distance: number): string[] {
  if (ANIMATION.wheelSpinEvery <= 0) return WHEEL_FRAME_1;
  return Math.floor(distance / ANIMATION.wheelSpinEvery) % 2 === 0 ? WHEEL_FRAME_1 : WHEEL_FRAME_2;
}

/** Back-wheel position in world units (for dust and exhaust). */
export function rearWheelWorld(car: Car): { x: number; y: number } {
  return { x: car.x - car.width / 2 + 4, y: car.y + car.sinkY - 2 };
}

export function drawCar(ctx: CanvasRenderingContext2D, car: Car, time: number, roadOffset: number, roughness: number): void {
  const blinkHidden = car.invulnerable > 0 && Math.floor(time / 4) % 2 === 0;
  if (blinkHidden) return;

  const box = carSpriteBox(car);
  let shiftX = 0;
  let bob = 0;
  if (car.trapped) {
    shiftX = Math.floor(time / 3) % 2 === 0 ? -1 : 1; // engine straining
  } else if (car.squash > 0) {
    bob = 1; // squashed after landing
  } else if (car.onGround && ANIMATION.roughRoadJiggle > 0 && roughness >= ANIMATION.roughRoadJiggle) {
    const period = Math.max(3, Math.round(12 - roughness * 3));
    bob = Math.floor(time / period) % 2; // suspension jiggling over a rough road
  }
  // In the air the wheels hang a pixel lower (suspension stretched)
  const wheelDrop = car.onGround ? 0 : 1;

  // Shadow on the road while jumping
  if (!car.onGround) {
    const shrink = Math.min(Math.floor((WORLD.groundY - car.y) / 12), 6);
    fill(ctx, '0', box.left + 3 + shrink, toPx(WORLD.groundY) + 1, BODY_W - 6 - shrink * 2, 1);
  }

  const wheels = wheelFrame(roadOffset);
  for (const wx of WHEEL_POSITIONS.car) {
    drawSprite(ctx, wheels, box.left + shiftX + wx, box.top + BODY_H + wheelDrop);
  }
  drawSprite(ctx, CAR_BODY_SPRITE, box.left + shiftX, box.top + bob, { X: THEME.car.body, Y: THEME.car.trim });

  // Smoke when stuck
  if (car.trapped || car.sinkY > 5) {
    for (let i = 0; i < 4; i++) {
      const size = 2 + Math.floor(i / 2);
      fill(ctx, THEME.smoke, box.left - 3 - i * 3, box.top + 6 - i * 2 - ((time >> 3) % 2), size, size);
    }
  }
}
