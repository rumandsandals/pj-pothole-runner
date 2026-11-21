import { CAR, MAX_HEALTH, TOW, WORKSHOP, WORLD } from '../config/game';
import { LEVELS, type Level } from '../config/levels';
import type { PotholeId } from '../config/potholes';
import type { TowOption } from '../config/towTrucks';
import { generateRoad, type RoadPoint } from '../world/road';

/** Which screen / phase the game is in. */
export type Mode = 'menu' | 'playing' | 'event' | 'towChoice' | 'towArriving' | 'workshop' | 'dead' | 'win';

export interface Car {
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
  width: number;
  height: number;
  invulnerable: number;
  trapped: boolean;
  sinkY: number;
  sinkTarget: number;
}

export interface Pothole {
  x: number;
  type: PotholeId;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  text: string;
  color: string;
  life: number;
  size: number;
}

export interface TowTruck {
  active: boolean;
  x: number;
  phase: 'incoming' | 'towing';
  waited: number;
  option: TowOption | null;
}

export interface WorkshopLogEntry {
  text: string;
  good: boolean;
}

export interface GameState {
  mode: Mode;
  tick: number;
  score: number;
  money: number;
  health: number;
  distance: number;
  levelDistance: number;
  level: number; // 1-based
  speed: number;
  eventFired: boolean;
  potholes: Pothole[];
  particles: Particle[];
  road: RoadPoint[];
  roadOffset: number;
  car: Car;
  tow: TowTruck;
  workshop: { bill: number; step: number; log: WorkshopLogEntry[] };
}

export function createCar(): Car {
  return {
    x: CAR.x,
    y: WORLD.groundY,
    vy: 0,
    onGround: true,
    width: CAR.width,
    height: CAR.height,
    invulnerable: 0,
    trapped: false,
    sinkY: 0,
    sinkTarget: 0,
  };
}

export function createTow(): TowTruck {
  return { active: false, x: TOW.arriveFromX, phase: 'incoming', waited: 0, option: null };
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
    tick: 0,
    score: 0,
    money: 0,
    health: MAX_HEALTH,
    distance: 0,
    levelDistance: 0,
    level: 1,
    speed: level.speed,
    eventFired: false,
    potholes: [],
    particles: [],
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

export function clampHealth(hp: number): number {
  return Math.max(0, Math.min(MAX_HEALTH, hp));
}
