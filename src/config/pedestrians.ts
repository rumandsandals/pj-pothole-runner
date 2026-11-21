import type { ColourKey } from './theme';

/**
 * PEDESTRIANS
 * People crossing at zebra crossings (you must stop and give way), and
 * people strolling along the pavement, some walking their dogs.
 *
 * ⚠️ FACT-CHECK: the give-way fine in police.ts is a game number.
 */

export const PEDESTRIANS = {
  // At zebra crossings
  crossingChance: 0.8, // how often someone is waiting to cross
  peoplePerCrossing: [1, 3] as [number, number],
  dogChance: 0.3, // chance a person crossing has a dog with them
  startWithin: 360, // they step out when you're this close (world units)
  crossTicks: 200, // how long one person takes to cross the whole road (~3.3 s)
  stagger: 30, // ticks between people stepping out
  giveWayHeat: 25, // police heat for driving through while people are crossing

  // On the pavement
  strollerChance: 0.006, // per tick, on town and city levels
  maxStrollers: 4,
  strollSpeed: [0.25, 0.5] as [number, number], // walking pace (world units per tick)
  strollerDogChance: 0.45,
};

/** What people wear. Each person picks one of each. */
export const LOOKS = {
  skin: ['f', '9', '4'] as ColourKey[],
  hair: ['0', '0', '4', '5'] as ColourKey[],
  tudung: ['e', 'c', '2', '7', 'p', '1'] as ColourKey[], // headscarf colours (some people wear one)
  tudungChance: 0.35,
  top: ['8', 'c', 'b', 'a', '7', 'e', '9', '1', 'd'] as ColourKey[],
  bottom: ['1', '0', '5', 'l', 'g'] as ColourKey[],
};

/** Dog coats. */
export const DOGS: Array<{ coat: ColourKey; patch: ColourKey }> = [
  { coat: '4', patch: '0' }, // brown with dark ears
  { coat: '7', patch: '6' }, // white
  { coat: '0', patch: '4' }, // black and tan
  { coat: 'f', patch: '9' }, // golden
];
