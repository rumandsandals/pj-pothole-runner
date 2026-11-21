import { PIXEL_SIZE, WORLD } from '../config/game';
import { PALETTE, type ColourKey } from '../config/theme';

/**
 * Pixel-art drawing helpers. Everything is drawn onto a small low-res
 * canvas (ART_WIDTH × ART_HEIGHT) in whole pixels, which is then blown up
 * to fill the screen without smoothing — that's what makes it look retro.
 */

export const ART_WIDTH = Math.round(WORLD.width / PIXEL_SIZE);
export const ART_HEIGHT = Math.round(WORLD.height / PIXEL_SIZE);

/** Converts game-world units to art pixels. */
export const toPx = (world: number): number => Math.round(world / PIXEL_SIZE);

export function fill(ctx: CanvasRenderingContext2D, key: ColourKey, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = PALETTE[key];
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot draw the game (no canvas support).');
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

/** Repeatable "random" numbers, so backgrounds look the same every game. */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ── Sprites ──────────────────────────────────────────────────
export type Swaps = Partial<Record<'X' | 'Y' | 'Z', ColourKey>>;

const spriteCache = new WeakMap<string[], Map<string, HTMLCanvasElement>>();

function bakeSprite(rows: string[], swaps: Swaps): HTMLCanvasElement {
  const width = Math.max(...rows.map((r) => r.length));
  const [canvas, ctx] = makeCanvas(width, rows.length);
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x] as string;
      if (ch === '.' || ch === ' ') continue;
      const key = (swaps[ch as keyof Swaps] ?? ch) as ColourKey;
      if (!(key in PALETTE)) continue;
      fill(ctx, key, x, y, 1, 1);
    }
  });
  return canvas;
}

export function spriteImage(rows: string[], swaps: Swaps = {}): HTMLCanvasElement {
  let bySwap = spriteCache.get(rows);
  if (!bySwap) spriteCache.set(rows, (bySwap = new Map()));
  const key = JSON.stringify(swaps);
  let image = bySwap.get(key);
  if (!image) bySwap.set(key, (image = bakeSprite(rows, swaps)));
  return image;
}

export function drawSprite(ctx: CanvasRenderingContext2D, rows: string[], x: number, y: number, swaps: Swaps = {}): void {
  ctx.drawImage(spriteImage(rows, swaps), Math.round(x), Math.round(y));
}

// ── Tiny 3×5 arcade font ─────────────────────────────────────
/** Every font dot is drawn this many art pixels wide (2 keeps text readable at 640×360). */
const FONT_ZOOM = 2;
// Each letter is 15 dots: 5 rows of 3, read left-to-right, top-to-bottom.
const GLYPHS: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
  '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010',
  '8': '111101111101111', '9': '111101111001110',
  '-': '000000111000000', '+': '000010111010000', '!': '010010010000010', '.': '000000000000010',
  ':': '000010000010000', '?': '110001010000010', '/': '001001010100100', '%': '101001010100101',
  ',': '000000000010100', "'": '010010000000000', ' ': '000000000000000',
  '>': '100010001010100', '<': '001010100010001',
};

export interface TextOptions {
  align?: 'left' | 'center' | 'right';
  scale?: number;
  shadow?: ColourKey | null;
}

export function textWidth(text: string, scale = 1): number {
  const s = scale * FONT_ZOOM;
  return text.length === 0 ? 0 : text.length * 4 * s - s;
}

/** Draws text in the tiny pixel font. Lower-case letters are shown as capitals. */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  key: ColourKey,
  { align = 'left', scale = 1, shadow = null }: TextOptions = {},
): void {
  const upper = text.toUpperCase();
  const width = textWidth(upper, scale);
  const left = Math.round(align === 'center' ? x - width / 2 : align === 'right' ? x - width : x);
  const top = Math.round(y);
  const s = scale * FONT_ZOOM;
  if (shadow) drawGlyphs(ctx, upper, left + s, top + s, shadow, s);
  drawGlyphs(ctx, upper, left, top, key, s);
}

function drawGlyphs(ctx: CanvasRenderingContext2D, text: string, left: number, top: number, key: ColourKey, scale: number): void {
  ctx.fillStyle = PALETTE[key];
  for (let i = 0; i < text.length; i++) {
    const glyph = GLYPHS[text[i] as string] ?? ''; // characters the font lacks (e.g. emoji) are left blank
    const gx = left + i * 4 * scale;
    for (let d = 0; d < 15; d++) {
      if (glyph[d] === '1') ctx.fillRect(gx + (d % 3) * scale, top + Math.floor(d / 3) * scale, scale, scale);
    }
  }
}
