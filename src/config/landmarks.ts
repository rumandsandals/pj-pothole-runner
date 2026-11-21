/**
 * PJ LANDMARKS
 * Real places you drive past, roughly in route order from Damansara Jaya,
 * through SS2 and Sections 13/14, onto the Federal Highway, and through the
 * arch into KL on the last level.
 *
 *   level — which level it appears on
 *   at    — when it passes, as a share of the level (0.5 = halfway)
 *
 * Add a level/at pair to show a landmark more than once. The drawings are
 * in src/world/landmarks.ts. Brands are look-alike parodies on purpose.
 */

export type LandmarkId =
  | 'pjMosque'
  | 'ryanMiho'
  | 'fiveStones'
  | 'pjMidtown'
  | 'centrestage'
  | 'jayaShopping'
  | 'jayaOne'
  | 'atria'
  | 'smdj'
  | 'mekdi'
  | 'burgerRaja'
  | 'aAndWah'
  | 'petrolLah'
  | 'fedHighwayArch'
  | 'masjidBulat'
  | 'kingdomcity'
  | 'maryott'
  | 'menaraStar'
  | 'sinChew';

export interface LandmarkPlacement {
  id: LandmarkId;
  name: string;
  level: number;
  at: number;
}

export const LANDMARKS: LandmarkPlacement[] = [
  // Level 1 — setting off past One City, then Damansara Jaya
  { id: 'kingdomcity', name: 'Kingdomcity (One City)', level: 1, at: 0.12 },
  { id: 'smdj', name: 'SMK Damansara Jaya', level: 1, at: 0.4 },
  { id: 'atria', name: 'Atria', level: 1, at: 0.72 },
  // Level 2 — SS2
  { id: 'mekdi', name: '"Mekdi" burgers', level: 2, at: 0.2 },
  { id: 'fiveStones', name: 'Five Stones', level: 2, at: 0.5 },
  { id: 'petrolLah', name: '"Petrol-Lah" station', level: 2, at: 0.8 },
  // Level 3 — Section 14
  { id: 'jayaShopping', name: 'Jaya Shopping Centre', level: 3, at: 0.3 },
  { id: 'aAndWah', name: '"A&Wah" drive-in', level: 3, at: 0.55 },
  { id: 'masjidBulat', name: 'Masjid Bulat', level: 3, at: 0.8 },
  // Level 4 — Section 13
  { id: 'centrestage', name: 'Centrestage', level: 4, at: 0.35 },
  { id: 'burgerRaja', name: '"Burger Raja"', level: 4, at: 0.7 },
  // Level 5 — Section 13
  { id: 'jayaOne', name: 'Jaya One', level: 5, at: 0.3 },
  { id: 'sinChew', name: 'Sin Chew', level: 5, at: 0.5 },
  { id: 'pjMidtown', name: 'PJ Midtown', level: 5, at: 0.8 },
  // Level 6 — Section 13
  { id: 'ryanMiho', name: 'Ryan & Miho', level: 6, at: 0.4 },
  { id: 'mekdi', name: '"Mekdi" burgers', level: 6, at: 0.75 },
  // Level 7 — Section 16 / Phileo Damansara, onto the Federal Highway
  { id: 'maryott', name: '"Maryott" hotel (Phileo Damansara)', level: 7, at: 0.25 },
  { id: 'menaraStar', name: 'Menara Star', level: 7, at: 0.5 },
  { id: 'petrolLah', name: '"Petrol-Lah" station', level: 7, at: 0.75 },
  // Level 8 — Federal Highway, past old-town PJ
  { id: 'pjMosque', name: 'PJ Mosque (Masjid Jamek)', level: 8, at: 0.25 },
  { id: 'burgerRaja', name: '"Burger Raja"', level: 8, at: 0.5 },
  // Level 9 — through the arch into KL
  { id: 'fedHighwayArch', name: 'Kota Darul Ehsan arch', level: 9, at: 0.88 },
];
