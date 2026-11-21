import { LANES } from '../config/game';

/** 0 = near lane (bottom of the road), 1 = far lane (top). */
export type Lane = 0 | 1;

/**
 * Road-surface height (world units) at a lane position. Positions between
 * 0 and 1 are part-way through a lane change.
 */
export const laneY = (position: number): number => LANES.near + (LANES.far - LANES.near) * position;

/** True when two things are in the same lane (part-way counts as both). */
export const sameLane = (a: number, b: number): boolean => Math.abs(a - b) < 0.5;

/** Which lane something is drawn with (for back-to-front order). */
export const drawLane = (position: number): Lane => (position >= 0.5 ? 1 : 0);

/** Moves a lane position towards its target lane. */
export function slideLane(position: number, target: Lane, ticks: number): number {
  const step = 1 / Math.max(ticks, 1);
  if (Math.abs(target - position) <= step) return target;
  return position + Math.sign(target - position) * step;
}

export const randomLane = (): Lane => (Math.random() < 0.5 ? 0 : 1);
