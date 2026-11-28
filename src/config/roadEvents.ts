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
      'Officer Rahman takes your police report on the pothole damage. A police report (within 24 hours) is the evidence your council or insurance claim needs.',
    choices: [
      { label: '📸 Accept Help', effect: { money: 200, hp: 10 }, message: '✅ +RM200 & +10HP! Report secured!', tone: 'good' },
      { label: '🚗 Drive On', effect: {}, message: 'Skipped a free police report.' },
    ],
  },
  police_bad: {
    title: '🤑 CORRUPT COP!',
    description:
      "Officer Zulkifli wants 'duit kopi' to file your report! Giving or offering a bribe is a crime under the MACC Act 2009. Report it: 1-800-88-6000.",
    choices: [
      { label: '💸 Pay Bribe', effect: { money: -150, hp: 5, heat: 30 }, message: '❌ -RM150 bribe! Report to MACC: 1-800-88-6000', tone: 'bad' },
      { label: '✊ Refuse & Call MACC', effect: { money: 100 }, message: '✅ +RM100! MACC case filed!', tone: 'good' },
    ],
  },
  ins_good: {
    title: '🧑‍💼 FAIR ADJUSTER!',
    description: 'Adjuster Sarah assesses the damage fairly. With comprehensive cover, pothole damage can usually be claimed as own damage (it may affect your NCD).',
    choices: [
      { label: '✅ Accept Quote', effect: { money: 400, hp: 20 }, message: '✅ +RM400! Full repair covered!', tone: 'good' },
      { label: '🔍 Second Opinion', effect: { money: 550 }, message: '✅ +RM550! Second opinion paid off!', tone: 'good' },
    ],
  },
  ins_bad: {
    title: '❌ DODGY ADJUSTER!',
    description:
      "Ah Kow blames 'wear and tear'. Ask for the reasons in writing and appeal. Still unfair? The Financial Markets Ombudsman Service (FMOS) handles insurance disputes for free.",
    choices: [
      { label: '😤 Accept Low Offer', effect: { money: 50, hp: -10 }, message: '❌ Only RM50... dispute next time!', tone: 'bad' },
      { label: '📜 Dispute & Escalate', effect: { money: 350 }, message: '✅ +RM350! FMOS ruled in your favour!', tone: 'good' },
    ],
  },
  ws_good: {
    title: '🔧 HONEST WORKSHOP!',
    description:
      'Tauke Ah Seng: genuine parts, itemised invoice. Always ask for a written quote and an itemised bill before work starts.',
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
      { label: '🏃 Flee NOW!', effect: { money: 100 }, message: '✅ +RM100! Police report lodged — stolen parts are theft.', tone: 'good' },
    ],
  },
  council: {
    title: '🏛️ MBPJ COUNCIL CLAIM!',
    description:
      'Evidence collected! Councils can be liable in negligence for road potholes — in 2022 a Kajang driver won RM2,980 from MPKj. Claim from MBPJ first; if refused, try the Magistrates’ Court small claims (under RM5,000).',
    choices: [
      { label: '📧 Claim from MBPJ', effect: { money: 800, hp: 15 }, message: '✅ +RM800! MBPJ claim approved! 🎉', tone: 'good' },
      { label: '⚖️ Small claims court', effect: { money: 1500 }, message: '✅ +RM1500! The court ruled in your favour — LEGEND! 🏆', tone: 'good' },
    ],
  },
} satisfies Record<string, RoadEvent>;

export type RoadEventId = keyof typeof ROAD_EVENTS;
