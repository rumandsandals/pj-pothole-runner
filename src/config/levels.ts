import type { PotholeId } from './potholes';
import type { RoadEventId } from './roadEvents';

/**
 * LEVELS
 * The game plays these in order. Add, remove or reorder freely.
 * - seconds: how long the level lasts
 * - intro: one or two lines shown on the level pop-up before it starts
 * - potholes: which pothole types can appear (repeat a name to make it more common)
 * - speed: how fast the road scrolls
 * - spawnChance: how often potholes appear (bigger = more)
 * - event: which road event (from roadEvents.ts), or null for none
 * - eventAt: when the event pops up, as a share of the level (0.5 = halfway, 0.8 = 80% through)
 * - roughness: how bumpy the road looks
 * Typos in pothole or event names are caught before the game runs.
 */

export interface Level {
  name: string;
  seconds: number;
  intro: string;
  potholes: PotholeId[];
  speed: number;
  spawnChance: number;
  event: RoadEventId | null;
  eventAt: number;
  roughness: number;
}

export const LEVELS: Level[] = [
  {
    name: 'Smooth Start', seconds: 30,
    intro: 'Fresh tar and shallow dips. Get a feel for your jump timing.',
    potholes: ['shallow'], speed: 3.2, spawnChance: 0.003, event: null, eventAt: 0.8, roughness: 0.25,
  },
  {
    name: 'PJ Streets', seconds: 34,
    intro: 'Medium potholes join the party. More dots above a hole = more damage.',
    potholes: ['shallow', 'medium'], speed: 3.8, spawnChance: 0.0035, event: null, eventAt: 0.8, roughness: 0.55,
  },
  {
    name: 'Police Zone ✅', seconds: 38,
    intro: "A good cop is patrolling. If help is offered, it's your right to take it.",
    potholes: ['shallow', 'medium', 'medium'], speed: 4.4, spawnChance: 0.0038, event: 'police_good', eventAt: 0.8, roughness: 0.8,
  },
  {
    name: 'Police Zone ❌', seconds: 41,
    intro: "DEEP potholes appear. And someone may ask for 'kopi duit'...",
    potholes: ['medium', 'medium', 'deep'], speed: 5.0, spawnChance: 0.004, event: 'police_bad', eventAt: 0.8, roughness: 1.05,
  },
  {
    name: 'Insurance Row', seconds: 45,
    intro: 'Faster roads. An honest adjuster is somewhere nearby.',
    potholes: ['medium', 'deep'], speed: 5.6, spawnChance: 0.0043, event: 'ins_good', eventAt: 0.8, roughness: 1.3,
  },
  {
    name: 'Adjuster Alley', seconds: 49,
    intro: "Deep pits everywhere. Don't accept the first lowball offer.",
    potholes: ['medium', 'deep', 'deep'], speed: 6.2, spawnChance: 0.0045, event: 'ins_bad', eventAt: 0.8, roughness: 1.55,
  },
  {
    name: 'Workshop Way', seconds: 52,
    intro: 'ABYSS potholes begin! Get stuck and you must choose a tow truck. Choose wisely.',
    potholes: ['deep', 'deep', 'abyss'], speed: 6.9, spawnChance: 0.0048, event: 'ws_good', eventAt: 0.8, roughness: 1.8,
  },
  {
    name: 'Chop Shop Run', seconds: 56,
    intro: 'Fast and brutal. Dodgy workshops are waiting for your catalytic converter.',
    potholes: ['deep', 'abyss'], speed: 7.7, spawnChance: 0.0052, event: 'ws_bad', eventAt: 0.8, roughness: 2.1,
  },
  {
    name: 'Council Chase', seconds: 60,
    intro: 'Final stretch! Survive, collect your evidence and claim from MBPJ.',
    potholes: ['medium', 'deep', 'abyss'], speed: 8.6, spawnChance: 0.0055, event: 'council', eventAt: 0.8, roughness: 2.4,
  },
];
