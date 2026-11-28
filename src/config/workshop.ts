/**
 * WORKSHOP HELL
 * The rounds you face after choosing the cheap tow. Add or remove rounds freely.
 * billChange: RM added to (positive) or removed from (negative) the bill.
 * Use \n in a label for a line break.
 */

export interface WorkshopChoice {
  label: string;
  billChange: number;
  note: string;
  good: boolean;
}

export interface WorkshopStep {
  icon: string;
  title: string;
  question: string;
  choices: WorkshopChoice[];
}

export const WORKSHOP_STEPS: WorkshopStep[] = [
  {
    icon: '⚙️',
    title: 'Spare Parts Selection',
    question: 'The mechanic slaps two boxes of parts on your bonnet. Which do you approve?',
    choices: [
      { label: '🟢 OEM Certified Parts\n(Proton/Perodua authorised, sticker intact)', billChange: -200, note: '✅ OEM parts approved! Warranty intact. Saved RM200 off bill.', good: true },
      { label: "🔴 'Ori China' Parts\n('Same same lah, cheaper for you bro')", billChange: 400, note: '❌ Fake parts fitted. Will break again in 2 weeks. +RM400 added.', good: false },
    ],
  },
  {
    icon: '📋',
    title: 'Insurance Adjuster Arrives',
    question: 'The adjuster walks in, barely glances at your car and opens his laptop. He starts typing...',
    choices: [
      { label: '📊 Ask for the Adjuster’s Report\n(Request it from your insurer, in writing)', billChange: -300, note: '✅ Written assessment secured. Insurance pays RM300 more!', good: true },
      { label: "🤝 Accept Verbal Quote\n('Trust me, I submit for you one lah')", billChange: 600, note: '❌ Verbal only = unenforceable. +RM600 lost in the gap.', good: false },
    ],
  },
  {
    icon: '🔨',
    title: 'Labour Charges',
    question: "The workshop manager slides a bill across the table. RM850 for '2 hours of work'.",
    choices: [
      { label: '📄 Request Itemised Invoice\n(Line-by-line breakdown of every charge)', billChange: -250, note: '✅ Itemised bill revealed 3 phantom charges. Removed RM250!', good: true },
      { label: "✍️ Sign Without Reading\n('Aiyah faster sign lah, got queue behind')", billChange: 850, note: '❌ Signed away your rights. +RM850 in phantom charges.', good: false },
    ],
  },
  {
    icon: '🔩',
    title: 'Missing Catalytic Converter',
    question: "You inspect your car. Your catalytic converter is GONE. The tauke shrugs: 'Already like that when come in lah.'",
    choices: [
      { label: '👮 Lodge a Police Report NOW\n(Missing parts = theft)', billChange: -500, note: '✅ Police investigated! Parts recovered. -RM500 off your bill!', good: true },
      { label: "😩 Believe Their Story\n('Aiyah maybe I forgot... cannot remember')", billChange: 1200, note: '❌ Stolen parts go unchallenged. +RM1200 replacement cost.', good: false },
    ],
  },
  {
    icon: '📑',
    title: 'Final Insurance Claim',
    question: "Time to settle. The adjuster and workshop manager are whispering to each other. They present a 'final offer'.",
    choices: [
      { label: '⚖️ File at the Consumer Claims Tribunal\n(RM5 to file — 1-800-88-9811)', billChange: -800, note: '✅ Tribunal ruled in your favour! -RM800 off final bill!', good: true },
      { label: "🤷 Accept Workshop's Claim\n('We handle the insurance, you just pay')", billChange: 900, note: '❌ Workshop inflated claim & pocketed difference. +RM900.', good: false },
    ],
  },
];
