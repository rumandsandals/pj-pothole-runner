import { ANIMATION, CAR, JETS, JUICE, PHYSICS, ROAD } from '../config/game';
import { VEHICLE_ART, type VehicleArt } from '../config/sprites';
import { THEME } from '../config/theme';
import type { Car } from '../core/state';
import { clampLane, laneY, slideLane, type Lane } from './lanes';
import { ART_WIDTH, drawSprite, fill, toPx, type Swaps } from './pixels';

/** Moves the car (lane slide + jump). Returns true on the tick it lands. */
export function updateCar(car: Car): boolean {
  let landed = false;
  car.lane = clampLane(car.lane); // in case the road just got narrower
  car.lanePos = slideLane(car.lanePos, car.lane, ROAD.changeTicks);
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

/** Moves one lane up (+1, further away) or down (-1, nearer). Returns true if the car moved. */
export function changeLane(car: Car, step: 1 | -1): boolean {
  const lane = clampLane(car.lane + step);
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

/** Your car. Swap `roadster` for `hatchback` to drive the old Mazda again. */
const PLAYER_ART = VEHICLE_ART.roadster;
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

/** A soft oval shadow on the road (darker and smaller when `strength` is lower, e.g. high in the air). */
export function groundShadow(ctx: CanvasRenderingContext2D, cx: number, y: number, halfWidth: number, strength = 1): void {
  if (halfWidth < 2) return;
  ctx.fillStyle = `rgba(11, 11, 20, ${0.28 * strength})`;
  for (let row = -2; row <= 1; row++) {
    const half = Math.round(halfWidth * Math.sqrt(1 - (row / 3) ** 2));
    ctx.fillRect(Math.round(cx - half), Math.round(y + row), half * 2, 1);
  }
}

/**
 * The Roadster's thrusters, firing while you're in the air: jet streams
 * blasting down from under the car (like the SpaceX-package Roadster) plus
 * a small puff out of the back. `power` is 1 on the way up and smaller as
 * you fall; `drop` is how far it is down to the road (art pixels).
 */
function drawJets(ctx: CanvasRenderingContext2D, left: number, top: number, time: number, power: number, drop: number): void {
  const { core, glow, tail } = THEME.jets;
  const flicker = Math.floor(time / 2) % 3;
  const nozzleY = top + 18; // just under the floor of the car

  // Jet streams straight down: behind the back wheel, under the middle, ahead of the front wheel
  for (const [i, x] of JETS.nozzles.entries()) {
    const wobble = (flicker + i) % 3;
    const length = Math.min(drop + 4, Math.round((JETS.length + wobble * 3) * (0.45 + power * 0.55)));
    for (let k = 0; k < length; k++) {
      const share = k / Math.max(1, length);
      const colour = share < 0.25 ? core : share < 0.65 ? glow : tail;
      if (colour === tail && (k + i) % 2 === 1) continue; // fade out in a dither
      const width = share < 0.15 ? 3 : share < 0.6 ? 4 : 2; // flares out then thins
      const sway = colour === tail ? ((k + wobble) % 3) - 1 : 0;
      fill(ctx, colour, left + x - Math.floor(width / 2) + sway, nozzleY + k, width, 1);
      if (colour === glow && width === 4) fill(ctx, core, left + x - 1, nozzleY + k, 2, 1); // hot centre line
    }
  }

  // A small puff out of the back
  const puff = Math.round((3 + flicker) * power);
  for (let k = 0; k < puff; k++) fill(ctx, k < 2 ? core : glow, left - 2 - k, top + 13, 1, k < 2 ? 2 : 1);
}

/** Where the jet streams hit the road: blasts of spray to each side. */
function drawJetSplash(ctx: CanvasRenderingContext2D, left: number, surface: number, time: number, power: number): void {
  const { glow, tail } = THEME.jets;
  const spread = Math.round((4 + (Math.floor(time / 3) % 3)) * power);
  for (const x of JETS.nozzles) {
    for (let k = 1; k <= spread; k++) {
      const colour = k < spread / 2 ? glow : tail;
      const lift = Math.floor((spread - k) / 3);
      fill(ctx, colour, left + x + 1 + k, surface - lift, 1, 1);
      fill(ctx, colour, left + x - 1 - k, surface - lift, 1, 1);
    }
  }
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
  shadow = true,
): void {
  if (shadow) groundShadow(ctx, box.left + box.width / 2, box.top + box.height, box.width / 2 + 2);
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
  } else if (car.onGround && ANIMATION.roughRoadJiggle > 0 && roughness >= ANIMATION.roughRoadJiggle) {
    const period = Math.max(3, Math.round(12 - roughness * 3));
    bob = Math.floor(time / period) % 2; // suspension jiggling over a rough road
  }
  const wheelDrop = car.onGround ? 0 : 2; // wheels hang lower in the air
  const surface = toPx(laneY(car.lanePos));

  // Soft shadow on the road: shrinks and fades as the car jumps higher
  if (car.sinkY === 0) {
    const height = Math.min(car.hop / 120, 1);
    groundShadow(ctx, box.left + box.width / 2, surface + 1, (box.width / 2 + 2) * (1 - height * 0.5), 1 - height * 0.6);
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

  // Juice: lean into lane changes, stretch on the way up, squash on landing
  const leanDir = Math.sign(car.lane - car.lanePos); // moving to a further lane (up the screen) or a nearer one
  const rot = car.onGround && Math.abs(car.lane - car.lanePos) > 0.02 ? -leanDir * JUICE.lean : 0;
  const rising = !car.onGround && car.vy < 0;
  const squashing = car.squash > 0;
  const sx = rising ? 1 - JUICE.stretch : squashing ? 1 + JUICE.squash : 1;
  const sy = rising ? 1 + JUICE.stretch : squashing ? 1 - JUICE.squash : 1;
  const cx = left + box.width / 2;
  const bottom = box.top + box.height;
  ctx.save();
  ctx.translate(cx, bottom);
  ctx.rotate(rot);
  ctx.scale(sx, sy);
  ctx.translate(-cx, -bottom);
  const jetPower = rising ? 1 : 0.5;
  const jetsOn = !car.onGround && !car.trapped;
  if (jetsOn) drawJets(ctx, left, box.top, time, jetPower, surface - (box.top + 18));
  drawVehicleArt(ctx, PLAYER_ART, { ...box, left }, { X: THEME.car.body, Y: THEME.car.trim }, wheelFrame(roadOffset), bob, wheelDrop, false);
  ctx.restore();
  if (sinking) ctx.restore();
  // Jets blasting the road when the car is low enough
  if (jetsOn && surface - (box.top + 18) < JETS.length + 6) drawJetSplash(ctx, left, surface, time, jetPower);

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
