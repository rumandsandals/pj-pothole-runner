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
  sky: { top: 'c' as C, horizon: 'f' as C, fadeStart: 30, fadeEnd: 52 },
  cloud: '7' as C,
  farBuildings: { body: 'd' as C, windows: 'f' as C },
  bushes: { dark: '3' as C, light: 'b' as C },

  kerb: ['8', '7'] as C[], // alternating kerb blocks
  road: '5' as C,
  roadSpeckles: ['0', '6'] as C[],
  laneLine: 'a' as C,

  pothole: { hole: '0' as C, rim: '6' as C, label: '8' as C, labelShadow: '0' as C, damageDot: 'a' as C },

  /** Replaces X (body) and Y (trim) in the car sprite. */
  car: { body: '8' as C, trim: '2' as C },
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
