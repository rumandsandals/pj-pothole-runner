import type { LandmarkId } from '../config/landmarks';
import type { ColourKey } from '../config/theme';
import { drawText, fill, makeCanvas, seededRandom } from './pixels';
import type { Strip } from './scenery';

/**
 * PJ LANDMARKS, drawn in pixel art from public descriptions and photos.
 * Each drawing has two layers like the scenery: the building, and the
 * lights that glow at dusk. Shapes are simplified for a 640×360 game —
 * edit the numbers here to tweak a building.
 *
 * Brands are playful look-alikes (no real names or logos).
 */

type G = CanvasRenderingContext2D;
type Draw = (ctx: G, glow: G, w: number, h: number) => void;

/** A tower block: outline, wall, a grid of windows (some lit at dusk), optional balconies. */
function tower(ctx: G, glow: G, x: number, top: number, w: number, bottom: number, wall: ColourKey, glass: ColourKey, seed: number, balconies = false): void {
  const random = seededRandom(seed);
  fill(ctx, '0', x - 1, top - 1, w + 2, bottom - top + 1);
  fill(ctx, wall, x, top, w, bottom - top);
  for (let y = top + 3; y < bottom - 3; y += 5) {
    for (let wx = x + 2; wx < x + w - 3; wx += 5) {
      fill(ctx, glass, wx, y, 3, 3);
      if (random() < 0.5) fill(glow, random() < 0.85 ? 'a' : 'f', wx, y, 3, 3);
    }
    if (balconies) fill(ctx, '6', x, y + 3, w, 1);
  }
}

/** A filled half-circle dome. */
function dome(ctx: G, cx: number, base: number, r: number, colour: ColourKey, shine: ColourKey): void {
  for (let y = -r; y <= 0; y++) {
    const half = Math.round(Math.sqrt(r * r - y * y));
    fill(ctx, colour, cx - half, base + y, half * 2 + 1, 1);
  }
  fill(ctx, shine, cx - Math.round(r / 2), base - r + 2, 2, Math.max(1, Math.round(r / 2)));
}

/** An onion dome with a little spike on top. */
function onion(ctx: G, cx: number, base: number, r: number, colour: ColourKey): void {
  for (let y = -r * 2; y <= 0; y++) {
    const t = (y + r * 2) / (r * 2); // 0 top → 1 base
    const half = Math.round(r * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (t < 0.35 ? t / 0.35 : 1));
    if (half > 0) fill(ctx, colour, cx - half, base + y, half * 2 + 1, 1);
  }
  fill(ctx, 'a', cx, base - r * 2 - 4, 1, 4);
}

/** A pointed (Moorish) arch opening. */
function pointedArch(ctx: G, x: number, top: number, w: number, bottom: number, colour: ColourKey): void {
  const half = w / 2;
  for (let y = top; y < bottom; y++) {
    const rise = y - top;
    const span = rise < half ? Math.round(Math.sqrt(Math.max(0, half * half - (half - rise) ** 2)) * 0.9 + rise * 0.1) : half;
    fill(ctx, colour, Math.round(x + half - span), y, Math.round(span * 2), 1);
  }
}

/** A roadside sign on a pole. */
function poleSign(ctx: G, glow: G, x: number, top: number, w: number, h: number, bg: ColourKey, text: string, textColour: ColourKey, poleBottom: number): void {
  fill(ctx, '6', x + Math.floor(w / 2) - 1, top + h, 3, poleBottom - top - h);
  fill(ctx, '0', x - 1, top - 1, w + 2, h + 2);
  fill(ctx, bg, x, top, w, h);
  fill(glow, bg, x, top, w, h);
  drawText(ctx, text, x + w / 2, top + Math.floor(h / 2) - 4, textColour, { align: 'center', scale: 0.75 });
  drawText(glow, text, x + w / 2, top + Math.floor(h / 2) - 4, textColour, { align: 'center', scale: 0.75 });
}

