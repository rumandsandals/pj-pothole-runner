import type { PotholeId } from './potholes';
import type { RoadEventId } from './roadEvents';

/**
 * LEVELS
 * The game plays these in order. Add, remove or reorder freely.
 * - potholes: which pothole types can appear (repeat a name to make it more common)
 * - speed: how fast the road scrolls
 * - spawnChance: how often potholes appear (bigger = more)
 * - eventAt: distance into the level when the road event pops up
 * - event: which road event (from roadEvents.ts), or null for none
 * - roughness: how bumpy the road line looks
 * Typos in pothole or event names are caught before the game runs.
 */

export interface Level {
  name: string;
  potholes: PotholeId[];
  speed: number;
  spawnChance: number;
  eventAt: number;
  event: RoadEventId | null;
  roughness: number;
}

export const LEVELS: Level[] = [
  { name: 'Smooth Start', potholes: ['shallow'], speed: 3.2, spawnChance: 0.003, eventAt: 700, event: null, roughness: 0.25 },
  { name: 'PJ Streets', potholes: ['shallow', 'medium'], speed: 3.8, spawnChance: 0.0035, eventAt: 750, event: null, roughness: 0.55 },
  { name: 'Police Zone ✅', potholes: ['shallow', 'medium', 'medium'], speed: 4.4, spawnChance: 0.0038, eventAt: 750, event: 'police_good', roughness: 0.8 },
  { name: 'Police Zone ❌', potholes: ['medium', 'medium', 'deep'], speed: 5.0, spawnChance: 0.004, eventAt: 750, event: 'police_bad', roughness: 1.05 },
  { name: 'Insurance Row', potholes: ['medium', 'deep'], speed: 5.6, spawnChance: 0.0043, eventAt: 800, event: 'ins_good', roughness: 1.3 },
  { name: 'Adjuster Alley', potholes: ['medium', 'deep', 'deep'], speed: 6.2, spawnChance: 0.0045, eventAt: 800, event: 'ins_bad', roughness: 1.55 },
  { name: 'Workshop Way', potholes: ['deep', 'deep', 'abyss'], speed: 6.9, spawnChance: 0.0048, eventAt: 800, event: 'ws_good', roughness: 1.8 },
  { name: 'Chop Shop Run', potholes: ['deep', 'abyss'], speed: 7.7, spawnChance: 0.0052, eventAt: 850, event: 'ws_bad', roughness: 2.1 },
  { name: 'Council Chase', potholes: ['medium', 'deep', 'abyss'], speed: 8.6, spawnChance: 0.0055, eventAt: 850, event: 'council', roughness: 2.4 },
];
