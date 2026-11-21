import type { TrackId } from './music';
import type { PotholeId } from './potholes';
import type { SceneryId } from './scenery';
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
 * - lanes: 1, 2 or 3
 * - highway: true = highway look (concrete barrier, white lane lines)
 * - scenery: what you drive past (scenery.ts)
 * - trafficLights: where traffic lights stand, as shares of the level (e.g. [0.3, 0.6])
 * - crossings: where zebra crossings are painted (single- and two-lane roads only)
 * - music: which tune plays (music.ts: town, city or highway)
 * - traffic: other vehicles, or null for an empty road
 *     spawnChance     how often a vehicle appears (bigger = busier)
 *     maxOnScreen     most vehicles at once
 *     motorcycleShare 0–1: how many of them are motorcycles (the rest are cars)
 *     rempitChance    0–1: chance a new vehicle is a Mat Rempit racing up from behind
 *     laneChangeChance 0–1: chance a car changes lane in front of you
 * Typos in pothole or event names are caught before the game runs.
 */

export interface LevelTraffic {
  spawnChance: number;
  maxOnScreen: number;
  motorcycleShare: number;
  rempitChance: number;
  laneChangeChance: number;
}

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
  lanes: number;
  highway: boolean;
  scenery: SceneryId;
  trafficLights: number[];
  crossings: number[];
  music: TrackId;
  traffic: LevelTraffic | null;
}

export const LEVELS: Level[] = [
  {
    name: 'Smooth Start', seconds: 30,
    intro: 'A single-lane road and nothing but potholes. SPACE (or tap) to jump them!',
    potholes: ['shallow'], speed: 3.2, spawnChance: 0.003, event: null, eventAt: 0.8, roughness: 0.25,
    lanes: 1, highway: false,
    trafficLights: [0.55], crossings: [0.22, 0.78],
    scenery: 'suburb', music: 'town',
    traffic: null,
  },
  {
    name: 'PJ Streets', seconds: 34,
    intro: 'The road opens to TWO lanes, and traffic arrives! ↑ ↓ switch lanes to pass slower cars and bikes.',
    potholes: ['shallow', 'medium'], speed: 3.8, spawnChance: 0.0035, event: null, eventAt: 0.8, roughness: 0.55,
    lanes: 2, highway: false,
    trafficLights: [0.35, 0.65], crossings: [0.15, 0.5],
    scenery: 'suburb', music: 'town',
    traffic: { spawnChance: 0.007, maxOnScreen: 2, motorcycleShare: 0.5, rempitChance: 0, laneChangeChance: 0 },
  },
  {
    name: 'Police Zone ✅', seconds: 38,
    intro: "A good cop is patrolling. If help is offered, it's your right to take it.",
    potholes: ['shallow', 'medium', 'medium'], speed: 4.4, spawnChance: 0.0038, event: 'police_good', eventAt: 0.8, roughness: 0.8,
    lanes: 2, highway: false,
    trafficLights: [0.3, 0.6], crossings: [0.45],
    scenery: 'suburb', music: 'town',
    traffic: { spawnChance: 0.0075, maxOnScreen: 2, motorcycleShare: 0.45, rempitChance: 0, laneChangeChance: 0 },
  },
  {
    name: 'Police Zone ❌', seconds: 41,
    intro: "DEEP potholes, and Mat Rempit race up from behind, splitting lanes — watch the ! warning, and jump if they're on your line.",
    potholes: ['medium', 'medium', 'deep'], speed: 5.0, spawnChance: 0.004, event: 'police_bad', eventAt: 0.8, roughness: 1.05,
    lanes: 2, highway: false,
    trafficLights: [0.3, 0.62], crossings: [0.15],
    scenery: 'city', music: 'city',
    traffic: { spawnChance: 0.006, maxOnScreen: 2, motorcycleShare: 0.45, rempitChance: 0.15, laneChangeChance: 0 },
  },
  {
    name: 'Insurance Row', seconds: 45,
    intro: 'The road widens to THREE lanes! Busier traffic — an honest adjuster is somewhere nearby.',
    potholes: ['medium', 'deep'], speed: 5.6, spawnChance: 0.0043, event: 'ins_good', eventAt: 0.8, roughness: 1.3,
    lanes: 3, highway: false,
    trafficLights: [0.28, 0.6], crossings: [],
    scenery: 'city', music: 'city',
    traffic: { spawnChance: 0.007, maxOnScreen: 3, motorcycleShare: 0.4, rempitChance: 0.18, laneChangeChance: 0 },
  },
  {
    name: 'Adjuster Alley', seconds: 49,
    intro: 'Cars now change lanes — watch for blinking indicators. Crashes can get serious.',
    potholes: ['medium', 'deep', 'deep'], speed: 6.2, spawnChance: 0.0045, event: 'ins_bad', eventAt: 0.8, roughness: 1.55,
    lanes: 3, highway: false,
    trafficLights: [0.3, 0.62], crossings: [],
    scenery: 'city', music: 'city',
    traffic: { spawnChance: 0.008, maxOnScreen: 3, motorcycleShare: 0.4, rempitChance: 0.2, laneChangeChance: 0.25 },
  },
  {
    name: 'Workshop Way', seconds: 52,
    intro: 'Onto the HIGHWAY! Three fast lanes, and ABYSS potholes begin — get stuck and you must choose a tow truck.',
    potholes: ['deep', 'deep', 'abyss'], speed: 6.9, spawnChance: 0.0048, event: 'ws_good', eventAt: 0.8, roughness: 1.8,
    lanes: 3, highway: true,
    trafficLights: [], crossings: [],
    scenery: 'highwayOutskirts', music: 'highway',
    traffic: { spawnChance: 0.009, maxOnScreen: 3, motorcycleShare: 0.4, rempitChance: 0.22, laneChangeChance: 0.3 },
  },
  {
    name: 'Chop Shop Run', seconds: 56,
    intro: 'Fast, brutal and packed. Dodgy workshops are waiting for your catalytic converter.',
    potholes: ['deep', 'abyss'], speed: 7.7, spawnChance: 0.0052, event: 'ws_bad', eventAt: 0.8, roughness: 2.1,
    lanes: 3, highway: true,
    trafficLights: [], crossings: [],
    scenery: 'highwayOutskirts', music: 'highway',
    traffic: { spawnChance: 0.01, maxOnScreen: 4, motorcycleShare: 0.4, rempitChance: 0.25, laneChangeChance: 0.35 },
  },
  {
    name: 'Council Chase', seconds: 60,
    intro: 'Final stretch in rush-hour traffic! Survive, collect your evidence and claim from MBPJ.',
    potholes: ['medium', 'deep', 'abyss'], speed: 8.6, spawnChance: 0.0055, event: 'council', eventAt: 0.8, roughness: 2.4,
    lanes: 3, highway: true,
    trafficLights: [], crossings: [],
    scenery: 'highwayCity', music: 'highway',
    traffic: { spawnChance: 0.012, maxOnScreen: 4, motorcycleShare: 0.4, rempitChance: 0.3, laneChangeChance: 0.4 },
  },
];
