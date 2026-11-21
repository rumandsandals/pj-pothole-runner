import type { ColourKey } from './theme';

/**
 * TRAFFIC
 * Other road users. How much traffic each level has is set in levels.ts
 * (the `traffic` part of each level). This file sets how vehicles behave
 * and what happens when you hit one.
 *
 * Speeds are a share of YOUR speed: 0.6 = they drive at 60% of your speed,
 * so you catch up with them. Above 1 = faster than you (they come from behind).
 */

export type VehicleKind = 'car' | 'motorcycle' | 'rempit';

export interface VehicleType {
  speed: [number, number]; // slowest and fastest, as a share of your speed
  halfWidth: number; // for collisions (world units)
  height: number; // jump higher than this to clear it (world units)
  accident: 'minor' | 'fender';
}

export const VEHICLES: Record<VehicleKind, VehicleType> = {
  car: { speed: [0.45, 0.68], halfWidth: 22, height: 24, accident: 'fender' },
  motorcycle: { speed: [0.55, 0.8], halfWidth: 13, height: 20, accident: 'minor' },
  rempit: { speed: [1.35, 1.6], halfWidth: 13, height: 20, accident: 'minor' },
};

/** Paint jobs for other cars: X = body, Y = trim (palette keys from theme.ts). */
export const CAR_PAINT: Array<{ X: ColourKey; Y: ColourKey }> = [
  { X: 'c', Y: '1' }, // blue
  { X: '7', Y: '6' }, // white
  { X: 'a', Y: '9' }, // yellow taxi
  { X: 'b', Y: '3' }, // green
  { X: '6', Y: '5' }, // silver
  { X: 'e', Y: '2' }, // pink
];

/** Rider colours: X = shirt, Y = helmet. */
export const RIDER_PAINT: Array<{ X: ColourKey; Y: ColourKey }> = [
  { X: 'c', Y: '7' },
  { X: '9', Y: 'a' },
  { X: 'b', Y: '7' },
  { X: 'd', Y: '8' },
];
export const REMPIT_PAINT = { X: '8', Y: '0' } as const;

export const TRAFFIC_RULES = {
  spawnAheadX: 720, // other traffic appears just off the right edge
  rempitStartX: -260, // Mat Rempit start this far behind you (off-screen left)
  minGapSameLane: 170, // space kept between vehicles in one lane
  minGapOtherLane: 120, // never block both lanes at once
  laneChangeSignalTicks: 45, // how long a car blinks before it changes lane
  laneChangeWithin: 300, // cars only change lane when this close ahead of you
  invulnerableAfterAccident: 100,
  clearAroundAfterAccident: 260, // vehicles this close are removed after an accident
};

/** How bad an accident is, and how much it hurts. */
export const ACCIDENT_SEVERITY = {
  minorDamage: 10, // clipping a motorcycle
  fenderDamage: 20, // bumping a car
  seriousDamage: 35, // a serious crash
  seriousFromLevel: 6, // from this level, car bumps can be serious…
  seriousChance: 0.4, // …this often
  seriousIfHealthBelow: 35, // and always serious if your HP would drop below this
  wreckTicks: 50, // pause on the wreck before the tow trucks come
};
