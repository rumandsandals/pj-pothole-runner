import type { BuildingsId, RoadsideId } from '../config/scenery';
import { PALM } from '../config/sprites';
import { THEME, type ColourKey } from '../config/theme';
import { drawSprite, drawText, fill, makeCanvas, seededRandom } from './pixels';

/**
 * The everyday scenery you drive past: deliberately bland, sun-faded
 * PJ buildings (so the colourful landmarks stand out), and the roadside
 * that gives Petaling Jaya its look — big umbrella rain trees, trimmed
 * hedges with bougainvillea, concrete monsoon drains, lamps and bus stops.
 *
 * Each strip is two pictures:
 *   image  — what you see in daylight
 *   lights — only what glows at dusk (windows, lamps), drawn on top
 * Strips repeat side by side as the road scrolls.
 */

export interface Strip {
  image: HTMLCanvasElement;
  lights: HTMLCanvasElement;
}

type G = CanvasRenderingContext2D;
type Draw = (ctx: G, glow: G, w: number, h: number, random: () => number) => void;

const WIDTH = 720;
const pickFrom = <T,>(list: T[], random: () => number): T => list[Math.floor(random() * list.length)] as T;

/** Bland PJ wall colours: faded beige, off-white, concrete, taupe, sage. */
const WALLS: ColourKey[] = ['k', 'q', 'n', 'k', 'l', 'p', 'q'];

/** A window: dark by day, sometimes lit at dusk. */
function windowAt(ctx: G, glow: G, x: number, y: number, w: number, h: number, random: () => number, lit = 0.55): void {
  fill(ctx, 'o', x, y, w, h);
  if (random() < lit) fill(glow, random() < 0.8 ? 'a' : 'f', x, y, w, h);
}

/** A hipped tiled roof (wider at the bottom). */
function hipRoof(ctx: G, x: number, bottom: number, w: number, rise: number, colour: ColourKey): void {
  for (let r = 0; r < rise; r++) {
    const inset = Math.round(((rise - r) / rise) * (w * 0.32));
    fill(ctx, colour, x - 2 + inset, bottom - rise + r, w + 4 - inset * 2, 1);
  }
  fill(ctx, '5', x - 2, bottom, w + 4, 1);
}

