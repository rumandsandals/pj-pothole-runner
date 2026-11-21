/**
 * ROAD EVENTS
 * Pop-up encounters that happen once per level (set which one in levels.ts).
 * effect.money = RM gained (negative = lost). effect.hp = health gained/lost.
 * effect.heat = police heat added (for illegal choices — see police.ts).
 * tone 'good' / 'bad' only changes the button colour.
 */

export interface EventChoice {
  label: string;
  effect: { money?: number; hp?: number; heat?: number };
  message: string;
  tone?: 'good' | 'bad';
}

export interface RoadEvent {
  title: string;
  description: string;
  choices: EventChoice[];
}

export const ROAD_EVENTS = {
  police_good: {
    title: '👮 GOOD COP APPEARS!',
    description:
      'Officer Rahman documents the pothole & files an accurate report. Section 107 Road Transport Act — your LEGAL RIGHT!',
    choices: [
      { label: '📸 Accept Help', effect: { money: 200, hp: 10 }, message: '✅ +RM200 & +10HP! Report secured!', tone: 'good' },
      { label: '🚗 Drive On', effect: {}, message: 'Skipped a free police report.' },
    ],
  },
  police_bad: {
    title: '🤑 CORRUPT COP!',
    description:
      "Officer Zulkifli wants 'kopi duit' to file your report! Bribery is illegal — MACC Act 2009. Call 1-800-88-6000!",
    choices: [
      { label: '💸 Pay Bribe', effect: { money: -150, hp: 5, heat: 30 }, message: '❌ -RM150 bribe! Report to MACC: 1-800-88-6000', tone: 'bad' },
      { label: '✊ Refuse & Call MACC', effect: { money: 100 }, message: '✅ +RM100! MACC case filed!', tone: 'good' },
    ],
  },
  ins_good: {
    title: '🧑‍💼 FAIR ADJUSTER!',
    description: 'Adjuster Sarah values at full market rate. Pothole damage covered under Section 91 Road Transport Act!',
    choices: [
      { label: '✅ Accept Quote', effect: { money: 400, hp: 20 }, message: '✅ +RM400! Full repair covered!', tone: 'good' },
      { label: '🔍 Second Opinion', effect: { money: 550 }, message: '✅ +RM550! Second opinion paid off!', tone: 'good' },
    ],
  },
  ins_bad: {
    title: '❌ DODGY ADJUSTER!',
    description:
      "Ah Kow blames 'wear and tear'. WRONG — pothole damage is a road hazard claim! Consumer Protection Act 1999.",
    choices: [
      { label: '😤 Accept Low Offer', effect: { money: 50, hp: -10 }, message: '❌ Only RM50... dispute next time!', tone: 'bad' },
      { label: '📜 Dispute & Escalate', effect: { money: 350 }, message: '✅ +RM350! Bank Negara ruled in your favour!', tone: 'good' },
    ],
  },
  ws_good: {
    title: '🔧 HONEST WORKSHOP!',
    description:
      'Tauke Ah Seng: OEM parts only, itemised invoice. Always demand a proper bill under the Consumer Protection Act.',
    choices: [
      { label: '✅ Use Workshop', effect: { hp: 30 }, message: '✅ +30HP! Proper OEM parts & invoice!', tone: 'good' },
      { label: '💭 Shop Around', effect: { money: 60, hp: 15 }, message: '✅ +RM60 saved & +15HP!', tone: 'good' },
    ],
  },
  ws_bad: {
    title: '💀 CHOP SHOP!',
    description:
      'Ah Long charges for OEM but fits reconditioned parts. Your catalytic converter is MISSING. GET OUT NOW!',
    choices: [
      { label: '😱 Stay (Mistake!)', effect: { money: -300, hp: -25 }, message: '❌ Parts stolen! -RM300 & -25HP!', tone: 'bad' },
      { label: '🏃 Flee NOW!', effect: { money: 100 }, message: '✅ +RM100! Reported to Tribunal: 1-800-886-800!', tone: 'good' },
    ],
  },
  council: {
    title: '🏛️ MBPJ COUNCIL CLAIM!',
    description:
      'Evidence collected! Under Tort Law (Negligence) MBPJ is LIABLE. File at www.mbpj.gov.my or Tribunal Pengguna!',
    choices: [
      { label: '📧 File Online', effect: { money: 800, hp: 15 }, message: '✅ +RM800! MBPJ claim approved! 🎉', tone: 'good' },
      { label: '⚖️ Magistrates Court', effect: { money: 1500 }, message: '✅ +RM1500! Court judgement — LEGEND! 🏆', tone: 'good' },
    ],
  },
} satisfies Record<string, RoadEvent>;

export type RoadEventId = keyof typeof ROAD_EVENTS;
