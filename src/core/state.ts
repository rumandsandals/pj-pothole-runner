import { CAR, LANES, MAX_HEALTH, TICKS_PER_SECOND, TOW, WORKSHOP } from '../config/game';
import { LEVELS, type Level } from '../config/levels';
import type { PotholeId } from '../config/potholes';
import type { ColourKey } from '../config/theme';
import type { TowOption } from '../config/towTrucks';
import type { VehicleKind } from '../config/traffic';
import type { Lane } from '../world/lanes';
import type { Swaps } from '../world/pixels';
import { generateRoad, type RoadPoint } from '../world/road';

/** Which screen / phase the game is in. */
export type Mode =
  | 'menu'
  | 'levelCard' // paused on the "LEVEL X" pop-up, waiting for GO
  | 'playing'
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
  lanePos: number; // 0 = near lane, 1 = far lane, in between while changing
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
  speedShare: number; // share of the player's speed
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
  workshop: { bill: number; step: number; log: WorkshopLogEntry[] };
}

export function createCar(): Car {
  return {
    x: CAR.x,
    y: LANES.near,
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
    workshop: { bill: WORKSHOP.startingBill, step: 0, log: [] },
  };
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
