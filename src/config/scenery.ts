/**
 * SCENERY
 * What you drive past on each level (set `scenery` in levels.ts).
 *   buildings — the row of buildings behind the road
 *   roadside  — what's right next to the road
 * The pictures are drawn in src/world/scenery.ts.
 */

export type BuildingsId = 'houses' | 'shophouses' | 'policeStation' | 'flats' | 'offices' | 'workshops' | 'soundWalls' | 'factories' | 'cityCentre';
export type RoadsideId = 'trees' | 'palms' | 'lamps';

export interface Scenery {
  buildings: BuildingsId;
  roadside: RoadsideId;
}

export const SCENERY = {
  pjHouses: { buildings: 'houses', roadside: 'trees' },
  ss2Shophouses: { buildings: 'shophouses', roadside: 'palms' },
  policeHQ: { buildings: 'policeStation', roadside: 'palms' },
  flats: { buildings: 'flats', roadside: 'trees' },
  offices: { buildings: 'offices', roadside: 'palms' },
  workshops: { buildings: 'workshops', roadside: 'trees' },
  federalHighway: { buildings: 'soundWalls', roadside: 'lamps' },
  industrial: { buildings: 'factories', roadside: 'lamps' },
  cityCentre: { buildings: 'cityCentre', roadside: 'lamps' },
} satisfies Record<string, Scenery>;

export type SceneryId = keyof typeof SCENERY;
