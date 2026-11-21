import type { BuildingsId, RoadsideId } from '../config/scenery';
import { PALM } from '../config/sprites';
import { THEME, type ColourKey } from '../config/theme';
import { drawSprite, drawText, fill, makeCanvas, seededRandom } from './pixels';

/**
 * The scenery strips you drive past. Each strip is two pictures:
 *   image  — what you see in daylight
 *   lights — only the things that glow at night (windows, signs, lamps),
 *            drawn on top after the scene is darkened
 * Strips repeat side by side as the road scrolls.
 */

export interface Strip {
  image: HTMLCanvasElement;
  lights: HTMLCanvasElement;
}

type Draw = (ctx: CanvasRenderingContext2D, glow: CanvasRenderingContext2D, w: number, h: number, random: () => number) => void;

const WIDTH = 720;
const pickFrom = <T,>(list: T[], random: () => number): T => list[Math.floor(random() * list.length)] as T;

/** A lit window: drawn normally by day, and into the lights layer if it's lit at night. */
function windowAt(ctx: CanvasRenderingContext2D, glow: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, random: () => number, lit = 0.6): void {
  fill(ctx, '1', x, y, w, h);
  if (random() < lit) fill(glow, random() < 0.8 ? 'a' : 'f', x, y, w, h);
}

