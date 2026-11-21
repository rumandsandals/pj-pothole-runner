import { LANES } from '../config/game';
import type { LevelTraffic } from '../config/levels';
import { VEHICLE_ART } from '../config/sprites';
import { CAR_PAINT, CYCLIST_PAINT, REMPIT_PAINT, RIDER_PAINT, TRAFFIC_RULES, VEHICLES, type VehicleKind } from '../config/traffic';
import type { Car, Vehicle } from '../core/state';
import { drawVehicleArt, vehicleBox, wheelFrame } from './car';
import { drawLane, laneY, randomLane, sameLane, slideLane, type Lane } from './lanes';
import { drawText, fill, toPx } from './pixels';

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)] as T;
const between = ([a, b]: [number, number]): number => a + Math.random() * (b - a);
const KINDS = Object.keys(VEHICLES) as VehicleKind[];

/** Picks a vehicle from one group (cars or two-wheelers), weighted by `mix`. */
function pickKind(group: 'car' | 'twoWheeler'): VehicleKind {
  const options = KINDS.filter((k) => VEHICLES[k].group === group);
  let roll = Math.random() * options.reduce((sum, k) => sum + VEHICLES[k].mix, 0);
  for (const k of options) {
    roll -= VEHICLES[k].mix;
    if (roll < 0) return k;
  }
  return options[0] ?? 'sedan';
}

function paintFor(kind: VehicleKind): Vehicle['paint'] {
  if (kind === 'rempit') return { ...REMPIT_PAINT };
  if (kind === 'motorcycle') return { ...pick(RIDER_PAINT) };
  if (kind === 'bicycle') return { ...pick(CYCLIST_PAINT) };
  return { ...pick(CAR_PAINT) };
}

/** Maybe adds a vehicle this tick. Returns it (so the game can play a sound), or null. */
export function maybeSpawnVehicle(vehicles: Vehicle[], traffic: LevelTraffic | null): Vehicle | null {
  if (!traffic || vehicles.length >= traffic.maxOnScreen) return null;
  if (Math.random() >= traffic.spawnChance) return null;

  const rempit = Math.random() < traffic.rempitChance;
  const kind: VehicleKind = rempit ? 'rempit' : pickKind(Math.random() < traffic.motorcycleShare ? 'twoWheeler' : 'car');
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
    paint: paintFor(kind),
    willChangeLane: VEHICLES[kind].group === 'car' && Math.random() < traffic.laneChangeChance,
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
    // Don't drive through a slower vehicle ahead in the same lane: follow it instead
    let share = v.speedShare;
    for (const o of vehicles) {
      const gap = o.x - v.x;
      if (o !== v && gap > 0 && gap < TRAFFIC_RULES.followGap && sameLane(o.lanePos, v.lanePos)) share = Math.min(share, o.speedShare);
    }
    v.x += roadSpeed * share - playerSpeed; // brake and slow traffic pulls away; speed up and you catch it

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

/** Draws the vehicles in one lane (call far lane first, then near). */
export function drawVehicles(ctx: CanvasRenderingContext2D, vehicles: Vehicle[], lane: Lane, time: number, roadOffset: number): void {
  for (const v of vehicles) {
    if (drawLane(v.lanePos) !== lane) continue;
    const type = VEHICLES[v.kind];
    const art = VEHICLE_ART[type.art];
    const box = vehicleBox(art, v.x, laneY(v.lanePos));
    const travelled = roadOffset * v.speedShare + v.x;
    // Two-wheelers bounce a little; bicycles wobble from side to side
    const bob = type.group === 'car' ? 0 : -(Math.floor((time + v.x) / 4) % 2);
    if (v.kind === 'bicycle' && TRAFFIC_RULES.bicycleWobble) box.left += Math.round(Math.sin((time + v.x) / 9));

    // Mat Rempit: speed lines streaming behind
    if (v.kind === 'rempit') {
      for (let i = 0; i < 3; i++) fill(ctx, '7', box.left - 8 - i * 9, box.top + 10 + i * 5, 6, 1);
    }

    drawVehicleArt(ctx, art, box, v.paint, wheelFrame(travelled), bob);

    // Blinking indicators before a lane change (front and back corners)
    if (v.signal > 0 && Math.floor(time / 6) % 2 === 0) {
      const y = box.top + Math.round(box.height * 0.45);
      fill(ctx, '9', box.left - 1, y, 3, 3);
      fill(ctx, '9', box.left + box.width - 2, y, 3, 3);
    }
  }
}

/** Flashing "!>" at the left edge where a Mat Rempit is about to appear. */
export function drawRempitWarnings(ctx: CanvasRenderingContext2D, vehicles: Vehicle[], time: number): void {
  if (Math.floor(time / 8) % 2 === 1) return;
  for (const v of vehicles) {
    if (v.kind !== 'rempit' || v.x > -10) continue;
    const y = toPx(laneY(v.lanePos)) - 24;
    fill(ctx, '0', 2, y - 4, 20, 18);
    fill(ctx, '8', 2, y - 4, 20, 1);
    drawText(ctx, '!', 5, y, '8');
    drawText(ctx, '>', 13, y, 'a');
  }
}
