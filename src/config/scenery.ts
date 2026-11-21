/**
 * SCENERY
 * The everyday buildings and roadside for each level (set `scenery` in
 * levels.ts). They're deliberately bland and sun-faded, like real PJ, so the
 * colourful landmarks (landmarks.ts) stand out.
 *   buildings — suburb (link houses, bungalows, shoplots),
 *               city (70s–80s concrete blocks), outskirts (warehouses, flats),
 *               soundWalls (highway walls)
 *   roadside  — pjStreet (rain trees, hedges, drains, lamps, bus stop)
 *               or highway (lamps, green signs, verge)
 * The pictures are drawn in src/world/scenery.ts.
 */

export type BuildingsId = 'suburb' | 'city' | 'outskirts' | 'soundWalls';
export type RoadsideId = 'pjStreet' | 'highway';

export interface Scenery {
  buildings: BuildingsId;
  roadside: RoadsideId;
}

export const SCENERY = {
  suburb: { buildings: 'suburb', roadside: 'pjStreet' },
  city: { buildings: 'city', roadside: 'pjStreet' },
  outskirts: { buildings: 'outskirts', roadside: 'pjStreet' },
  highwayOutskirts: { buildings: 'outskirts', roadside: 'highway' },
  highwayCity: { buildings: 'city', roadside: 'highway' },
} satisfies Record<string, Scenery>;

export type SceneryId = keyof typeof SCENERY;
