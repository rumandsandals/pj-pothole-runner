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

/**
 * HITTING A PERSON ON A ZEBRA CROSSING
 * If you drive through a crossing and someone is in your lane, you hit
 * them. Your car stops, an ambulance and the police arrive, and then:
 *   injured — a heavy penalty and a police record, then you drive on
 *   killed  — the game ends
 * Jumping clear over them avoids the hit (but it's still failing to give way).
 *
 * ⚠️ FACT-CHECK: the 5–10 years / RM20,000–50,000 for causing death by
 * dangerous driving (Road Transport Act 1987 s.41, as amended in 2020) is
 * from news reports. The RM penalty for injury is a game number.
 */
export const PEDESTRIAN_HIT = {
  fatalChance: 0.3, // chance the person dies (the rest are injured)
  clearHeight: 26, // jump higher than this to pass over them
  ambulanceSpeed: 5, // how fast the ambulance drives up
  ambulanceStopAhead: 90, // where it parks, in front of your car (world units)
  waitTicks: 70, // flashing lights for a moment before the police talk to you
  injuryPenalty: 3000, // RM lost when you injure someone
};

export const PEDESTRIAN_HIT_TEXT = {
  bannerTitle: '🚑 YOU HIT A PEDESTRIAN!',
  bannerText: 'Stop. Call 999. An ambulance and the police are on their way…',
  injuredTitle: '🚑 PEDESTRIAN INJURED',
  injuredText:
    'You hit a person on the zebra crossing. Paramedics rush them to hospital. The police take your statement, and you may be charged with careless or dangerous driving. People on a zebra crossing always have the right of way.',
  injuredChoice: '🤝 Stay, help and cooperate with the police',
  injuredMessage: '⚖️ Charged in court and fined. Your insurance premium and driving record take the hit. -RM{penalty}.',
  fatalTitle: '🕯️ FATAL ACCIDENT',
  fatalText:
    'The person you hit has died. Causing death by dangerous driving carries 5 to 10 years in prison and a fine of RM20,000 to RM50,000 — and a family has lost someone. On a zebra crossing: slow down, stop, and let people cross.',
  fatalChoice: 'Continue',
  gameOverTitle: '🕯️ GAME OVER',
  gameOverText: 'A pedestrian died. Always stop at zebra crossings.',
};
