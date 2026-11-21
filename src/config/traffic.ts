import type { VehicleArtName } from './sprites';
import type { ColourKey } from './theme';

/**
 * TRAFFIC
 * Other road users. How much traffic each level has is set in levels.ts
 * (the `traffic` part of each level). This file sets what the vehicles are,
 * how they behave and what happens when you hit one.
 *
 * Speeds are a share of the level's normal speed: 0.6 = 60%, so you catch
 * up with them. Above 1 = faster than you (they come from behind).
 */

export type VehicleKind = 'sedan' | 'suv' | 'sports' | 'motorcycle' | 'bicycle' | 'rempit';

export interface VehicleType {
  art: VehicleArtName; // which picture (VEHICLE_ART in sprites.ts)
  group: 'car' | 'twoWheeler' | 'rempit';
  mix: number; // how common it is within its group (bigger = more common)
  speed: [number, number]; // slowest and fastest
  halfWidth: number; // for collisions (world units)
  height: number; // jump higher than this to clear it (world units)
  accident: 'minor' | 'fender' | 'cyclist'; // which accident scenes (accidents.ts)
}

export const VEHICLES: Record<VehicleKind, VehicleType> = {
  sedan: { art: 'sedan', group: 'car', mix: 5, speed: [0.48, 0.66], halfWidth: 29, height: 22, accident: 'fender' },
  suv: { art: 'suv', group: 'car', mix: 3, speed: [0.42, 0.56], halfWidth: 29, height: 28, accident: 'fender' },
  sports: { art: 'sports', group: 'car', mix: 2, speed: [0.74, 0.9], halfWidth: 29, height: 18, accident: 'fender' },
  motorcycle: { art: 'motorcycle', group: 'twoWheeler', mix: 7, speed: [0.55, 0.8], halfWidth: 15, height: 28, accident: 'minor' },
  bicycle: { art: 'bicycle', group: 'twoWheeler', mix: 3, speed: [0.2, 0.3], halfWidth: 14, height: 28, accident: 'cyclist' },
  rempit: { art: 'motorcycle', group: 'rempit', mix: 1, speed: [1.35, 1.6], halfWidth: 15, height: 28, accident: 'minor' },
};

type Paint = { X: ColourKey; Y: ColourKey; Z?: ColourKey };

/** Paint jobs for cars: X = body, Y = shadow (palette keys from theme.ts). */
export const CAR_PAINT: Paint[] = [
  { X: 'c', Y: '1' }, // blue
  { X: '7', Y: '6' }, // white
  { X: 'a', Y: '9' }, // yellow
  { X: 'b', Y: '3' }, // green
  { X: '6', Y: 'h' }, // silver
  { X: '2', Y: '0' }, // maroon
  { X: 'g', Y: '0' }, // charcoal
  { X: 'e', Y: '2' }, // pink
];

/** Motorcyclists: X = jacket (always brown), Y = helmet, Z = bike paint. */
export const RIDER_PAINT: Paint[] = [
  { X: '4', Y: '7', Z: '1' },
  { X: '4', Y: 'a', Z: '8' },
  { X: '4', Y: '8', Z: '0' },
  { X: '4', Y: 'c', Z: '6' },
];

/** Cyclists: X = shirt, Y = helmet, Z = bicycle frame. */
export const CYCLIST_PAINT: Paint[] = [
  { X: 'b', Y: '7', Z: '3' },
  { X: '9', Y: '8', Z: '8' },
  { X: 'c', Y: 'a', Z: '1' },
  { X: 'e', Y: '7', Z: '2' },
];

/** Mat Rempit: red shirt, black helmet, black bike. */
export const REMPIT_PAINT: Paint = { X: '8', Y: '0', Z: '0' };

export const TRAFFIC_RULES = {
  spawnAheadX: 720, // other traffic appears just off the right edge
  rempitStartX: -260, // Mat Rempit start this far behind you (off-screen left)
  minGapSameLane: 170, // space kept between vehicles in one lane
  minGapOtherLane: 120, // never block both lanes at once
  followGap: 76, // a faster vehicle slows down when this close behind a slower one
  bicycleWobble: true, // cyclists wobble a little
  laneChangeSignalTicks: 45, // how long a car blinks before it changes lane
  laneChangeWithin: 300, // cars only change lane when this close ahead of you
  invulnerableAfterAccident: 100,
  clearAroundAfterAccident: 260, // vehicles this close are removed after an accident
};

/** How bad an accident is, and how much it hurts. */
export const ACCIDENT_SEVERITY = {
  minorDamage: 10, // clipping a motorcycle or bicycle
  fenderDamage: 20, // bumping a car
  seriousDamage: 35, // a serious crash
  seriousFromLevel: 6, // from this level, car bumps can be serious…
  seriousChance: 0.4, // …this often
  seriousIfHealthBelow: 35, // and always serious if your HP would drop below this
  wreckTicks: 50, // pause on the wreck before the tow trucks come
};