// ── Buildings ────────────────────────────────────────────────
const BUILDINGS: Record<BuildingsId, { height: number; draw: Draw }> = {
  /**
   * SUBURB: rows of double-storey link houses with hipped tile roofs,
   * the odd bungalow, and short rows of 2–3 storey shoplots.
   */
  suburb: {
    height: 62,
    draw: (ctx, glow, w, h, random) => {
      let x = 0;
      while (x < w) {
        const kind = random();
        if (kind < 0.6) {
          // a terrace of link houses
          const units = 3 + Math.floor(random() * 4);
          for (let u = 0; u < units && x < w; u++) {
            const unit = 30;
            const top = h - 30;
            hipRoof(ctx, x, top, unit, 9, random() < 0.7 ? 'm' : 'l');
            fill(ctx, '5', x, top, unit, 30);
            fill(ctx, pickFrom(WALLS, random), x + 1, top + 1, unit - 2, 29);
            windowAt(ctx, glow, x + 4, top + 5, 8, 6, random);
            windowAt(ctx, glow, x + 17, top + 5, 8, 6, random);
            fill(ctx, 'l', x + 1, top + 14, unit - 2, 1); // first-floor ledge
            fill(ctx, 'o', x + 18, top + 18, 7, 12); // door
            windowAt(ctx, glow, x + 4, top + 18, 10, 6, random, 0.4);
            fill(ctx, 'n', x + 1, h - 7, unit - 2, 2); // car porch slab
            for (let gx = x; gx < x + unit; gx += 3) fill(ctx, '5', gx, h - 5, 1, 5); // gate
            x += unit;
          }
        } else if (kind < 0.8) {
          // bungalow on a bigger plot
          const bw = 48;
          const top = h - 22;
          hipRoof(ctx, x + 6, top, bw - 12, 11, 'm');
          fill(ctx, '5', x + 6, top, bw - 12, 22);
          fill(ctx, pickFrom(WALLS, random), x + 7, top + 1, bw - 14, 21);
          windowAt(ctx, glow, x + 11, top + 6, 8, 7, random);
          windowAt(ctx, glow, x + 27, top + 6, 8, 7, random);
          fill(ctx, '5', x, h - 6, bw, 1); // fence
          for (let gx = x; gx < x + bw; gx += 4) fill(ctx, '5', gx, h - 6, 1, 6);
          x += bw;
        } else {
          // short row of shoplots
          const units = 3 + Math.floor(random() * 3);
          const floors = 2 + Math.floor(random() * 2);
          const top = h - floors * 16 - 4;
          for (let u = 0; u < units && x < w; u++) {
            const unit = 26;
            fill(ctx, '5', x, top, unit, h - top);
            fill(ctx, pickFrom(WALLS, random), x + 1, top + 1, unit - 2, h - top - 1);
            for (let f = 0; f < floors - 1; f++) {
              windowAt(ctx, glow, x + 4, top + 4 + f * 16, 18, 7, random);
              fill(ctx, 'l', x + 1, top + 13 + f * 16, unit - 2, 1);
            }
            fill(ctx, 'n', x + 1, h - 18, unit - 2, 3); // faded signboard
            fill(ctx, 'l', x, h - 15, unit, 2); // five-foot-way awning
            fill(ctx, 'o', x + 4, h - 13, unit - 8, 13); // shop front
            if (random() < 0.5) fill(glow, 'f', x + 4, h - 13, unit - 8, 13);
            x += unit;
          }
        }
        x += 6 + Math.floor(random() * 18);
      }
    },
  },

  /**
   * CITY: 1970s–80s concrete office and apartment blocks — flat roofs,
   * horizontal window bands, water tanks and stained, faded walls.
   */
  city: {
    height: 120,
    draw: (ctx, glow, w, h, random) => {
      let x = 0;
      while (x < w) {
        const bw = 44 + Math.floor(random() * 40);
        const floors = 6 + Math.floor(random() * 12);
        const top = h - floors * 6 - 6;
        const wall = pickFrom(WALLS, random);
        fill(ctx, '5', x, top - 1, bw, h - top + 1);
        fill(ctx, wall, x + 1, top, bw - 2, h - top);
        const banded = random() < 0.6;
        for (let f = 0; f < floors; f++) {
          const y = top + 3 + f * 6;
          if (banded) {
            fill(ctx, 'o', x + 3, y, bw - 6, 3); // ribbon windows
            for (let gx = x + 3; gx < x + bw - 4; gx += 5) if (random() < 0.4) fill(glow, 'f', gx, y, 4, 3);
          } else {
            for (let gx = x + 3; gx < x + bw - 5; gx += 6) windowAt(ctx, glow, gx, y, 3, 3, random, 0.45);
          }
        }
        // rain stains and a rooftop water tank
        for (let s = 0; s < 3; s++) fill(ctx, 'l', x + 4 + Math.floor(random() * (bw - 8)), top + 2, 1, 6 + Math.floor(random() * 16));
        fill(ctx, 'n', x + Math.floor(bw / 2) - 5, top - 6, 10, 5);
        fill(ctx, '5', x + Math.floor(bw / 2) - 5, top - 6, 10, 1);
        x += bw + 3 + Math.floor(random() * 10);
      }
    },
  },

  /**
   * OUTSKIRTS: industrial PJ — grey warehouses with zinc roofs, factory
   * blocks, a few low-cost flats behind.
   */
  outskirts: {
    height: 80,
    draw: (ctx, glow, w, h, random) => {
      let x = 0;
      while (x < w) {
        if (random() < 0.25) {
          // low-cost flats behind
          const bw = 56;
          const top = h - 70;
          fill(ctx, '5', x, top - 1, bw, h - top + 1);
          fill(ctx, pickFrom<ColourKey>(['k', 'q', 'n'], random), x + 1, top, bw - 2, h - top);
          for (let y = top + 4; y < h - 4; y += 8) {
            fill(ctx, 'l', x + 1, y + 5, bw - 2, 1);
            for (let gx = x + 3; gx < x + bw - 4; gx += 6) windowAt(ctx, glow, gx, y, 3, 4, random, 0.5);
          }
          x += bw + 8;
          continue;
        }
        // warehouse / factory
        const bw = 80 + Math.floor(random() * 50);
        const top = h - 34;
        for (let r = 0; r < 7; r++) fill(ctx, r % 2 ? 'h' : 'n', x - 2, top - 7 + r, bw + 4, 1); // zinc roof
        fill(ctx, '5', x, top, bw, 34);
        fill(ctx, pickFrom<ColourKey>(['n', 'k', 'l'], random), x + 1, top + 1, bw - 2, 33);
        for (let sx = x + 6; sx < x + bw - 22; sx += 26) {
          fill(ctx, 'h', sx, top + 12, 20, 22); // roller shutters
          for (let ly = top + 13; ly < h; ly += 2) fill(ctx, 'l', sx, ly, 20, 1);
        }
        for (let wx = x + 4; wx < x + bw - 8; wx += 10) windowAt(ctx, glow, wx, top + 4, 6, 3, random, 0.3);
        if (random() < 0.4) {
          const cx = x + bw - 14;
          fill(ctx, 'l', cx, h - 64, 6, 30); // chimney
          fill(ctx, 'n', cx - 4, h - 72, 10, 5); // smoke
          fill(ctx, 'n', cx - 10, h - 78, 12, 5);
        }
        x += bw + 8 + Math.floor(random() * 20);
      }
    },
  },

  /** Highway sound walls: grey panels with a green cap. */
  soundWalls: {
    height: 40,
    draw: (ctx, _glow, w, h) => {
      const { panel, line, top } = THEME.highway.wall;
      fill(ctx, top, 0, 0, w, 3);
      fill(ctx, panel, 0, 3, w, h - 3);
      for (let x = 0; x < w; x += 32) {
        fill(ctx, '5', x, 3, 2, h - 3);
        for (let y = 9; y < h; y += 8) fill(ctx, line, x + 3, y, 28, 1);
      }
    },
  },
};

