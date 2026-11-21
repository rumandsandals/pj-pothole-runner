import { CAR, MAX_HEALTH, TICKS_PER_SECOND, TOW, WORKSHOP } from '../config/game';
import { LEVELS, type Level } from '../config/levels';
import type { PotholeId } from '../config/potholes';
import type { ColourKey } from '../config/theme';
import type { TowOption } from '../config/towTrucks';
import type { VehicleKind } from '../config/traffic';
import type { Offence } from '../config/police';
import { FIRST_LEVEL, TIMES, WEATHER, WEATHER_EFFECTS, type Conditions } from '../config/weather';
import { laneY, type Lane } from '../world/lanes';
import type { Swaps } from '../world/pixels';
import { generateRoad, type RoadPoint } from '../world/road';

/** Which screen / phase the game is in. */
export type Mode =
  | 'menu'
  | 'levelCard' // paused on the "LEVEL X" pop-up, waiting for GO
  | 'playing'
  | 'pullover' // a police car is pulling you over
  | 'event'
  | 'towChoice'
  | 'towArriving'
  | 'workshop'
  | 'dead'
  | 'win';

export interface Car {
  x: number;
  y: number; // where the wheels touch down (worked out from lane and hop)
  lane: Lane; // the lane the car is in or heading to
  lanePos: number; // 0 = nearest lane, 1, 2… going up; in between while changing
  hop: number; // height above the road while jumping
  crashTimer: number; // ticks left on the wreck after a serious crash
  vy: number;
  onGround: boolean;
  width: number;
  height: number;
  invulnerable: number;
  trapped: boolean;
  sinkY: number;
  sinkTarget: number;
  squash: number; // ticks left of the landing squash
}

/** A flying pixel: dust, exhaust or an asphalt chip. Positions in world units. */
export interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  life: number;
  colour: ColourKey;
  size: number; // art pixels
}

export interface Pothole {
  x: number;
  type: PotholeId;
  lane: Lane;
}

export interface Vehicle {
  kind: VehicleKind;
  x: number;
  lane: Lane;
  lanePos: number;
  speedShare: number; // share of the level's normal speed
  paint: Swaps;
  willChangeLane: boolean;
  signal: number; // ticks of blinking left before changing lane (-1 = not signalling)
  changed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  text: string;
  colour: ColourKey;
  life: number;
  scale: number;
}

export interface TowTruck {
  active: boolean;
  x: number;
  phase: 'incoming' | 'towing';
  waited: number;
  option: TowOption | null;
  reason: 'abyss' | 'crash'; // stuck in a pothole, or a serious crash
}

export interface WorkshopLogEntry {
  text: string;
  good: boolean;
}

export interface GameState {
  mode: Mode;
  time: number; // ticks since the page opened (drives animations, even when paused)
  tick: number; // ticks spent driving this game
  score: number;
  money: number;
  health: number;
  distance: number;
  levelDistance: number;
  level: number; // 1-based
  levelStartMoney: number; // to show what was earned on the level pop-up
  speed: number;
  pace: number; // 1 = normal speed; lower while braking, higher on gas
  throttle: -1 | 0 | 1; // -1 brake held, 1 gas held, 0 neither
  eventFired: boolean;
  potholes: Pothole[];
  vehicles: Vehicle[];
  particles: Particle[];
  bits: Bit[];
  shake: { ticks: number; strength: number };
  road: RoadPoint[];
  roadOffset: number;
  car: Car;
  tow: TowTruck;
  heat: number; // police attention, 0–100 (see police.ts)
  lastOffence: Offence | null; // what you'll be stopped for
  police: { x: number; waited: number } | null; // the police car pulling you over
  policeCooldown: number; // ticks before another stop can happen
  jumpedOver: boolean; // already counted a vehicle jumped over during this jump
  conditions: Conditions[]; // weather and time of day for each level (shuffled every game)
  lightning: number; // ticks of lightning flash left
  workshop: { bill: number; step: number; log: WorkshopLogEntry[] };
}

export function createCar(): Car {
  return {
    x: CAR.x,
    y: laneY(0),
    lane: 0,
    lanePos: 0,
    hop: 0,
    crashTimer: 0,
    vy: 0,
    onGround: true,
    width: CAR.width,
    height: CAR.height,
    invulnerable: 0,
    trapped: false,
    sinkY: 0,
    sinkTarget: 0,
    squash: 0,
  };
}

export function createTow(): TowTruck {
  return { active: false, x: TOW.arriveFromX, phase: 'incoming', waited: 0, option: null, reason: 'abyss' };
}

export function firstLevel(): Level {
  const level = LEVELS[0];
  if (!level) throw new Error('levels.ts needs at least one level.');
  return level;
}

export function createState(mode: Mode = 'menu'): GameState {
  const level = firstLevel();
  return {
    mode,
    time: 0,
    tick: 0,
    score: 0,
    money: 0,
    health: MAX_HEALTH,
    distance: 0,
    levelDistance: 0,
    level: 1,
    levelStartMoney: 0,
    speed: level.speed,
    pace: 1,
    throttle: 0,
    eventFired: false,
    potholes: [],
    vehicles: [],
    particles: [],
    bits: [],
    shake: { ticks: 0, strength: 0 },
    road: generateRoad(level.roughness),
    roadOffset: 0,
    car: createCar(),
    tow: createTow(),
    heat: 0,
    lastOffence: null,
    police: null,
    policeCooldown: 0,
    jumpedOver: false,
    conditions: shuffleConditions(),
    lightning: 0,
    workshop: { bill: WORKSHOP.startingBill, step: 0, log: [] },
  };
}

/** Picks one key from a table of { chance } entries (bigger chance = more likely). */
function weighted<K extends string>(table: Record<K, { chance: number }>): K {
  const keys = Object.keys(table) as K[];
  let roll = Math.random() * keys.reduce((sum, k) => sum + table[k].chance, 0);
  for (const k of keys) {
    roll -= table[k].chance;
    if (roll < 0) return k;
  }
  return keys[0] as K;
}

/** Fresh weather and time of day for every level; level 1 is always a clear day. */
export function shuffleConditions(): Conditions[] {
  return LEVELS.map((_, i) => (i === 0 ? { ...FIRST_LEVEL } : { weather: weighted(WEATHER), time: weighted(TIMES) }));
}

export function currentConditions(state: GameState): Conditions {
  return state.conditions[state.level - 1] ?? FIRST_LEVEL;
}

/** Rain and storms make the road slippery: lane changes, braking and gas respond slower. */
export function grip(state: GameState): number {
  const w = currentConditions(state).weather;
  return w === 'rain' || w === 'storm' ? WEATHER_EFFECTS.rainGrip : 1;
}

export function currentLevel(state: GameState): Level {
  return LEVELS[Math.min(state.level - 1, LEVELS.length - 1)] ?? firstLevel();
}

/** How far you drive to finish a level: its speed × its length in seconds. */
export function levelLength(level: Level): number {
  return level.speed * TICKS_PER_SECOND * level.seconds;
}

/** Seconds left in the current level. */
export function secondsLeft(state: GameState): number {
  const level = currentLevel(state);
  return Math.max(0, Math.ceil((levelLength(level) - state.levelDistance) / (level.speed * TICKS_PER_SECOND)));
}

export function clampHealth(hp: number): number {
  return Math.max(0, Math.min(MAX_HEALTH, hp));
}
