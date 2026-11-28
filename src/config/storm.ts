/**
 * THUNDERSTORMS & FALLEN TREES
 * Now and then a thunderstorm rolls over PJ: the sky goes dark, lightning
 * flashes and thunder rumbles. When it passes, a few trees have come down
 * across the road. Change lane or jump over them; drive into one and it hurts.
 */
export const STORM = {
  fromLevel: 2, // never on the quiet first level (it has only one lane)
  chancePerLevel: 0.35, // chance a level gets a storm (decided at random each level)
  startsBetween: [0.15, 0.5] as [number, number], // how far into the level it can start (share of the level)
  seconds: 6, // how long the storm lasts
  darkness: 0.5, // how dark the sky gets (0 = not at all, 1 = black)
  fadeSeconds: 1.5, // the darkness fades in and out over this long
  lightningChancePerSecond: 0.9, // how often lightning strikes during the storm
  flashTicks: 7, // how long a lightning flash lasts

  // Fallen trees, after the storm
  treesAfter: [2, 4] as [number, number], // how many trees come down (fewest, most)
  treeGap: [260, 520] as [number, number], // distance between fallen trees (world units)
  treeDamage: 20, // HP lost driving into one
  treeHalfWidth: 36, // half its length along the road (world units)
  treeHeight: 18, // jump higher than this to clear it (world units)
};

export const STORM_TEXT = {
  storm: '⛈️ THUNDERSTORM! Hang on…',
  trees: '🌳 Storm damage! Fallen trees ahead — change lane or jump them!',
  hit: 'TREE!',
};