// ── Roadside ─────────────────────────────────────────────────
function lampPost(ctx: G, glow: G, x: number, h: number): void {
  const { pole, light } = THEME.highway.lamp;
  fill(ctx, pole, x, 8, 3, h - 8);
  fill(ctx, pole, x, 8, 18, 2);
  fill(ctx, light, x + 14, 10, 6, 2);
  fill(ctx, '5', x - 2, h - 3, 7, 3);
  fill(glow, 'a', x + 13, 10, 8, 3);
}

/** A big PJ rain tree / angsana: tall trunk, wide spreading umbrella canopy. */
function rainTree(ctx: G, x: number, h: number, size: number, random: () => number): void {
  const trunkTop = h - 40 - size;
  fill(ctx, '4', x - 2, trunkTop, 4, h - trunkTop - 8); // trunk
  // spreading branches
  for (let i = 0; i < 12; i++) {
    fill(ctx, '4', x - 2 - i, trunkTop + 6 - Math.floor(i / 2), 2, 1);
    fill(ctx, '4', x + 1 + i, trunkTop + 5 - Math.floor(i / 2), 2, 1);
  }
  // canopy: a wide, flat-bottomed umbrella with a ragged top
  const wide = 40 + size * 2;
  const tall = 20 + Math.floor(size / 2);
  const base = trunkTop + 2;
  for (let row = 0; row < tall; row++) {
    const t = row / tall; // 0 = bottom, 1 = top
    const half = Math.round(wide * Math.sqrt(Math.max(0, 1 - t * t)) * (0.85 + random() * 0.15));
    fill(ctx, t > 0.55 ? 'b' : '3', x - half, base - row, half * 2, 1);
  }
  // clumps of lighter leaves and shadow underneath
  for (let i = 0; i < 18; i++) fill(ctx, 'b', x - wide + 6 + Math.floor(random() * (wide * 2 - 12)), base - tall + 4 + Math.floor(random() * (tall - 6)), 3, 2);
  fill(ctx, '3', x - wide + 4, base, wide * 2 - 8, 2);
}

