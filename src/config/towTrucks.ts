/**
 * TOW TRUCKS
 * Shown when your car gets stuck in an ABYSS pothole.
 * licensed: true  = safe recovery, back on the road
 * licensed: false = dragged to Workshop Hell (workshop.ts)
 */

export interface TowOption {
  name: string;
  tag: string;
  description: string;
  priceLabel: string;
  cost: number; // RM taken from your money
  licensed: boolean;
  buttonLabel: string;
  truckLabel: string; // text painted on the truck
  arrivingText: string;
  outcome: string;
}

export const TOW_OPTIONS: TowOption[] = [
  {
    name: "🚛 Uncle Rajan's Towing",
    tag: 'LICENSED · Registered company · GPS Tracked',
    description: 'Upfront pricing. Proper receipt issued. Certified crew. Takes you to an authorised workshop you choose.',
    priceLabel: 'Est. RM120 — receipt provided',
    cost: 120,
    licensed: true,
    buttonLabel: '✅ Choose Licensed Tow',
    truckLabel: 'LICENSED TOW',
    arrivingText: 'Uncle Rajan is on his way. Hang tight!',
    outcome: '✅ Safe tow! RM120 paid, full receipt given. Back on the road!',
  },
  {
    name: '🚛 Ah Fatt Express Tow',
    tag: 'CHEAPEST IN TOWN · No Receipt · Cash Only',
    description: "No meter, no receipt, no insurance. 'Cheap cheap lah bro.' Smells like trouble. Very strong trouble.",
    priceLabel: 'FREE... but no receipt 🚩',
    cost: 0,
    licensed: false,
    buttonLabel: '❓ Choose Cheap Tow',
    truckLabel: 'CHEAP TOW',
    arrivingText: 'Ah Fatt Express is coming... this feels sketchy.',
    outcome: '❌ No receipt = no claim! Dragged to their workshop cousin...',
  },
];
