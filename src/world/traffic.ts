import { ROAD } from '../config/game';
import type { LevelTraffic } from '../config/levels';
import { VEHICLE_ART } from '../config/sprites';
import { CAR_PAINT, CYCLIST_PAINT, REMPIT, REMPIT_PAINT, RIDER_PAINT, TRAFFIC_RULES, VEHICLES, type VehicleKind } from '../config/traffic';
import type { Car, Vehicle } from '../core/state';
import type { StopPoint } from './streetFurniture';
import { LIGHTS } from '../config/trafficLights';
import { drawVehicleArt, vehicleBox, wheelFrame } from './car';
import { drawLane, laneCount, laneHeight, laneY, neighbourLane, randomLane, sameLane, slideLane, type Lane } from './lanes';
import { drawText, fill, toPx } from './pixels';

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)] as T;
const between = ([a, b]: [number, number]): number => a + Math.random() * (b - a);
const KINDS = Object.keys(VEHICLES) as VehicleKind[];

/** Picks a vehicle from one group (cars or two-wheelers), weighted by `mix`. */
function pickKind(group: 'car' | 'twoWheeler', highway: boolean): VehicleKind {
  const options = KINDS.filter(
    (k) => VEHICLES[k].group === group && !(highway && !VEHICLES[k].onHighway) && laneCount() <= VEHICLES[k].maxLanes,
  );
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
export function maybeSpawnVehicle(vehicles: Vehicle[], traffic: LevelTraffic | null, highway = false): Vehicle | null {
  if (!traffic || vehicles.length >= traffic.maxOnScreen) return null;
  if (Math.random() >= traffic.spawnChance) return null;

  const rempit = Math.random() < traffic.rempitChance;
  const kind: VehicleKind = rempit ? 'rempit' : pickKind(Math.random() < traffic.motorcycleShare ? 'twoWheeler' : 'car', highway);
  const x = rempit ? TRAFFIC_RULES.rempitStartX : TRAFFIC_RULES.spawnAheadX;
  const lane = rempit && laneCount() > 1 && Math.random() < REMPIT.splitChance ? randomLine() : randomLane();

  // Keep space between vehicles in a lane, and never block every lane at once
  const sameLaneClash = vehicles.some((v) => sameLane(v.lanePos, lane) && Math.abs(v.x - x) < TRAFFIC_RULES.minGapSameLane);
  const busyLanes = new Set(vehicles.filter((v) => Math.abs(v.x - x) < TRAFFIC_RULES.minGapOtherLane).map((v) => drawLane(v.lanePos)));
  busyLanes.add(lane);
  if (sameLaneClash || busyLanes.size >= laneCount()) return null;

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

// ── Lane splitting ──────────────────────────────────────────
/** Lane lines sit at half positions: 0.5 is the line between lanes 0 and 1. */
const isLine = (position: number): boolean => Math.abs(position % 1) > 0.25 && Math.abs(position % 1) < 0.75;
const randomLine = (): number => Math.floor(Math.random() * (laneCount() - 1)) + 0.5;

/** Every lane and lane line a Mat Rempit can ride on. */
function rempitPaths(): number[] {
  const paths: number[] = [];
  for (let i = 0; i < laneCount(); i++) {
    paths.push(i);
    if (i < laneCount() - 1) paths.push(i + 0.5);
  }
  return paths;
}

/** Is something riding in this path, close to x? (On a line, only another bike counts — cars are either side.) */
const pathTaken = (vehicles: Vehicle[], me: Vehicle, path: number, x: number, range: number): boolean =>
  vehicles.some((o) => o !== me && Math.abs(o.x - x) < range && Math.abs(o.lanePos - path) < (isLine(path) ? 0.25 : 0.5));

/** Mat Rempit: weave between lanes and lane lines, filtering round traffic ahead. */
function updateRempit(v: Vehicle, vehicles: Vehicle[], player: Car): void {
  const fromPlayer = v.x - player.x;
  if (fromPlayer > REMPIT.keepPathFrom && fromPlayer < REMPIT.keepPathUntil) return; // committed: no surprises
  const blocked = pathTaken(vehicles, v, v.lane, v.x + REMPIT.filterLookAhead / 2, REMPIT.filterLookAhead / 2);
  v.signal--;
  if (!blocked && v.signal > 0) return;
  const options = rempitPaths().filter(
    (p) => p !== v.lane && Math.abs(p - v.lane) <= 1 && !pathTaken(vehicles, v, p, v.x, REMPIT.filterLookAhead),
  );
  const lines = options.filter(isLine);
  const pool = lines.length > 0 && Math.random() < REMPIT.splitChance ? lines : options;
  if (pool.length > 0) v.lane = pick(pool);
  v.signal = Math.round(between(REMPIT.weaveEvery));
}

/** Road height for drawing: a bike on a lane line sits right on the line. */
function rideY(position: number): number {
  const frac = Math.abs(position % 1);
  const onLine = 1 - Math.abs(frac * 2 - 1); // 0 in a lane, 1 on a line
  return laneY(position) - laneHeight() * 0.26 * onLine + 3 * onLine;
}

const laneIsClear = (vehicles: Vehicle[], me: Vehicle, lane: Lane): boolean =>
  !vehicles.some((v) => v !== me && sameLane(v.lanePos, lane) && Math.abs(v.x - me.x) < TRAFFIC_RULES.minGapOtherLane);

/** Moves traffic relative to the player and handles lane changes. */
/**
 * Where a vehicle should stop for a red / amber light ahead of it, or null.
 * Cars queue behind the stop line; motorcycles and bicycles filter forward
 * and bunch up in front of the first car. Mat Rempit don't stop at all.
 */
function stopTarget(v: Vehicle, vehicles: Vehicle[], stops: StopPoint[]): number | null {
  // Mat Rempit run red lights — but even they stop for people on a crossing
  const light = stops.filter((s) => (s.everyone || v.kind !== 'rempit') && s.x > v.x - 2).sort((a, b) => a.x - b.x)[0];
  if (!light) return null;
  const isBike = VEHICLES[v.kind].group === 'twoWheeler';
  const between = (o: Vehicle): boolean => o !== v && o.x > v.x && o.x < light.x && o.kind !== 'rempit';
  if (isBike) {
    const bikesAhead = vehicles.filter((o) => between(o) && VEHICLES[o.kind].group === 'twoWheeler').length;
    return light.x - LIGHTS.bikeStopGap - VEHICLES[v.kind].halfWidth - bikesAhead * LIGHTS.bikeBunchSpacing;
  }
  const carsAhead = vehicles.filter((o) => between(o) && VEHICLES[o.kind].group === 'car' && sameLane(o.lanePos, v.lanePos)).length;
  // Leave room at the front for the motorcycles to squeeze in
  return light.x - LIGHTS.carStopGap - 34 - VEHICLES[v.kind].halfWidth - carsAhead * LIGHTS.carQueueSpacing;
}

export function updateVehicles(vehicles: Vehicle[], playerSpeed: number, roadSpeed: number, player: Car, stops: StopPoint[] = []): Vehicle[] {
  for (const v of vehicles) {
    // Red light or busy crossing ahead: slow down to the stop position (bikes filter to the front)
    const stopAt = stopTarget(v, vehicles, stops);
    if (stopAt !== null && v.x < stopAt + 40) {
      const isBike = VEHICLES[v.kind].group === 'twoWheeler';
      const speed = Math.min(roadSpeed * v.speedShare * (isBike ? 1.25 : 1), Math.max(0, (stopAt - v.x) * 0.07));
      v.x += speed - playerSpeed;
      if (isBike) {
        // squeeze between the queued cars, onto the lane line
        const home = Math.round(v.lane);
        v.lane = Math.min(laneCount() - 1, Math.max(0, home + (Math.floor(v.x / 13) % 2 === 0 ? 0.2 : -0.2)));
      }
      v.lanePos = slideLane(v.lanePos, v.lane, ROAD.changeTicks * 2);
      continue;
    }
    if (VEHICLES[v.kind].group === 'twoWheeler' && v.lane % 1 !== 0) v.lane = Math.round(v.lane); // light's green: back into the lane

    // Don't drive through a slower vehicle ahead in the same lane: follow it instead
    let share = v.speedShare;
    for (const o of v.kind === 'rempit' ? [] : vehicles) { // Mat Rempit never slow down
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
      const target = neighbourLane(v.lane);
      if (laneIsClear(vehicles, v, target)) v.lane = target;
      v.changed = true;
      v.signal = -1;
    }

    // Mat Rempit: lane splitting and filtering
    if (v.kind === 'rempit') updateRempit(v, vehicles, player);

    v.lanePos = slideLane(v.lanePos, v.lane, v.kind === 'rempit' ? ROAD.changeTicks : ROAD.changeTicks * 2);
  }
  return vehicles.filter((v) => v.x > -340 && v.x < 820);
}

/** Index of the vehicle the player hit, or -1. Jumping high enough clears it. */
export function findVehicleHit(car: Car, vehicles: Vehicle[], inset: number): number {
  const left = car.x - car.width / 2 + inset;
  const right = car.x + car.width / 2 - inset;
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    // A Mat Rempit splitting lanes (on a lane line) can hit you in either lane beside it
    const reach = v && isLine(v.lane) ? 0.75 : 0.5;
    if (!v || Math.abs(car.lanePos - v.lanePos) >= reach) continue;
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
    const box = vehicleBox(art, v.x, v.kind === 'rempit' ? rideY(v.lanePos) : laneY(v.lanePos));
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
    if (type.group === 'car' && v.signal > 0 && Math.floor(time / 6) % 2 === 0) {
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
    const y = toPx(rideY(v.lanePos)) - 24;
    fill(ctx, '0', 2, y - 4, 20, 18);
    fill(ctx, '8', 2, y - 4, 20, 1);
    drawText(ctx, '!', 5, y, '8');
    drawText(ctx, '>', 13, y, 'a');
  }
}
