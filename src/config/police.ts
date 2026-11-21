import type { ColourKey } from './theme';

/**
 * POLICE & "HEAT"
 * Breaking the law raises your heat (0–100, shown as 5 lights top-left).
 * The higher it is, the more likely a police car pulls you over.
 * Heat cools down slowly while you drive at normal speed.
 *
 * ⚠️ FACT-CHECK BEFORE SHARING: fine amounts and legal points here were
 * drafted for the game. See "Facts to verify" in README.md.
 */

export type Offence = 'speeding' | 'jump' | 'accident' | 'laneChange' | 'record';

export const HEAT = {
  max: 100,
  speedingPerSecond: 7, // while holding GAS above normal speed
  jumpOverVehicle: 25, // "stunt driving": jumping over another vehicle
  accident: { minor: 10, fender: 15, serious: 25 }, // causing a crash
  dangerousLaneChange: 6, // cutting in right next to another vehicle
  nearMissDistance: 70, // "right next to" = this close, ahead or behind (world units)
  coolPerSecond: 2, // while driving at normal speed or slower
};

export const POLICE = {
  fromLevel: 2, // no police on the quiet first level
  stopsFromHeat: 20, // below this heat you're never stopped
  stopChancePerSecondAtMax: 0.35, // at full heat; lower heat = much lower chance
  cooldownSeconds: 12, // no second stop straight after one
  arriveSpeed: 4, // how fast the police car drives up behind you
  stopBehind: 82, // where it parks, behind your car (world units)
  waitTicks: 45, // pause with lights flashing before the officer comes over
  paint: { X: '1', Y: '0' } as { X: ColourKey; Y: ColourKey }, // PDRM navy
  honestChance: 0.75, // chance the officer is honest (a bribe gets you arrested)
};

/** What each offence costs, and how the stop is described. */
export const POLICE_STOPS: Record<Offence, { title: string; description: string; fine: number }> = {
  speeding: {
    title: '🚓 SPEED TRAP!',
    description: "You're pulled over for speeding. The officer starts writing a saman (summons).",
    fine: 300,
  },
  jump: {
    title: '🚓 STUNT DRIVING!',
    description:
      'You jumped clean over another vehicle. Latest tech or not, that is dangerous driving — jumping is for potholes only!',
    fine: 500,
  },
  accident: {
    title: '🚓 RECKLESS DRIVING!',
    description: 'Witnesses reported you for causing a crash. The officer wants your licence and IC.',
    fine: 400,
  },
  laneChange: {
    title: '🚓 DANGEROUS LANE CHANGE!',
    description: 'You cut in right beside another vehicle without room. The officer saw everything.',
    fine: 150,
  },
  record: {
    title: "🚓 YOU'RE ON RECORD!",
    description: 'A report was lodged about how you behaved at an earlier incident. The officer has questions.',
    fine: 500,
  },
};

/** The two choices at every police stop. {fine} is replaced with the amount. */
export const POLICE_CHOICES = {
  pay: {
    label: '📝 Accept the saman (RM {fine})',
    message: '✅ Paid properly — your record is clean again.',
  },
  bribe: {
    label: "☕ Offer 'duit kopi' (RM 50)",
    bribe: 50,
    honestMessage: '❌ Offering a bribe is a crime (MACC Act)! Arrested — RM {penalty} and your record gets worse.',
    honestPenaltyTimes: 4, // honest officer: the fine × this
    corruptMessage: "😬 'OK boss, jalan.' It worked… this time. The cop knows your plate now.",
  },
};
