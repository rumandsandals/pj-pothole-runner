import { ROAD } from '../config/game';
import { toPx } from './pixels';

/** Lane number: 0 = nearest (bottom) lane, then 1, 2… going up the road. */
export type Lane = number;

// How many lanes the current level has (set every tick from the level settings).
let count = 2;

export function setLaneCount(lanes: number): void {
  count = Math.max(1, Math.round(lanes));
}
export const laneCount = (): number => count;

/** Height of one lane (world units). */
export const laneHeight = (): number => (count >= 3 ? ROAD.laneWidthThreeLanes : ROAD.laneWidth);

/** Top edge of the road surface (world units): higher up for more lanes. */
export const roadTop = (): number => ROAD.bottom - laneHeight() * count;

/** Top of the kerb — everything above this is sky, buildings and roadside (art pixels). */
export const groundPx = (): number => toPx(roadTop() - ROAD.kerb);

/**
 * Where wheels touch the road (world units) at a lane position. Positions
 * between whole numbers are part-way through a lane change.
 */
export const laneY = (position: number): number => ROAD.bottom - laneHeight() * (position + ROAD.wheelLine);

/** Heights of the lane lines: exactly between lanes (½, or ⅓ and ⅔ of the road). */
export const laneLineYs = (): number[] => Array.from({ length: count - 1 }, (_, i) => roadTop() + laneHeight() * (i + 1));

/** Keeps a lane number on the road. */
export const clampLane = (lane: number): Lane => Math.max(0, Math.min(count - 1, Math.round(lane)));

/** True when two things are in the same lane (part-way counts as both). */
export const sameLane = (a: number, b: number): boolean => Math.abs(a - b) < 0.5;

/** Which lane something is drawn with (for back-to-front order). */
export const drawLane = (position: number): Lane => clampLane(position);

/** Moves a lane position towards its target lane. */
export function slideLane(position: number, target: Lane, ticks: number): number {
  const step = 1 / Math.max(ticks, 1);
  if (Math.abs(target - position) <= step) return target;
  return position + Math.sign(target - position) * step;
}

export const randomLane = (): Lane => Math.floor(Math.random() * count);

/** A lane next to this one (picked at random when there's a choice). */
export function neighbourLane(lane: Lane): Lane {
  if (lane <= 0) return Math.min(1, count - 1);
  if (lane >= count - 1) return lane - 1;
  return Math.random() < 0.5 ? lane - 1 : lane + 1;
}
