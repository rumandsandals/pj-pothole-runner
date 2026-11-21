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
  | 'sinChew'
  | 'menaraMbpj'
  | 'sunwayPyramid'
  | 'amcorp'
  | 'celcomDigi'
  | 'sheratown'
  | 'towBooKeong'
  | 'watChetawan'
  | 'aia'
  | 'durianman'
  | 'petronasi'
  | 'kerang';

export interface LandmarkPlacement {
  id: LandmarkId;
  name: string;
  level: number;
  at: number;
}

export const LANDMARKS: LandmarkPlacement[] = [
  // Level 1 — setting off from Sunway and One City
  { id: 'sunwayPyramid', name: 'Sunway Pyramid', level: 1, at: 0.04 },
  { id: 'kingdomcity', name: 'Kingdomcity (One City)', level: 1, at: 0.34 },
  { id: 'smdj', name: 'SMK Damansara Jaya', level: 1, at: 0.62 },
  // Level 2 — Damansara Jaya and SS2
  { id: 'atria', name: 'Atria', level: 2, at: 0.06 },
  { id: 'durianman', name: 'Durianman (SS2)', level: 2, at: 0.27 },
  { id: 'fiveStones', name: 'Five Stones', level: 2, at: 0.43 },
  { id: 'mekdi', name: '"Mekdi" burgers', level: 2, at: 0.62 },
  { id: 'petrolLah', name: '"Petrol-Lah" station', level: 2, at: 0.78 },
  // Level 3 — Section 14
  { id: 'jayaShopping', name: 'Jaya Shopping Centre', level: 3, at: 0.12 },
  { id: 'aia', name: 'AIA (Section 14)', level: 3, at: 0.32 },
  { id: 'masjidBulat', name: 'Masjid Bulat', level: 3, at: 0.5 },
  { id: 'petronasi', name: '"Petronasi" station', level: 3, at: 0.72 },
  // Level 4 — Section 13 and Section 52
  { id: 'centrestage', name: 'Centrestage', level: 4, at: 0.12 },
  { id: 'aAndWah', name: 'Old A&W drive-in (Lorong Sultan)', level: 4, at: 0.32 },
  { id: 'menaraMbpj', name: 'Menara MBPJ', level: 4, at: 0.52 },
  { id: 'burgerRaja', name: '"Burger Raja"', level: 4, at: 0.74 },
  // Level 5 — Section 13
  { id: 'jayaOne', name: 'Jaya One', level: 5, at: 0.12 },
  { id: 'sinChew', name: 'Sin Chew', level: 5, at: 0.34 },
  { id: 'pjMidtown', name: 'PJ Midtown', level: 5, at: 0.56 },
  { id: 'watChetawan', name: 'Wat Chetawan', level: 5, at: 0.78 },
  // Level 6 — Section 13
  { id: 'ryanMiho', name: 'Ryan & Miho', level: 6, at: 0.2 },
  { id: 'mekdi', name: '"Mekdi" burgers', level: 6, at: 0.5 },
  { id: 'kerang', name: '"Kerang" station', level: 6, at: 0.75 },
  // Level 7 — Section 16 / Phileo Damansara, onto the Federal Highway
  { id: 'maryott', name: '"Maryott" hotel (Phileo Damansara)', level: 7, at: 0.15 },
  { id: 'menaraStar', name: 'Menara Star', level: 7, at: 0.35 },
  { id: 'sheratown', name: '"Sheratown" (gold tower)', level: 7, at: 0.55 },
  { id: 'petrolLah', name: '"Petrol-Lah" station', level: 7, at: 0.78 },
  // Level 8 — PJ New Town and old town, along the Federal Highway
  { id: 'celcomDigi', name: 'Menara CelcomDigi', level: 8, at: 0.12 },
  { id: 'amcorp', name: 'Amcorp Trade Centre', level: 8, at: 0.32 },
  { id: 'towBooKeong', name: 'Tow Boo Keong temple', level: 8, at: 0.52 },
  { id: 'pjMosque', name: 'PJ Mosque (Masjid Jamek)', level: 8, at: 0.7 },
  { id: 'burgerRaja', name: '"Burger Raja"', level: 8, at: 0.86 },
  // Level 9 — through the arch into KL
  { id: 'kerang', name: '"Kerang" station', level: 9, at: 0.35 },
  { id: 'petronasi', name: '"Petronasi" station', level: 9, at: 0.6 },
  { id: 'fedHighwayArch', name: 'Kota Darul Ehsan arch', level: 9, at: 0.88 },
];
