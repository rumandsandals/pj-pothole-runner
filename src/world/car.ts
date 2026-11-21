import { ANIMATION, CAR, LANES, PHYSICS } from '../config/game';
import { VEHICLE_ART, type VehicleArt } from '../config/sprites';
import { THEME } from '../config/theme';
import type { Car } from '../core/state';
import { laneY, slideLane, type Lane } from './lanes';
import { ART_WIDTH, drawSprite, fill, toPx, type Swaps } from './pixels';

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

export type Box = { left: number; top: number; width: number; height: number };

/** Where a vehicle's picture goes (art pixels), given its centre x and the road height under it. */
export function vehicleBox(art: VehicleArt, x: number, y: number): Box {
  const width = art.body[0]?.length ?? 0;
  const height = art.body.length;
  return { left: toPx(x) - Math.floor(width / 2), top: toPx(y) - height + 1, width, height };
}

const PLAYER_ART = VEHICLE_ART.hatchback;
export const carSpriteBox = (car: Car): Box => vehicleBox(PLAYER_ART, car.x, car.y + car.sinkY);

/** Which of the two wheel pictures to show, so wheels turn as the road moves. */
export function wheelFrame(distance: number): 0 | 1 {
  if (ANIMATION.wheelSpinEvery <= 0) return 0;
  return Math.floor(distance / ANIMATION.wheelSpinEvery) % 2 === 0 ? 0 : 1;
}

/** Back-wheel position in world units (for dust and exhaust). */
export function rearWheelWorld(car: Car): { x: number; y: number } {
  const box = carSpriteBox(car);
  return { x: car.x - box.width / 2 + (PLAYER_ART.wheelX[0] ?? 10), y: car.y + car.sinkY - 2 };
}

/**
 * Draws any vehicle from its art (see VEHICLE_ART in sprites.ts): the body,
 * then the wheels on top. `bob` lifts/drops the body for suspension;
 * `wheelDrop` lowers the wheels (in the air).
 */
export function drawVehicleArt(
  ctx: CanvasRenderingContext2D,
  art: VehicleArt,
  box: Box,
  paint: Swaps,
  frame: 0 | 1,
  bob = 0,
  wheelDrop = 0,
): void {
  drawSprite(ctx, art.body, box.left, box.top + bob, paint);
  const wheel = art.wheels[frame];
  const r = Math.floor(wheel.length / 2);
  for (const wx of art.wheelX) drawSprite(ctx, wheel, box.left + wx - r, box.top + art.wheelY - r + wheelDrop);
}

export function drawCar(ctx: CanvasRenderingContext2D, car: Car, time: number, roadOffset: number, roughness: number, pace = 1): void {
  const blinkHidden = car.invulnerable > 0 && Math.floor(time / 4) % 2 === 0;
  if (blinkHidden) return;

  const box = carSpriteBox(car);
  let shiftX = 0;
  let bob = 0;
  if (car.trapped) {
    shiftX = Math.floor(time / 3) % 2 === 0 ? -2 : 2; // engine straining / wreck shuddering
  } else if (car.squash > 0) {
    bob = 2; // squashed after landing
  } else if (car.onGround && ANIMATION.roughRoadJiggle > 0 && roughness >= ANIMATION.roughRoadJiggle) {
    const period = Math.max(3, Math.round(12 - roughness * 3));
    bob = Math.floor(time / period) % 2; // suspension jiggling over a rough road
  }
  const wheelDrop = car.onGround ? 0 : 2; // wheels hang lower in the air
  const surface = toPx(laneY(car.lanePos));

  // Shadow on the road while jumping
  if (!car.onGround) {
    const shrink = Math.min(Math.floor(car.hop / 8), 14);
    fill(ctx, '0', box.left + 6 + shrink, surface, box.width - 12 - shrink * 2, 2);
  }

  // Sinking into an ABYSS: hide the part of the car below the road surface
  const sinking = car.sinkY > 0;
  if (sinking) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, ART_WIDTH, surface + 5);
    ctx.clip();
  }
  const left = box.left + shiftX;
  drawVehicleArt(ctx, PLAYER_ART, { ...box, left }, { X: THEME.car.body, Y: THEME.car.trim }, wheelFrame(roadOffset), bob, wheelDrop);
  if (sinking) ctx.restore();

  if (!car.trapped && !sinking) {
    // Brake lights glow while slowing down
    if (pace < 0.97) {
      fill(ctx, '7', left, box.top + bob + 9, 2, 2);
      fill(ctx, '8', left - 2, box.top + bob + 8, 2, 4);
      fill(ctx, '8', left - 4, box.top + bob + 9, 2, 2);
    }
    // Speed lines while on the gas
    if (pace > 1.1) {
      const flicker = Math.floor(time / 3) % 2 * 2;
      for (let i = 0; i < 3; i++) fill(ctx, '7', left - 10 - i * 8 - flicker, box.top + 5 + i * 5, 6, 1);
    }
  }

  // Smoke when stuck or wrecked
  if (car.trapped || car.sinkY > 5) {
    const top = Math.min(box.top, surface - 24);
    for (let i = 0; i < 5; i++) {
      const size = 3 + i;
      fill(ctx, THEME.smoke, box.left + 4 - i * 6, top + 10 - i * 5 - ((time >> 3) % 2) * 2, size, size);
    }
  }
}