// ── Buildings ────────────────────────────────────────────────
const BUILDINGS: Record<BuildingsId, { height: number; draw: Draw }> = {
  /** PJ terrace houses: pastel walls, terracotta roofs, gates and porches. */
  houses: {
    height: 54,
    draw: (ctx, glow, w, h, random) => {
      const walls: ColourKey[] = ['f', '7', 'e', '6', 'b'];
      let x = 0;
      while (x < w) {
        const unit = 36;
        const wall = pickFrom(walls, random);
        const top = h - 40;
        // pitched roof
        for (let r = 0; r < 10; r++) fill(ctx, r < 2 ? '4' : '9', x + 5 - Math.floor(r / 2), top - 10 + r, unit - 10 + r, 1);
        fill(ctx, '0', x, top, unit, 40);
        fill(ctx, wall, x + 1, top + 1, unit - 2, 39);
        windowAt(ctx, glow, x + 5, top + 6, 9, 8, random);
        windowAt(ctx, glow, x + 21, top + 6, 9, 8, random);
        fill(ctx, '4', x + 22, top + 22, 8, 18); // door
        windowAt(ctx, glow, x + 5, top + 22, 12, 8, random, 0.4);
        // front gate
        for (let gx = x; gx < x + unit; gx += 3) fill(ctx, '0', gx, h - 10, 1, 10);
        fill(ctx, '0', x, h - 10, unit, 1);
        x += unit;
      }
    },
  },

  /** Two-storey shophouses with signboards and awnings. */
  shophouses: {
    height: 64,
    draw: (ctx, glow, w, h, random) => {
      const walls: ColourKey[] = ['f', 'e', '9', '6', 'c', 'b'];
      const signs: ColourKey[] = ['8', '1', '3', '2', 'a'];
      let x = 0;
      while (x < w) {
        const blocks = 3 + Math.floor(random() * 4);
        const bh = 46 + Math.floor(random() * 14);
        const top = h - bh;
        for (let b = 0; b < blocks && x < w; b++) {
          const unit = 28;
          const wall = pickFrom(walls, random);
          fill(ctx, '0', x, top - 1, unit, bh + 1);
          fill(ctx, wall, x + 1, top, unit - 2, bh);
          fill(ctx, '5', x + 1, top, unit - 2, 2);
          for (const wx of [x + 4, x + 16]) {
            windowAt(ctx, glow, wx, top + 6, 8, 10, random);
            fill(ctx, '6', wx + 3, top + 6, 1, 10);
          }
          const sign = pickFrom(signs, random);
          fill(ctx, sign, x + 2, top + 20, unit - 4, 6);
          fill(ctx, '7', x + 5, top + 22, unit - 10, 1);
          if (random() < 0.7) fill(glow, sign === '1' ? 'c' : sign, x + 2, top + 20, unit - 4, 6); // lit signboard
          fill(ctx, '4', x, top + 27, unit, 3);
          fill(ctx, '2', x + 1, top + 30, unit - 2, bh - 30);
          fill(ctx, '1', x + 6, top + 33, unit - 12, bh - 33);
          if (random() < 0.5) fill(glow, 'f', x + 6, top + 33, unit - 12, bh - 33); // shop still open
          fill(ctx, wall, x + 1, top + 30, 2, bh - 30);
          fill(ctx, wall, x + unit - 3, top + 30, 2, bh - 30);
          x += unit;
        }
        x += 10 + Math.floor(random() * 30);
      }
    },
  },

  /** Shophouses with a police station (balai polis) every so often. */
  policeStation: {
    height: 64,
    draw: (ctx, glow, w, h, random) => {
      BUILDINGS.shophouses.draw(ctx, glow, w, h, random);
      for (let x = 120; x < w - 100; x += 360) {
        const top = h - 58;
        fill(ctx, '0', x - 1, top - 1, 98, 59);
        fill(ctx, '7', x, top, 96, 58);
        fill(ctx, '1', x, top + 18, 96, 8); // navy band
        drawText(ctx, 'POLIS', x + 48, top + 20, '7', { align: 'center', scale: 0.5 });
        fill(glow, 'c', x, top + 18, 96, 8);
        drawText(glow, 'POLIS', x + 48, top + 20, '7', { align: 'center', scale: 0.5 });
        for (let wx = x + 6; wx < x + 90; wx += 14) {
          windowAt(ctx, glow, wx, top + 5, 9, 9, random, 0.7);
          windowAt(ctx, glow, wx, top + 32, 9, 9, random, 0.5);
        }
        fill(ctx, '1', x + 40, top + 44, 16, 14); // doors
        // flagpole with a striped flag
        fill(ctx, '6', x + 100, top - 20, 1, 78);
        for (let s = 0; s < 6; s++) fill(ctx, s % 2 ? '7' : '8', x + 101, top - 20 + s * 2, 14, 2);
        fill(ctx, '1', x + 101, top - 20, 6, 6);
        fill(ctx, 'a', x + 103, top - 18, 2, 2);
      }
    },
  },

  /** Low-cost flats: tall blocks with corridors, laundry and lots of windows. */
  flats: {
    height: 100,
    draw: (ctx, glow, w, h, random) => {
      let x = 0;
      while (x < w) {
        const bw = 60 + Math.floor(random() * 24);
        const bh = 70 + Math.floor(random() * 30);
        const top = h - bh;
        const wall = pickFrom<ColourKey>(['f', '6', 'e', '9'], random);
        fill(ctx, '0', x, top - 1, bw, bh + 1);
        fill(ctx, wall, x + 1, top, bw - 2, bh);
        for (let fy = top + 6; fy < h - 6; fy += 9) {
          fill(ctx, '5', x + 1, fy + 6, bw - 2, 1); // corridor rail
          for (let wx = x + 4; wx < x + bw - 6; wx += 7) windowAt(ctx, glow, wx, fy, 4, 5, random, 0.55);
          if (random() < 0.4) fill(ctx, pickFrom<ColourKey>(['8', 'c', 'a', 'b', '7'], random), x + 6 + Math.floor(random() * (bw - 16)), fy + 3, 6, 2); // laundry
        }
        x += bw + 6 + Math.floor(random() * 20);
      }
    },
  },

  /** Glass office towers (Insurance Row). */
  offices: {
    height: 130,
    draw: (ctx, glow, w, h, random) => {
      let x = 0;
      while (x < w) {
        const bw = 40 + Math.floor(random() * 36);
        const bh = 70 + Math.floor(random() * 60);
        const top = h - bh;
        const glass = pickFrom<ColourKey>(['j', 'c', 'd', '1'], random);
        fill(ctx, '0', x, top - 1, bw, bh + 1);
        fill(ctx, glass, x + 1, top, bw - 2, bh);
        for (let fy = top + 4; fy < h - 2; fy += 5) fill(ctx, '6', x + 1, fy, bw - 2, 1); // floor lines
        for (let fx = x + 6; fx < x + bw - 2; fx += 8) fill(ctx, glass === '1' ? 'j' : '1', fx, top, 1, bh); // mullions
        fill(ctx, '7', x + 3, top + 3, 2, Math.floor(bh / 2)); // reflection
        for (let fy = top + 5; fy < h - 2; fy += 5)
          for (let fx = x + 2; fx < x + bw - 4; fx += 8) if (random() < 0.45) fill(glow, 'f', fx, fy, 5, 3);
        if (random() < 0.5) fill(ctx, '8', x + Math.floor(bw / 2) - 1, top - 6, 2, 6); // antenna
        fill(glow, '8', x + Math.floor(bw / 2) - 1, top - 6, 2, 2);
        x += bw + 4 + Math.floor(random() * 14);
      }
    },
  },

  /** Workshops: zinc roofs, roller shutters, BENGKEL signs and tyre stacks. */
  workshops: {
    height: 52,
    draw: (ctx, glow, w, h, random) => {
      let x = 0;
      while (x < w) {
        const bw = 70 + Math.floor(random() * 30);
        const top = h - 40;
        for (let r = 0; r < 8; r++) fill(ctx, r % 2 ? 'h' : '6', x - 2, top - 8 + r, bw + 4, 1); // zinc roof
        fill(ctx, '0', x, top, bw, 40);
        fill(ctx, pickFrom<ColourKey>(['f', '9', '6', 'b'], random), x + 1, top + 1, bw - 2, 39);
        const sign = pickFrom<ColourKey>(['8', '1', 'a', '3'], random);
        fill(ctx, sign, x + 6, top + 3, bw - 12, 9);
        drawText(ctx, 'BENGKEL', x + bw / 2, top + 5, sign === 'a' ? '0' : '7', { align: 'center', scale: 0.5 });
        fill(glow, sign === '1' ? 'c' : sign, x + 6, top + 3, bw - 12, 9);
        drawText(glow, 'BENGKEL', x + bw / 2, top + 5, sign === 'a' ? '0' : '7', { align: 'center', scale: 0.5 });
        // roller shutters, one half-open with a lit inside
        for (let sx = x + 6; sx < x + bw - 22; sx += 24) {
          fill(ctx, '5', sx, top + 16, 20, 24);
          for (let ly = top + 17; ly < top + 40; ly += 2) fill(ctx, 'h', sx, ly, 20, 1);
          if (random() < 0.5) {
            fill(ctx, '0', sx, top + 28, 20, 12);
            fill(glow, 'a', sx, top + 28, 20, 12);
          }
        }
        // tyre stack
        for (let t = 0; t < 4; t++) fill(ctx, '0', x + bw - 12, h - 4 - t * 4, 9, 3);
        x += bw + 12 + Math.floor(random() * 24);
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

  /** Factories: warehouses with saw-tooth roofs, chimneys and smoke. */
  factories: {
    height: 96,
    draw: (ctx, glow, w, h, random) => {
      let x = 0;
      while (x < w) {
        const bw = 90 + Math.floor(random() * 40);
        const top = h - 44;
        fill(ctx, '0', x, top - 1, bw, 45);
        fill(ctx, pickFrom<ColourKey>(['6', 'h', 'f'], random), x + 1, top, bw - 2, 44);
        for (let rx = x; rx < x + bw - 12; rx += 14) {
          for (let r = 0; r < 10; r++) fill(ctx, 'h', rx + r, top - 10 + r, 14 - r, 1); // saw-tooth roof
          fill(ctx, 'j', rx + 10, top - 6, 3, 6);
        }
        for (let wx = x + 6; wx < x + bw - 10; wx += 12) windowAt(ctx, glow, wx, top + 10, 8, 5, random, 0.5);
        fill(ctx, '5', x + 10, h - 16, 24, 16); // loading bay
        // chimney with stripes and smoke
        const cx = x + bw - 24;
        fill(ctx, '0', cx - 1, h - 94, 10, 50);
        for (let s = 0; s < 5; s++) fill(ctx, s % 2 ? '7' : '8', cx, h - 93 + s * 10, 8, 10);
        fill(glow, '8', cx + 3, h - 96, 2, 2); // aircraft warning light
        for (let p = 0; p < 4; p++) fill(ctx, '6', cx - 6 - p * 7, h - 104 - p * 3, 8 + p * 2, 6);
        x += bw + 10 + Math.floor(random() * 30);
      }
    },
  },

  /** City centre: dense, tall towers with crowns and lots of lights. */
  cityCentre: {
    height: 150,
    draw: (ctx, glow, w, h, random) => {
      let x = 0;
      while (x < w) {
        const bw = 30 + Math.floor(random() * 30);
        const bh = 90 + Math.floor(random() * 60);
        const top = h - bh;
        const wall = pickFrom<ColourKey>(['j', 'd', '6', 'c', 'h'], random);
        fill(ctx, '0', x, top - 1, bw, bh + 1);
        fill(ctx, wall, x + 1, top, bw - 2, bh);
        if (random() < 0.5) fill(ctx, wall, x + 5, top - 8, bw - 10, 8); // stepped crown
        if (random() < 0.4) fill(ctx, '6', x + Math.floor(bw / 2), top - 24, 1, 16); // spire
        for (let fy = top + 4; fy < h - 3; fy += 6)
          for (let fx = x + 3; fx < x + bw - 4; fx += 5) {
            fill(ctx, '1', fx, fy, 3, 3);
            if (random() < 0.55) fill(glow, random() < 0.85 ? 'a' : 'c', fx, fy, 3, 3);
          }
        x += bw + 2 + Math.floor(random() * 6);
      }
    },
  },
};

// ── Roadside ─────────────────────────────────────────────────
function lampPost(ctx: CanvasRenderingContext2D, glow: CanvasRenderingContext2D, x: number, h: number): void {
  const { pole, light } = THEME.highway.lamp;
  fill(ctx, pole, x, 8, 3, h - 8);
  fill(ctx, pole, x, 8, 18, 2);
  fill(ctx, light, x + 14, 10, 6, 2);
  fill(ctx, '5', x - 2, h - 3, 7, 3);
  fill(glow, 'a', x + 13, 10, 8, 3);
}

function hedge(ctx: CanvasRenderingContext2D, w: number, h: number, random: () => number): void {
  const { dark, light } = THEME.bushes;
  for (let bx = 0; bx < w; bx += 8) {
    const bh = 5 + Math.floor(random() * 5);
    fill(ctx, dark, bx, h - bh, 8, bh);
    fill(ctx, light, bx + 2, h - bh, 3, 1);
    fill(ctx, light, bx + 1, h - bh + 1, 1, 1);
    fill(ctx, '0', bx, h - 1, 8, 1);
  }
}

const ROADSIDE: Record<RoadsideId, { height: number; width: number; draw: Draw }> = {
  /** Big round rain trees, a hedge and the odd street lamp. */
  trees: {
    height: 60,
    width: 760,
    draw: (ctx, glow, w, h, random) => {
      for (let x = 30; x < w - 40; x += 110 + Math.floor(random() * 90)) {
        fill(ctx, '4', x + 14, h - 26, 4, 26);
        for (const [dx, dy, r] of [[16, h - 34, 15], [6, h - 30, 10], [27, h - 30, 11], [16, h - 44, 10]] as const) {
          for (let yy = -r; yy <= r; yy++) {
            const half = Math.round(Math.sqrt(r * r - yy * yy));
            fill(ctx, yy < -r / 3 ? 'b' : '3', x + dx - half, dy + yy, half * 2, 1);
          }
        }
      }
      for (let x = 90; x < w; x += 250) lampPost(ctx, glow, x, h);
      hedge(ctx, w, h, random);
    },
  },

  /** Palm trees, a hedge and street lamps. */
  palms: {
    height: 52,
    width: 760,
    draw: (ctx, glow, w, h, random) => {
      for (let x = 10; x < w - 30; x += 80 + Math.floor(random() * 130)) drawSprite(ctx, PALM, x, h - PALM.length);
      for (let x = 60; x < w; x += 260) lampPost(ctx, glow, x, h);
      hedge(ctx, w, h, random);
    },
  },

  /** Highway: lamp posts, green direction signs, a few palms. */
  lamps: {
    height: 70,
    width: 900,
    draw: (ctx, glow, w, h) => {
      const sign = THEME.highway.sign;
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
        drawText(glow, text, x + 39, 15, sign.text, { align: 'center' }); // reflective lettering
      });
      for (const x of [10, 330, 610, 820]) drawSprite(ctx, PALM, x, h - PALM.length);
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
