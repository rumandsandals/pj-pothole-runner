import { ANIMATION, CAR, LANES, PHYSICS } from '../config/game';
import { CAR_BODY_SPRITE, WHEEL_FRAME_1, WHEEL_FRAME_2, WHEEL_POSITIONS } from '../config/sprites';
import { THEME, type ColourKey } from '../config/theme';
import type { Car } from '../core/state';
import { laneY, slideLane, type Lane } from './lanes';
import { ART_WIDTH, drawSprite, fill, toPx } from './pixels';

/** Moves the car (lane slide + jump). Returns true on the tick it lands. */
export function updateCar(car: Car): boolean {
  let landed = false;
  car.lanePos = slideLane(car.lanePos, car.lane, LANES.changeTicks);
  if (!car.onGround) {
    car.vy += PHYSICS.gravity;
    car.hop -= car.vy;
    if (car.hop <= 0) {
      car.hop = 0;
      car.vy = 0;
      car.onGround = true;
      car.squash = ANIMATION.landingSquashTicks;
      landed = true;
    }
  }
  car.y = laneY(car.lanePos) - car.hop;
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

const canDrive = (car: Car): boolean => !car.trapped && car.sinkY === 0 && car.crashTimer === 0;

export function canJump(car: Car): boolean {
  return car.onGround && canDrive(car);
}

export function jump(car: Car): void {
  car.vy = PHYSICS.jumpForce;
  car.onGround = false;
}

/** Switches lane. Returns true if the car actually moved. */
export function changeLane(car: Car, lane: Lane): boolean {
  if (!canDrive(car) || car.lane === lane) return false;
  car.lane = lane;
  return true;
}

/** Puts the car straight into a lane (no slide), e.g. when stuck in a pothole. */
export function snapToLane(car: Car, lane: Lane): void {
  car.lane = lane;
  car.lanePos = lane;
  car.y = laneY(lane) - car.hop;
}

export function resetAfterRecovery(car: Car): void {
  car.trapped = false;
  car.sinkY = 0;
  car.sinkTarget = 0;
  car.crashTimer = 0;
  car.invulnerable = CAR.invulnerableAfterRecovery;
}

const BODY_W = CAR_BODY_SPRITE[0]?.length ?? 0;
const BODY_H = CAR_BODY_SPRITE.length;
const WHEEL_H = WHEEL_FRAME_1.length;

/** Where a car (body + wheels) is drawn, in art pixels, given its x and wheel height. */
export function carBoxAt(x: number, y: number): { left: number; top: number; width: number; height: number } {
  const height = BODY_H + WHEEL_H;
  return { left: toPx(x) - Math.floor(BODY_W / 2), top: toPx(y) - height + 1, width: BODY_W, height };
}

export const carSpriteBox = (car: Car): ReturnType<typeof carBoxAt> => carBoxAt(car.x, car.y + car.sinkY);

/** Which wheel picture to show, so wheels turn as the road moves. */
export function wheelFrame(distance: number): string[] {
  if (ANIMATION.wheelSpinEvery <= 0) return WHEEL_FRAME_1;
  return Math.floor(distance / ANIMATION.wheelSpinEvery) % 2 === 0 ? WHEEL_FRAME_1 : WHEEL_FRAME_2;
}

/** Back-wheel position in world units (for dust and exhaust). */
export function rearWheelWorld(car: Car): { x: number; y: number } {
  return { x: car.x - car.width / 2 + 4, y: car.y + car.sinkY - 2 };
}

/**
 * Draws any car: the player's or traffic. `bob` lifts/drops the body for
 * suspension; `wheelDrop` lowers the wheels (in the air).
 */
export function drawCarSprite(
  ctx: CanvasRenderingContext2D,
  box: ReturnType<typeof carBoxAt>,
  paint: { X: ColourKey; Y: ColourKey },
  wheels: string[],
  bob = 0,
  wheelDrop = 0,
): void {
  for (const wx of WHEEL_POSITIONS.car) drawSprite(ctx, wheels, box.left + wx, box.top + BODY_H + wheelDrop);
  drawSprite(ctx, CAR_BODY_SPRITE, box.left, box.top + bob, paint);
}

export function drawCar(ctx: CanvasRenderingContext2D, car: Car, time: number, roadOffset: number, roughness: number, pace = 1): void {
  const blinkHidden = car.invulnerable > 0 && Math.floor(time / 4) % 2 === 0;
  if (blinkHidden) return;

  const box = carSpriteBox(car);
  let shiftX = 0;
  let bob = 0;
  if (car.trapped) {
    shiftX = Math.floor(time / 3) % 2 === 0 ? -1 : 1; // engine straining / wreck shuddering
  } else if (car.squash > 0) {
    bob = 1; // squashed after landing
  } else if (car.onGround && ANIMATION.roughRoadJiggle > 0 && roughness >= ANIMATION.roughRoadJiggle) {
    const period = Math.max(3, Math.round(12 - roughness * 3));
    bob = Math.floor(time / period) % 2; // suspension jiggling over a rough road
  }
  const wheelDrop = car.onGround ? 0 : 1; // wheels hang lower in the air
  const surface = toPx(laneY(car.lanePos));

  // Shadow on the road while jumping
  if (!car.onGround) {
    const shrink = Math.min(Math.floor(car.hop / 12), 6);
    fill(ctx, '0', box.left + 3 + shrink, surface + 1, BODY_W - 6 - shrink * 2, 1);
  }

  // Sinking into an ABYSS: hide the part of the car below the road surface
  const sinking = car.sinkY > 0;
  if (sinking) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, ART_WIDTH, surface + 3);
    ctx.clip();
  }
  drawCarSprite(ctx, { ...box, left: box.left + shiftX }, { X: THEME.car.body, Y: THEME.car.trim }, wheelFrame(roadOffset), bob, wheelDrop);
  if (sinking) ctx.restore();

  if (!car.trapped && !sinking) {
    const left = box.left + shiftX;
    // Brake lights glow while slowing down
    if (pace < 0.97) {
      fill(ctx, '9', left, box.top + bob + 6, 1, 1);
      fill(ctx, '8', left - 1, box.top + bob + 5, 1, 3);
      fill(ctx, '8', left - 2, box.top + bob + 6, 1, 1);
    }
    // Speed lines while on the gas
    if (pace > 1.1) {
      const flicker = Math.floor(time / 3) % 2;
      for (let i = 0; i < 3; i++) fill(ctx, '7', left - 5 - i * 4 - flicker, box.top + 3 + i * 3, 3, 1);
    }
  }

  // Smoke when stuck or wrecked
  if (car.trapped || car.sinkY > 5) {
    const top = Math.min(box.top, surface - 12);
    for (let i = 0; i < 4; i++) {
      const size = 2 + Math.floor(i / 2);
      fill(ctx, THEME.smoke, box.left - 3 - i * 3, top + 6 - i * 2 - ((time >> 3) % 2), size, size);
    }
  }
}
