import { LANES } from '../config/game';
import type { LevelTraffic } from '../config/levels';
import { MOTORCYCLE_SPRITE } from '../config/sprites';
import { CAR_PAINT, REMPIT_PAINT, RIDER_PAINT, TRAFFIC_RULES, VEHICLES, type VehicleKind } from '../config/traffic';
import type { Car, Vehicle } from '../core/state';
import { carBoxAt, drawCarSprite, wheelFrame } from './car';
import { drawLane, laneY, randomLane, sameLane, slideLane, type Lane } from './lanes';
import { drawSprite, drawText, fill, toPx } from './pixels';

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)] as T;
const between = ([a, b]: [number, number]): number => a + Math.random() * (b - a);

/** Maybe adds a vehicle this tick. Returns it (so the game can play a sound), or null. */
export function maybeSpawnVehicle(vehicles: Vehicle[], traffic: LevelTraffic | null): Vehicle | null {
  if (!traffic || vehicles.length >= traffic.maxOnScreen) return null;
  if (Math.random() >= traffic.spawnChance) return null;

  const rempit = Math.random() < traffic.rempitChance;
  const kind: VehicleKind = rempit ? 'rempit' : Math.random() < traffic.motorcycleShare ? 'motorcycle' : 'car';
  const x = rempit ? TRAFFIC_RULES.rempitStartX : TRAFFIC_RULES.spawnAheadX;
  const lane = randomLane();

  // Keep space between vehicles, and never block both lanes at once
  const tooClose = vehicles.some((v) =>
    sameLane(v.lanePos, lane)
      ? Math.abs(v.x - x) < TRAFFIC_RULES.minGapSameLane
      : Math.abs(v.x - x) < TRAFFIC_RULES.minGapOtherLane,
  );
  if (tooClose) return null;

  const vehicle: Vehicle = {
    kind,
    x,
    lane,
    lanePos: lane,
    speedShare: between(VEHICLES[kind].speed),
    paint: kind === 'car' ? pick(CAR_PAINT) : kind === 'rempit' ? { ...REMPIT_PAINT } : pick(RIDER_PAINT),
    willChangeLane: kind === 'car' && Math.random() < traffic.laneChangeChance,
    signal: -1,
    changed: false,
  };
  vehicles.push(vehicle);
  return vehicle;
}

const laneIsClear = (vehicles: Vehicle[], me: Vehicle, lane: Lane): boolean =>
  !vehicles.some((v) => v !== me && sameLane(v.lanePos, lane) && Math.abs(v.x - me.x) < TRAFFIC_RULES.minGapOtherLane);

/** Moves traffic relative to the player and handles lane changes. */
export function updateVehicles(vehicles: Vehicle[], playerSpeed: number, roadSpeed: number, player: Car): Vehicle[] {
  for (const v of vehicles) {
    v.x += roadSpeed * v.speedShare - playerSpeed; // brake and slow traffic pulls away; speed up and you catch it

    // Cars that change lane: blink first, then move over
    const ahead = v.x - player.x;
    if (v.willChangeLane && !v.changed && v.signal < 0 && ahead > 60 && ahead < TRAFFIC_RULES.laneChangeWithin) {
      v.signal = TRAFFIC_RULES.laneChangeSignalTicks;
    }
    if (v.signal > 0 && --v.signal === 0) {
      const target: Lane = v.lane === 0 ? 1 : 0;
      if (laneIsClear(vehicles, v, target)) v.lane = target;
      v.changed = true;
      v.signal = -1;
    }

    // Mat Rempit weave once while still behind you — but only into a lane
    // that's clear around you, so both lanes are never blocked at once
    if (v.kind === 'rempit' && !v.changed && v.x > player.x - 170) {
      v.changed = true;
      const target: Lane = v.lane === 0 ? 1 : 0;
      const clearNearPlayer = !vehicles.some(
        (o) => o !== v && sameLane(o.lanePos, target) && o.x > player.x - 60 && o.x < player.x + 200,
      );
      if (Math.random() < 0.5 && clearNearPlayer) v.lane = target;
    }

    v.lanePos = slideLane(v.lanePos, v.lane, v.kind === 'rempit' ? LANES.changeTicks : LANES.changeTicks * 2);
  }
  return vehicles.filter((v) => v.x > -340 && v.x < 820);
}

/** Index of the vehicle the player hit, or -1. Jumping high enough clears it. */
export function findVehicleHit(car: Car, vehicles: Vehicle[], inset: number): number {
  const left = car.x - car.width / 2 + inset;
  const right = car.x + car.width / 2 - inset;
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (!v || !sameLane(car.lanePos, v.lanePos)) continue;
    const type = VEHICLES[v.kind];
    if (car.hop >= type.height) continue;
    if (right > v.x - type.halfWidth && left < v.x + type.halfWidth) return i;
  }
  return -1;
}

/** Removes vehicles near the player (used after an accident, so you aren't hit again straight away). */
export function clearAround(vehicles: Vehicle[], x: number, distance: number): Vehicle[] {
  return vehicles.filter((v) => Math.abs(v.x - x) > distance);
}

const MOTO_W = MOTORCYCLE_SPRITE[0]?.length ?? 0;
const MOTO_H = MOTORCYCLE_SPRITE.length;

/** Draws the vehicles in one lane (call far lane first, then near). */
export function drawVehicles(ctx: CanvasRenderingContext2D, vehicles: Vehicle[], lane: Lane, time: number, roadOffset: number): void {
  for (const v of vehicles) {
    if (drawLane(v.lanePos) !== lane) continue;
    const surface = laneY(v.lanePos);

    if (v.kind === 'car') {
      const box = carBoxAt(v.x, surface);
      const travelled = roadOffset * v.speedShare + v.x;
      drawCarSprite(ctx, box, { X: v.paint.X ?? '6', Y: v.paint.Y ?? '5' }, wheelFrame(travelled));
      // Blinking indicator before a lane change
      if (v.signal > 0 && Math.floor(time / 6) % 2 === 0) {
        fill(ctx, '9', box.left, box.top + 5, 1, 2);
        fill(ctx, '9', box.left + box.width - 1, box.top + 5, 1, 2);
      }
      continue;
    }

    // Motorcycles (and Mat Rempit, with speed lines)
    const left = toPx(v.x) - Math.floor(MOTO_W / 2);
    const top = toPx(surface) - MOTO_H + 1 - (Math.floor(time / 4) % 2); // little bounce
    if (v.kind === 'rempit') {
      for (let i = 0; i < 3; i++) fill(ctx, '7', left - 4 - i * 5, top + 4 + i * 2, 3, 1);
    }
    drawSprite(ctx, MOTORCYCLE_SPRITE, left, top, v.paint);
  }
}

/** Flashing "!" at the left edge where a Mat Rempit is about to appear. */
export function drawRempitWarnings(ctx: CanvasRenderingContext2D, vehicles: Vehicle[], time: number): void {
  if (Math.floor(time / 8) % 2 === 1) return;
  for (const v of vehicles) {
    if (v.kind !== 'rempit' || v.x > -10) continue;
    const y = toPx(laneY(v.lanePos)) - 10;
    fill(ctx, '0', 1, y - 2, 9, 9);
    drawText(ctx, '!', 3, y - 1, '8', { scale: 1 });
    drawText(ctx, '>', 6, y - 1, 'a', { scale: 1 });
  }
}
