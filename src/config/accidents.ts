import type { RoadEvent } from './roadEvents';
import type { TowOption } from './towTrucks';

/**
 * ACCIDENT SCENES
 * One is picked at random from the matching list after a collision.
 *   minor   — you clipped a motorcycle
 *   rempit  — a Mat Rempit hit you (falls back to `minor` if empty)
 *   cyclist — you clipped a bicycle (falls back to `minor` if empty)
 *   fender  — you bumped a car
 *   serious — after a serious crash, once the proper tow has taken your car
 * Same format as roadEvents.ts. Add as many as you like to each list.
 *
 * ⚠️ FACT-CHECK BEFORE SHARING: legal points here were drafted for the
 * game. See "Facts to verify" in README.md.
 */

export const ACCIDENT_EVENTS: Record<'minor' | 'rempit' | 'cyclist' | 'fender' | 'serious', RoadEvent[]> = {
  minor: [
    {
      title: '🏍️ MIRROR CLIPPED!',
      description:
        "You clip a rider's mirror. He demands RM300 cash to 'settle here lah'. Accidents should be reported to the police within 24 hours.",
      choices: [
        { label: '📸 Photos, IC & plate + police report', effect: {}, message: '✅ Proof protects you if he tries to claim later.', tone: 'good' },
        { label: '💸 Pay RM300 cash', effect: { money: -300, heat: 15 }, message: '❌ No record, no proof — and he can still claim later!', tone: 'bad' },
      ],
    },
    {
      title: '🚑 RIDER DOWN!',
      description:
        "A motorcyclist wobbles and falls beside you. Drivers involved in an accident must stop and help — driving off is an offence.",
      choices: [
        { label: '🛑 Stop, help & call 999', effect: { hp: 5 }, message: "✅ He's shaken but OK. You did the right thing.", tone: 'good' },
        { label: '🏃 Drive off', effect: { money: -500, hp: -10, heat: 40 }, message: '❌ Hit-and-run caught on camera. -RM500!', tone: 'bad' },
      ],
    },
  ],

  rempit: [
    {
      title: '🏍️ MAT REMPIT STRIKE!',
      description:
        'A reckless rider weaving through traffic slams into you and speeds off. Your dashcam caught his plate number.',
      choices: [
        { label: '📹 Police report with dashcam video', effect: { money: 150 }, message: '✅ Report filed — your insurer covers the damage.', tone: 'good' },
        { label: '😤 Chase him down', effect: { hp: -15, heat: 20 }, message: '❌ Dangerous and pointless. You nearly crashed again!', tone: 'bad' },
      ],
    },
  ],

  cyclist: [
    {
      title: '🚲 CYCLIST CLIPPED!',
      description:
        'You pass too close and clip a cyclist, who falls onto the road. Give cyclists plenty of room when overtaking — and if there is an accident, stop and help.',
      choices: [
        { label: '🛑 Stop, help & call 999', effect: { hp: 5 }, message: "✅ Scraped knees, but OK. You did the right thing.", tone: 'good' },
        { label: '🏃 Keep driving', effect: { money: -500, hp: -10, heat: 40 }, message: '❌ A witness noted your plate. -RM500!', tone: 'bad' },
      ],
    },
  ],

  fender: [
    {
      title: '🚗 FENDER BENDER!',
      description:
        'You bumped the car ahead. Lodge a police report within 24 hours, or your insurance claim may be rejected.',
      choices: [
        { label: '👮 Report at the balai polis', effect: { money: 100 }, message: '✅ Reported on time — claim accepted.', tone: 'good' },
        { label: '🤝 Settle privately, no report', effect: { money: -400, heat: 15 }, message: '❌ No report = no claim. You paid RM400 yourself.', tone: 'bad' },
      ],
    },
    {
      title: '📄 KNOCK-FOR-KNOCK',
      description:
        "The other driver admits fault. Under Knock-for-Knock you can claim from your OWN insurer — usually faster, and your NCD isn't affected if you weren't at fault.",
      choices: [
        { label: '📄 Claim Knock-for-Knock', effect: { money: 350 }, message: '✅ Paid in weeks, and your NCD is safe.', tone: 'good' },
        { label: "⏳ Chase the other driver's insurer", effect: { money: 100 }, message: '❌ Months of paperwork for less money.', tone: 'bad' },
      ],
    },
    {
      title: '🧑‍💼 LOWBALL ADJUSTER',
      description:
        "The adjuster offers RM200 for RM900 of damage. Ask for a written assessment — and if you're still unhappy, the Ombudsman for Financial Services (OFS) handles insurance disputes for free.",
      choices: [
        { label: '📊 Written report & appeal', effect: { money: 400 }, message: '✅ Re-assessed fairly. +RM400!', tone: 'good' },
        { label: '😔 Take the RM200', effect: { money: 100 }, message: '❌ You were short-changed by RM700.', tone: 'bad' },
      ],
    },
  ],

  serious: [
    {
      title: '🚓 SERIOUS CRASH REPORT',
      description:
        'Police take statements at the scene. Get a copy of the police report and the accident sketch plan — your insurer will ask for both.',
      choices: [
        { label: '📋 Collect report & sketch plan', effect: { money: 500 }, message: '✅ Claim fully documented. Insurer pays RM500 towards repairs.', tone: 'good' },
        { label: '🙈 Skip the paperwork', effect: { money: -300 }, message: '❌ Missing documents — claim delayed and cut.', tone: 'bad' },
      ],
    },
    {
      title: '🧑‍💼 ADJUSTER INSPECTION',
      description:
        "Your insurer's adjuster inspects the car at the panel workshop. Be there, take your own photos, and ask how the repair cost was worked out.",
      choices: [
        { label: '📸 Attend & document everything', effect: { money: 600, hp: 20 }, message: '✅ Fair assessment, full repair approved.', tone: 'good' },
        { label: '📞 Let the workshop handle it', effect: { money: -200 }, message: '❌ Surprise extra charges on the final bill.', tone: 'bad' },
      ],
    },
  ],
};

/** Tow trucks after a serious crash (the ABYSS pothole ones are in towTrucks.ts). */
export const CRASH_TOW_OPTIONS: TowOption[] = [
  {
    name: "📞 Insurer's 24h Tow Hotline",
    tag: 'YOU CALLED IT · Authorised · Panel workshop',
    description:
      'Your insurer sends an authorised tow truck to an approved panel workshop. Many motor policies include free towing — check your policy for the limit.',
    priceLabel: 'FREE (within your policy limit)',
    cost: 0,
    licensed: true,
    buttonLabel: '✅ Call My Insurer',
    truckLabel: 'INSURER TOW',
    arrivingText: 'Your insurer’s tow truck is on its way.',
    outcome: '✅ Towed to a panel workshop. Time to sort the claim.',
  },
  {
    name: "🦅 'Ulat' Tow Truck",
    tag: 'ARRIVED IN 2 MINUTES · You never called it',
    description:
      "Tow touts race to crash scenes, then haul cars to their own workshops and inflate the bill. Never let a tow truck you didn't call take your car.",
    priceLabel: "'Don't worry boss, we settle insurance'",
    cost: 0,
    licensed: false,
    buttonLabel: '❓ Let Them Tow',
    truckLabel: 'ULAT TOW',
    arrivingText: 'The ulat tow truck is already hooking up your car...',
    outcome: '❌ Your car vanished to their workshop... Workshop Hell awaits.',
  },
];
