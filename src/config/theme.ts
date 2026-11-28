/**
 * COLOURS FOR THE GAME DRAWING
 * Everything is drawn from one 16-colour arcade palette. Each colour has a
 * one-character name (0-9, a-f), which is also how the pixel art in
 * sprites.ts refers to it. Change a hex value here and every place that
 * uses it changes. Below the palette, pick which colour each thing uses.
 * Menu and panel colours live at the top of src/style.css.
 */

export const PALETTE = {
  '0': '#0b0b14', // black
  '1': '#1d2b53', // navy
  '2': '#7e2553', // plum
  '3': '#008751', // dark green
  '4': '#ab5236', // brown
  '5': '#5f574f', // asphalt grey
  '6': '#c2c3c7', // light grey
  '7': '#fff1e8', // white
  '8': '#ff004d', // red
  '9': '#ffa300', // orange
  a: '#ffec27', // yellow
  b: '#00e436', // green
  c: '#29adff', // sky blue
  d: '#83769c', // lavender
  e: '#ff77a8', // pink
  f: '#ffccaa', // peach
  g: '#3b3b4a', // tyre / dark plastic
  h: '#8e8e9a', // steel grey
  i: '#a8183f', // dark red
  j: '#3a5a8c', // tinted glass
  // Bland, sun-faded PJ building colours (used for the everyday buildings, so landmarks stand out)
  k: '#cfc6b2', // faded beige
  l: '#a39b8b', // dull taupe
  m: '#a8705a', // weathered roof tile
  n: '#b9b8b0', // concrete grey
  o: '#3e4652', // dark window
  p: '#8f9c86', // faded sage
  q: '#d9d4c7', // off-white
} as const;

export type ColourKey = keyof typeof PALETTE;
type C = ColourKey;

export interface TruckColours {
  body: C;
  stripe: C;
  cab: C;
  label: C;
}

export const THEME = {
  /** Sky fades from top to horizon between these rows (art pixels, 0 = top). */
  sky: { top: 'c' as C, horizon: 'f' as C, fadeStart: 60, fadeEnd: 140 },
  cloud: '7' as C,
  farBuildings: { body: 'd' as C, windows: 'f' as C },
  bushes: { dark: '3' as C, light: 'b' as C },

  kerb: ['8', '7'] as C[], // alternating kerb blocks
  road: '5' as C,
  roadSpeckles: ['0', '6'] as C[],
  laneLine: 'a' as C,

  /** Highway levels (see `highway` in levels.ts). */
  highway: {
    laneLine: '7' as C,
    barrier: { face: '6' as C, top: '7' as C, shadow: 'h' as C, joint: 'h' as C },
    wall: { panel: 'h' as C, line: '6' as C, top: '3' as C },
    lamp: { pole: '6' as C, light: 'a' as C },
    sign: { board: '3' as C, text: '7' as C, post: 'h' as C },
  },

  pothole: { hole: '0' as C, rim: '6' as C, label: '8' as C, labelShadow: '0' as C, damageDot: 'a' as C },

  /** Your Roadster's paint: X = body, Y = shadow (silver). */
  car: { body: '6' as C, trim: 'h' as C },
  /** The Roadster's thruster flames when you jump: hot core, glow, fading tail. */
  jets: { core: '7' as C, glow: 'c' as C, tail: 'j' as C },
  smoke: '6' as C,

  /** Replaces X (body), Y (stripe) and Z (cab) in the truck sprite. */
  tow: {
    licensed: { body: 'b', stripe: '7', cab: '7', label: 'b' } as TruckColours,
    cheap: { body: '4', stripe: '9', cab: '6', label: '9' } as TruckColours,
    chain: '6' as C,
  },

  particles: { damage: '8' as C, stuck: 'a' as C, shadow: '0' as C },

  levelBadge: { box: '1' as C, number: 'a' as C, name: '7' as C, timer: '7' as C, timerWarn: '8' as C, shadow: '0' as C },

  progress: { track: '0' as C, fill: 'a' as C, tick: '6' as C, text: '7' as C, textShadow: '0' as C },
};