/** Trimmed roadside hedge with pink bougainvillea, over a concrete monsoon drain. */
function hedgeAndDrain(ctx: G, w: number, h: number, random: () => number): void {
  const { dark, light } = THEME.bushes;
  fill(ctx, 'n', 0, h - 5, w, 5); // monsoon drain wall
  fill(ctx, '5', 0, h - 3, w, 1);
  fill(ctx, dark, 0, h - 16, w, 11); // trimmed hedge, flat-topped
  fill(ctx, light, 0, h - 16, w, 2);
  for (let x = 0; x < w; x += 3) if (random() < 0.45) fill(ctx, light, x, h - 14 + Math.floor(random() * 8), 1, 1);
  for (let x = 0; x < w; x += 2) if (random() < 0.2) fill(ctx, 'e', x, h - 16 + Math.floor(random() * 6), 2, 2); // bougainvillea
  for (let x = 0; x < w; x += 24) fill(ctx, '5', x, h - 5, 1, 5); // drain joints
}

/** A simple PJ bus stop shelter. */
function busStop(ctx: G, glow: G, x: number, h: number): void {
  fill(ctx, '0', x, h - 24, 34, 3);
  fill(ctx, '1', x + 1, h - 23, 32, 2);
  fill(ctx, '6', x + 2, h - 21, 2, 17);
  fill(ctx, '6', x + 30, h - 21, 2, 17);
  fill(ctx, 'n', x + 4, h - 10, 26, 2); // bench
  fill(ctx, 'c', x + 6, h - 20, 22, 6); // route map board
  fill(glow, 'f', x + 6, h - 20, 22, 6);
}

const ROADSIDE: Record<RoadsideId, { height: number; width: number; draw: Draw }> = {
  /** The classic PJ road edge: rain trees, hedge, drain, lamps and a bus stop. */
  pjStreet: {
    height: 96,
    width: 840,
    draw: (ctx, glow, w, h, random) => {
      for (let x = 50; x < w - 50; x += 120 + Math.floor(random() * 60)) rainTree(ctx, x, h, Math.floor(random() * 10), random);
      for (let x = 70; x < w; x += 200) lampPost(ctx, glow, x, h);
      busStop(ctx, glow, 440, h - 4);
      hedgeAndDrain(ctx, w, h, random);
    },
  },

  /** Highway verge: lamp posts, green direction signs, rain trees and a few palms. */
  highway: {
    height: 84,
    width: 900,
    draw: (ctx, glow, w, h, random) => {
      const sign = THEME.highway.sign;
      for (const x of [60, 380, 720]) rainTree(ctx, x, h, 4, random);
      for (let x = 40; x < w; x += 150) lampPost(ctx, glow, x, h);
      ['PJ 3 KM', 'KL 12 KM', 'SUBANG 8', 'SHAH ALAM'].forEach((text, i) => {
        const x = 100 + i * 220;
        fill(ctx, sign.post, x + 8, 30, 3, h - 30);
        fill(ctx, sign.post, x + 66, 30, 3, h - 30);
        fill(ctx, '0', x - 1, 7, 80, 26);
        fill(ctx, sign.board, x, 8, 78, 24);
        fill(ctx, sign.text, x + 2, 10, 74, 1);
        fill(ctx, sign.text, x + 2, 29, 74, 1);
        drawText(ctx, text, x + 39, 15, sign.text, { align: 'center' });
        drawText(glow, text, x + 39, 15, sign.text, { align: 'center' });
      });
      for (const x of [230, 820]) drawSprite(ctx, PALM, x, h - PALM.length);
      fill(ctx, THEME.bushes.dark, 0, h - 6, w, 6); // grass verge
      fill(ctx, THEME.bushes.light, 0, h - 6, w, 1);
    },
  },
};

// ── Building the strips (once each, then reused) ─────────────
const cache = new Map<string, Strip>();

function build(key: string, width: number, height: number, draw: Draw, seed: number): Strip {
  let strip = cache.get(key);
  if (!strip) {
    const [image, ctx] = makeCanvas(width, height);
    const [lights, glow] = makeCanvas(width, height);
    draw(ctx, glow, width, height, seededRandom(seed));
    strip = { image, lights };
    cache.set(key, strip);
  }
  return strip;
}

export const buildingsStrip = (id: BuildingsId): Strip =>
  build(`b:${id}`, WIDTH, BUILDINGS[id].height, BUILDINGS[id].draw, 11 + id.length);

export const roadsideStrip = (id: RoadsideId): Strip =>
  build(`r:${id}`, ROADSIDE[id].width, ROADSIDE[id].height, ROADSIDE[id].draw, 21 + id.length);