const DRAWINGS: Record<LandmarkId, { w: number; h: number; draw: Draw }> = {
  /** PJ mosque: white prayer hall, big blue dome with small domes, one tall minaret. */
  pjMosque: {
    w: 150,
    h: 120,
    draw: (ctx, glow, _w, h) => {
      const base = h;
      fill(ctx, '0', 9, base - 46, 112, 46);
      fill(ctx, '7', 10, base - 45, 110, 45);
      fill(ctx, 'c', 10, base - 45, 110, 3); // trim
      for (let x = 16; x < 112; x += 16) {
        pointedArch(ctx, x, base - 34, 10, base - 6, '1');
        pointedArch(glow, x, base - 34, 10, base - 6, 'f');
      }
      dome(ctx, 65, base - 45, 27, '0', '0'); // outline
      dome(ctx, 65, base - 45, 26, '1', 'c');
      fill(ctx, 'a', 65, base - 78, 1, 8); // gold finial
      fill(ctx, 'a', 63, base - 80, 5, 2);
      dome(ctx, 26, base - 45, 10, '0', '0');
      dome(ctx, 26, base - 45, 9, '1', 'c');
      dome(ctx, 104, base - 45, 10, '0', '0');
      dome(ctx, 104, base - 45, 9, '1', 'c');
      // minaret
      fill(ctx, '0', 129, 6, 12, base - 6);
      fill(ctx, '7', 130, 8, 10, base - 8);
      for (let y = 30; y < base; y += 22) fill(ctx, 'c', 128, y, 14, 2);
      fill(ctx, '6', 133, 14, 4, 6);
      fill(glow, 'a', 133, 14, 4, 6);
      onion(ctx, 135, 8, 6, '1');
    },
  },

  /** Ryan & Miho: three long blocks stretched along the main road, joined by link bridges. */
  ryanMiho: {
    w: 240,
    h: 150,
    draw: (ctx, glow, _w, h) => {
      tower(ctx, glow, 4, 18, 70, h, '7', 'j', 31, true);
      tower(ctx, glow, 86, 8, 70, h, '6', 'j', 32, true);
      tower(ctx, glow, 168, 26, 68, h, '7', 'j', 33, true);
      for (const [x, y] of [[74, h - 60], [156, h - 50]] as const) {
        fill(ctx, '0', x, y, 12, 7);
        fill(ctx, 'c', x, y + 1, 12, 5); // link bridges
        fill(glow, 'c', x, y + 1, 12, 5);
      }
      for (const [x, y, bw] of [[4, 18, 70], [86, 8, 70], [168, 26, 68]] as const) fill(ctx, '8', x, y, bw, 3); // accent band
    },
  },

  /** Five Stones: five towers of different heights around a garden. */
  fiveStones: {
    w: 170,
    h: 175,
    draw: (ctx, glow, _w, h) => {
      const blocks: Array<[number, number, number]> = [
        [4, 32, 70], // x, width, height
        [38, 30, 170],
        [72, 30, 120],
        [106, 30, 160],
        [140, 26, 26],
      ];
      blocks.forEach(([x, bw, bh], i) => tower(ctx, glow, x, h - bh, bw, h, i % 2 ? 'f' : '7', '1', 50 + i, true));
      for (let i = 0; i < 5; i++) fill(ctx, '3', 8 + i * 32, h - 6, 14, 6); // garden
      // five grey stones
      for (let i = 0; i < 5; i++) fill(ctx, 'h', 12 + i * 32, h - 5, 5, 4);
    },
  },

  /** PJ Midtown: twin towers with purple side stripes, over a car park podium draped in green leaves. */
  pjMidtown: {
    w: 140,
    h: 165,
    draw: (ctx, glow, w, h) => {
      // car park podium with hanging greenery
      fill(ctx, '0', 0, h - 41, w, 41);
      fill(ctx, 'h', 1, h - 40, w - 2, 40);
      for (let y = h - 36; y < h - 2; y += 8) fill(ctx, '5', 1, y, w - 2, 3); // car park decks
      const random = seededRandom(64);
      for (let x = 2; x < w - 2; x += 3) {
        const drop = 8 + Math.floor(random() * 26);
        fill(ctx, random() < 0.5 ? '3' : 'b', x, h - 40, 2, drop); // leaves trailing down
      }
      // towers with purple vertical lines down the sides
      for (const x of [10, 80]) {
        tower(ctx, glow, x, 8, 48, h - 40, '7', 'c', 61 + x);
        fill(ctx, '2', x, 8, 3, h - 48);
        fill(ctx, '2', x + 45, 8, 3, h - 48);
        fill(ctx, 'd', x + 1, 8, 1, h - 48);
        fill(ctx, 'd', x + 46, 8, 1, h - 48);
      }
    },
  },

  /** Centrestage: serviced-suite tower over shops with a bold signature frame. */
  centrestage: {
    w: 110,
    h: 140,
    draw: (ctx, glow, w, h) => {
      fill(ctx, '0', 0, h - 25, w, 25);
      fill(ctx, '2', 1, h - 24, w - 2, 24); // retail podium
      for (let x = 5; x < w - 8; x += 12) {
        fill(ctx, 'f', x, h - 18, 9, 12);
        fill(glow, 'a', x, h - 18, 9, 12);
      }
      tower(ctx, glow, 18, 20, 62, h - 24, '6', 'j', 71);
      fill(ctx, '8', 14, 14, 4, h - 38); // red frame
      fill(ctx, '8', 14, 14, 70, 4);
      drawText(ctx, 'CENTRESTAGE', w / 2, h - 23 + 1, '7', { align: 'center', scale: 0.5 });
      drawText(glow, 'CENTRESTAGE', w / 2, h - 23 + 1, '7', { align: 'center', scale: 0.5 });
    },
  },

  /** Jaya Shopping Centre: a modern mall block with a big glass front and signage. */
  jayaShopping: {
    w: 150,
    h: 90,
    draw: (ctx, glow, w, h) => {
      fill(ctx, '0', 0, h - 80, w, 80);
      fill(ctx, '6', 1, h - 79, w - 2, 79);
      fill(ctx, 'j', 20, h - 70, w - 40, 50); // glass front
      for (let x = 24; x < w - 22; x += 10) fill(ctx, 'c', x, h - 70, 1, 50);
      fill(glow, 'f', 20, h - 70, w - 40, 50);
      fill(ctx, '8', 0, h - 80, w, 8);
      drawText(ctx, 'JAYA SHOPPING', w / 2, h - 79, '7', { align: 'center', scale: 0.75 });
      drawText(glow, 'JAYA SHOPPING', w / 2, h - 79, '7', { align: 'center', scale: 0.75 });
      fill(ctx, '1', 60, h - 18, 30, 18); // entrance
    },
  },

  /** Jaya One: low blocks with shops, and The School's colourful facade. */
  jayaOne: {
    w: 170,
    h: 70,
    draw: (ctx, glow, _w, h) => {
      // The School: colourful block
      const colours: ColourKey[] = ['8', 'a', 'b', 'c', '9', 'e'];
      fill(ctx, '0', 0, h - 56, 72, 56);
      for (let y = 0; y < 6; y++)
        for (let x = 0; x < 7; x++) fill(ctx, colours[(x + y) % colours.length] as ColourKey, 1 + x * 10, h - 55 + y * 9, 9, 8);
      drawText(ctx, 'THE SCHOOL', 36, h - 66, '0', { align: 'center', scale: 0.5 });
      // office blocks with shops below
      for (const x of [80, 126]) {
        tower(ctx, glow, x, h - 50, 40, h - 12, 'f', '1', x);
        fill(ctx, '4', x - 1, h - 12, 42, 3);
        fill(ctx, '1', x, h - 9, 40, 9);
        fill(glow, 'a', x + 2, h - 8, 36, 6);
      }
      poleSign(ctx, glow, 92, h - 68, 60, 12, '3', 'JAYA ONE', '7', h - 50);
    },
  },

  /** Atria: dark-glass twin towers on a glass retail podium. */
  atria: {
    w: 150,
    h: 130,
    draw: (ctx, glow, w, h) => {
      fill(ctx, '0', 0, h - 41, w, 41);
      fill(ctx, 'j', 1, h - 40, w - 2, 40); // glass podium
      for (let y = h - 36; y < h - 4; y += 8) fill(ctx, 'c', 1, y, w - 2, 1);
      fill(glow, 'f', 2, h - 36, w - 4, 28);
      fill(ctx, '7', 1, h - 40, w - 2, 4);
      drawText(ctx, 'ATRIA', w / 2, h - 40, '1', { align: 'center', scale: 0.75 });
      for (const x of [12, 92]) {
        tower(ctx, glow, x, h - 125, 46, h - 40, '1', 'g', 80 + x); // dark twin towers
        fill(ctx, 'j', x + 2, h - 123, 2, 80); // glass sheen
      }
    },
  },

  /** SMK Damansara Jaya: cream school blocks with blue trim, corridors and a field. */
  smdj: {
    w: 170,
    h: 64,
    draw: (ctx, glow, w, h) => {
      for (const [x, bw, floors] of [[0, 90, 3], [96, 74, 2]] as const) {
        const top = h - 10 - floors * 15;
        fill(ctx, '0', x, top - 4, bw, floors * 15 + 4);
        fill(ctx, 'f', x + 1, top - 3, bw - 2, floors * 15 + 3);
        fill(ctx, '1', x, top - 4, bw, 3); // blue roof edge
        for (let f = 0; f < floors; f++) {
          const y = top + f * 15;
          fill(ctx, 'c', x + 1, y + 11, bw - 2, 2); // corridor rail
          for (let wx = x + 4; wx < x + bw - 8; wx += 10) {
            fill(ctx, '1', wx, y + 2, 7, 7);
            if ((wx + f) % 3 === 0) fill(glow, 'f', wx, y + 2, 7, 7);
          }
        }
      }
      fill(ctx, 'b', 0, h - 10, w, 10); // school field
      fill(ctx, '7', 10, h - 6, 40, 1);
      // gate sign
      fill(ctx, '1', 60, h - 22, 70, 10);
      drawText(ctx, 'SMK DAMANSARA JAYA', 95, h - 20, '7', { align: 'center', scale: 0.5 });
    },
  },

  /** "Mekdi": a red-and-yellow burger joint (a look-alike, no real logo). */
  mekdi: {
    w: 90,
    h: 70,
    draw: (ctx, glow, _w, h) => {
      fill(ctx, '0', 4, h - 30, 70, 30);
      fill(ctx, '8', 5, h - 29, 68, 29);
      fill(ctx, 'a', 5, h - 29, 68, 4);
      fill(ctx, 'f', 10, h - 20, 50, 14);
      fill(glow, 'f', 10, h - 20, 50, 14);
      poleSign(ctx, glow, 60, 2, 28, 22, '8', 'MEKDI', 'a', h);
    },
  },

  /** "Burger Raja": a burger place with a crown sign (a look-alike, no real logo). */
  burgerRaja: {
    w: 100,
    h: 70,
    draw: (ctx, glow, _w, h) => {
      fill(ctx, '0', 4, h - 30, 74, 30);
      fill(ctx, '9', 5, h - 29, 72, 29);
      fill(ctx, '4', 5, h - 29, 72, 4);
      fill(ctx, '1', 10, h - 20, 56, 14);
      fill(glow, 'f', 10, h - 20, 56, 14);
      poleSign(ctx, glow, 58, 4, 40, 18, '1', 'B.RAJA', '9', h);
      for (const x of [68, 75, 82]) fill(ctx, 'a', x, 0, 3, 4); // crown points
      fill(ctx, 'a', 66, 3, 20, 2);
    },
  },

  /** "A&Wah": an orange drive-in with a root-beer mug sign (a look-alike). */
  aAndWah: {
    w: 100,
    h: 70,
    draw: (ctx, glow, _w, h) => {
      fill(ctx, '0', 4, h - 26, 70, 26);
      fill(ctx, '9', 5, h - 25, 68, 25);
      // drive-in canopy
      fill(ctx, '8', 0, h - 34, 80, 6);
      for (let x = 2; x < 80; x += 8) fill(ctx, '7', x, h - 34, 4, 6);
      fill(ctx, '4', 10, h - 18, 50, 12);
      fill(glow, 'f', 10, h - 18, 50, 12);
      poleSign(ctx, glow, 62, 6, 36, 18, '9', 'A&WAH', '4', h);
      // root-beer mug
      fill(ctx, '4', 86, 28, 8, 10);
      fill(ctx, '7', 86, 26, 8, 3);
      fill(ctx, '7', 94, 30, 2, 5);
    },
  },

  /** "Petrol-Lah": a petrol station with a blue-and-red canopy (a look-alike). */
  petrolLah: {
    w: 130,
    h: 70,
    draw: (ctx, glow, _w, h) => {
      fill(ctx, '0', 0, h - 46, 100, 9);
      fill(ctx, '1', 1, h - 45, 98, 7); // canopy
      fill(ctx, '8', 1, h - 40, 98, 2);
      fill(glow, '7', 4, h - 38, 92, 1); // canopy lights
      for (const x of [14, 50, 84]) fill(ctx, '6', x, h - 37, 3, 37);
      for (const x of [26, 64]) {
        fill(ctx, '0', x - 1, h - 17, 10, 17);
        fill(ctx, '7', x, h - 16, 8, 16); // pumps
        fill(ctx, '8', x, h - 16, 8, 3);
      }
      poleSign(ctx, glow, 104, 4, 24, 40, '1', 'P', 'a', h);
      drawText(ctx, '2.05', 116, 30, 'a', { align: 'center', scale: 0.5 });
      drawText(glow, '2.05', 116, 30, 'a', { align: 'center', scale: 0.5 });
      drawText(ctx, 'PETROL-LAH', 50, h - 44, '7', { align: 'center', scale: 0.5 });
    },
  },

  /** Kota Darul Ehsan: the Moorish arch over the Federal Highway (Selangor → KL). */
  fedHighwayArch: {
    w: 260,
    h: 170,
    draw: (ctx, glow, w, h) => {
      const wall: ColourKey = '7';
      fill(ctx, '0', 9, 39, w - 18, h - 39);
      fill(ctx, wall, 10, 40, w - 20, h - 40);
      // twin pointed arches in the middle, small side arches
      pointedArch(ctx, 50, 66, 70, h, '1');
      pointedArch(ctx, 140, 66, 70, h, '1');
      pointedArch(ctx, 16, 96, 26, h, '1');
      pointedArch(ctx, 218, 96, 26, h, '1');
      // decorative bands
      fill(ctx, 'a', 10, 46, w - 20, 3);
      for (let x = 14; x < w - 14; x += 8) fill(ctx, '9', x, 52, 4, 4);
      fill(ctx, 'a', 10, 58, w - 20, 2);
      // domes and chatris on top
      onion(ctx, 30, 40, 10, 'a');
      onion(ctx, 230, 40, 10, 'a');
      onion(ctx, 130, 40, 14, 'a');
      for (const x of [80, 180]) {
        fill(ctx, wall, x - 8, 26, 16, 14);
        fill(ctx, '1', x - 5, 30, 4, 10);
        fill(ctx, '1', x + 1, 30, 4, 10);
        onion(ctx, x, 26, 8, 'a');
      }
      drawText(ctx, 'KUALA LUMPUR', w / 2, 41, '1', { align: 'center', scale: 0.75 });
      // floodlights at dusk
      fill(glow, 'a', 10, 46, w - 20, 3);
      fill(glow, 'a', 10, 58, w - 20, 2);
      // cannons at the base
      for (const x of [44, 196]) {
        fill(ctx, '0', x, h - 6, 20, 5);
        fill(ctx, '0', x + 16, h - 9, 8, 3);
      }
    },
  },
  /** Masjid Bulat (Tun Abdul Aziz Mosque, Section 14): a round 1970s mosque under a folded, umbrella-like roof. */
  masjidBulat: {
    w: 150,
    h: 110,
    draw: (ctx, glow, _w, h) => {
      // round prayer hall: a drum with columns
      fill(ctx, '0', 14, h - 40, 102, 40);
      fill(ctx, '7', 15, h - 39, 100, 39);
      for (let x = 20; x < 112; x += 9) {
        fill(ctx, '6', x, h - 39, 2, 39);
        fill(ctx, 'j', x + 3, h - 30, 4, 18);
        fill(glow, 'f', x + 3, h - 30, 4, 18);
      }
      // folded-plate roof: zigzag umbrella rising to a point
      for (let y = 0; y < 30; y++) {
        const half = Math.round(56 - y * 1.7);
        fill(ctx, '3', 65 - half, h - 40 - y, half * 2, 1);
      }
      for (let x = 12; x < 120; x += 10) fill(ctx, 'b', x, h - 42, 5, 2); // folds
      for (let k = -4; k <= 4; k++) fill(ctx, 'b', 65 + k * 11, h - 40 - Math.round(20 - Math.abs(k) * 4), 1, Math.round(20 - Math.abs(k) * 4));
      fill(ctx, 'a', 65, h - 82, 1, 12); // spire
      // single minaret
      fill(ctx, '0', 129, 10, 12, h - 10);
      fill(ctx, '7', 130, 11, 10, h - 11);
      for (let y = 26; y < h; y += 20) fill(ctx, '3', 128, y, 14, 2);
      fill(ctx, '3', 127, 4, 16, 7);
      fill(ctx, 'a', 135, 0, 1, 4);
      fill(glow, 'a', 131, 16, 8, 4);
    },
  },

  /** One City (USJ 25), home of Kingdomcity: a curved glass mall block with the church's sign. */
  kingdomcity: {
    w: 170,
    h: 110,
    draw: (ctx, glow, w, h) => {
      fill(ctx, '0', 0, h - 70, w, 70);
      fill(ctx, '6', 1, h - 69, w - 2, 69);
      // curved glass front
      for (let y = 0; y < 50; y++) {
        const bulge = Math.round(Math.sin((y / 50) * Math.PI) * 10);
        fill(ctx, 'j', 30 - bulge, h - 62 + y, w - 60 + bulge * 2, 1);
      }
      for (let x = 26; x < w - 26; x += 10) fill(ctx, 'c', x, h - 62, 1, 50);
      fill(glow, 'f', 30, h - 60, w - 60, 46);
      // tower behind
      tower(ctx, glow, 120, h - 108, 40, h - 70, '7', 'j', 91);
      fill(ctx, '1', 10, h - 80, 110, 12);
      drawText(ctx, 'KINGDOMCITY', 65, h - 77, '7', { align: 'center', scale: 0.75 });
      drawText(glow, 'KINGDOMCITY', 65, h - 77, 'a', { align: 'center', scale: 0.75 });
      drawText(ctx, 'ONE CITY', w / 2, h - 10, '1', { align: 'center', scale: 0.5 });
    },
  },

  /** "Maryott" (Phileo Damansara): an 18-storey hotel tower with a crown sign (a look-alike, no real logo). */
  maryott: {
    w: 100,
    h: 140,
    draw: (ctx, glow, w, h) => {
      tower(ctx, glow, 14, 22, 72, h - 14, 'f', 'j', 101);
      fill(ctx, '0', 4, h - 15, w - 8, 15);
      fill(ctx, '4', 5, h - 14, w - 10, 14); // hotel lobby
      fill(ctx, 'a', 30, h - 10, 40, 10);
      fill(glow, 'a', 30, h - 10, 40, 10);
      fill(ctx, '2', 14, 10, 72, 12); // crown sign
      drawText(ctx, 'MARYOTT', w / 2, 12, '7', { align: 'center', scale: 0.75 });
      drawText(glow, 'MARYOTT', w / 2, 12, 'f', { align: 'center', scale: 0.75 });
    },
  },

  /** Menara Star (Section 16): the newspaper's office tower. */
  menaraStar: {
    w: 100,
    h: 120,
    draw: (ctx, glow, w, h) => {
      tower(ctx, glow, 14, 20, 72, h, '6', '1', 111);
      fill(ctx, '0', 14, 6, 72, 14);
      fill(ctx, '1', 15, 7, 70, 12);
      drawText(ctx, 'MENARA STAR', w / 2, 9, 'a', { align: 'center', scale: 0.5 });
      drawText(glow, 'MENARA STAR', w / 2, 9, 'a', { align: 'center', scale: 0.5 });
    },
  },

  /** Sin Chew (Jalan Semangat, Section 13): the Chinese daily's office and press building. */
  sinChew: {
    w: 140,
    h: 80,
    draw: (ctx, glow, _w, h) => {
      tower(ctx, glow, 6, h - 74, 60, h, '7', 'j', 121); // office block
      fill(ctx, '0', 64, h - 40, 72, 40);
      fill(ctx, 'h', 65, h - 39, 70, 39); // printing plant
      for (let x = 68; x < 132; x += 12) {
        for (let r = 0; r < 6; r++) fill(ctx, '6', x + r, h - 46 + r, 12 - r, 1); // saw-tooth roof
      }
      fill(ctx, '5', 80, h - 20, 40, 20);
      fill(ctx, '8', 6, h - 80, 60, 9);
      drawText(ctx, 'SIN CHEW', 36, h - 79, '7', { align: 'center', scale: 0.5 });
      drawText(glow, 'SIN CHEW', 36, h - 79, '7', { align: 'center', scale: 0.5 });
    },
  },
};

const cache = new Map<LandmarkId, Strip>();

/** The landmark's picture (and dusk lights), drawn once and reused. */
export function landmarkImage(id: LandmarkId): Strip {
  let art = cache.get(id);
  if (!art) {
    const d = DRAWINGS[id];
    const [image, ctx] = makeCanvas(d.w, d.h);
    const [lights, glow] = makeCanvas(d.w, d.h);
    d.draw(ctx, glow, d.w, d.h);
    art = { image, lights };
    cache.set(id, art);
  }
  return art;
}

export const LANDMARK_IDS = Object.keys(DRAWINGS) as LandmarkId[];
