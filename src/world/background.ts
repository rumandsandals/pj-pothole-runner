import { ANIMATION } from '../config/game';
import { CLOUD, PALM } from '../config/sprites';
import { THEME, type ColourKey } from '../config/theme';
import { ART_GROUND, ART_WIDTH, drawSprite, fill, makeCanvas, seededRandom, toPx } from './pixels';

/**
 * Sky, clouds, city skyline, a row of PJ shophouses and roadside palms.
 * Layers further away scroll slower than the road (parallax), which gives
 * a sense of depth.
 */

const PARALLAX = { clouds: 0.06, far: 0.12, shops: 0.3, near: 0.5 };
const FAR_HEIGHT = 150; // tallest towers
const SHOP_HEIGHT = 64;
const SHOP_WIDTH = 720;
const NEAR_HEIGHT = 46;
const NEAR_WIDTH = 760;

// 2×2 ordered dither: which pixels switch colour first as the sky fades.
const BAYER = [
  [0, 2],
  [3, 1],
];

let sky: HTMLCanvasElement | null = null;
let far: HTMLCanvasElement | null = null;
let shops: HTMLCanvasElement | null = null;
let near: HTMLCanvasElement | null = null;

function buildSky(): HTMLCanvasElement {
  const { top, horizon, fadeStart, fadeEnd } = THEME.sky;
  const [canvas, ctx] = makeCanvas(ART_WIDTH, ART_GROUND);
  fill(ctx, top, 0, 0, ART_WIDTH, ART_GROUND);
  for (let y = fadeStart; y < ART_GROUND; y++) {
    const amount = Math.min((y - fadeStart) / Math.max(fadeEnd - fadeStart, 1), 1) * 4;
    for (let x = 0; x < ART_WIDTH; x++) {
      if ((BAYER[y % 2]?.[x % 2] ?? 0) < amount) fill(ctx, horizon, x, y, 1, 1);
    }
  }
  return canvas;
}

/** Distant towers: flat colour with lit windows, a few antennas and stepped tops. */
function buildFarSkyline(): HTMLCanvasElement {
  const { body, windows } = THEME.farBuildings;
  const [canvas, ctx] = makeCanvas(ART_WIDTH, FAR_HEIGHT);
  const random = seededRandom(7);
  let x = 0;
  while (x < ART_WIDTH) {
    const w = 22 + Math.floor(random() * 34);
    const h = 40 + Math.floor(random() * (FAR_HEIGHT - 50));
    const top = FAR_HEIGHT - h;
    fill(ctx, body, x, top, w - 2, h);
    if (random() < 0.4) fill(ctx, body, x + 4, top - 6, w - 10, 6); // stepped crown
    if (random() < 0.3) fill(ctx, body, x + Math.floor(w / 2) - 1, top - 16, 2, 16); // antenna
    for (let wy = top + 5; wy < FAR_HEIGHT - 4; wy += 6) {
      for (let wx = x + 3; wx < x + w - 5; wx += 4) {
        if (random() < 0.5) fill(ctx, windows, wx, wy, 2, 3);
      }
    }
    x += w;
  }
  return canvas;
}

/** Two-storey shophouses in pastel colours, with windows, awnings and signboards. */
function buildShophouses(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SHOP_WIDTH, SHOP_HEIGHT);
  const random = seededRandom(11);
  const walls: ColourKey[] = ['f', 'e', '9', '6', 'c', 'b'];
  const signs: ColourKey[] = ['8', '1', '3', '2', 'a'];
  let x = 0;
  while (x < SHOP_WIDTH) {
    const blocks = 3 + Math.floor(random() * 4); // a terrace of 3-6 units
    const h = 46 + Math.floor(random() * 14);
    const top = SHOP_HEIGHT - h;
    for (let b = 0; b < blocks && x < SHOP_WIDTH; b++) {
      const w = 28;
      const wall = walls[Math.floor(random() * walls.length)] ?? 'f';
      fill(ctx, '0', x, top - 1, w, h + 1); // outline
      fill(ctx, wall, x + 1, top, w - 2, h);
      fill(ctx, '5', x + 1, top, w - 2, 2); // roof edge
      // upstairs windows
      for (const wx of [x + 4, x + 16]) {
        fill(ctx, '1', wx, top + 6, 8, 10);
        fill(ctx, '6', wx + 3, top + 6, 1, 10);
      }
      // signboard
      fill(ctx, signs[Math.floor(random() * signs.length)] ?? '8', x + 2, top + 20, w - 4, 6);
      fill(ctx, '7', x + 5, top + 22, w - 10, 1);
      // awning and five-foot way
      fill(ctx, '4', x, top + 27, w, 3);
      fill(ctx, '2', x + 1, top + 30, w - 2, h - 30);
      fill(ctx, '1', x + 6, top + 33, w - 12, h - 33); // shopfront
      fill(ctx, wall, x + 1, top + 30, 2, h - 30); // pillars
      fill(ctx, wall, x + w - 3, top + 30, 2, h - 30);
      x += w;
    }
    x += 10 + Math.floor(random() * 30); // gap between terraces
  }
  return canvas;
}

function buildNearRow(): HTMLCanvasElement {
  const { dark, light } = THEME.bushes;
  const [canvas, ctx] = makeCanvas(NEAR_WIDTH, NEAR_HEIGHT);
  const random = seededRandom(21);
  const palmH = PALM.length;
  let x = 10;
  while (x < NEAR_WIDTH - 30) {
    drawSprite(ctx, PALM, x, NEAR_HEIGHT - palmH);
    x += 80 + Math.floor(random() * 130);
  }
  // Hedge along the roadside
  for (let bx = 0; bx < NEAR_WIDTH; bx += 8) {
    const h = 5 + Math.floor(random() * 5);
    fill(ctx, dark, bx, NEAR_HEIGHT - h, 8, h);
    fill(ctx, light, bx + 2, NEAR_HEIGHT - h, 3, 1);
    fill(ctx, light, bx + 1, NEAR_HEIGHT - h + 1, 1, 1);
    fill(ctx, '0', bx, NEAR_HEIGHT - 1, 8, 1);
  }
  return canvas;
}

/** Draws a strip twice side by side so it scrolls forever without a gap. */
function drawLooping(ctx: CanvasRenderingContext2D, strip: HTMLCanvasElement, scroll: number, y: number): void {
  const offset = -(Math.floor(scroll) % strip.width);
  for (let x = offset; x < ART_WIDTH; x += strip.width) ctx.drawImage(strip, x, y);
}

export function drawBackground(ctx: CanvasRenderingContext2D, roadOffset: number, time: number): void {
  sky ??= buildSky();
  far ??= buildFarSkyline();
  shops ??= buildShophouses();
  near ??= buildNearRow();

  ctx.drawImage(sky, 0, 0);

  // Clouds
  const cloudScroll = toPx(roadOffset) * PARALLAX.clouds + time * ANIMATION.cloudDrift;
  const cloudLoop = ART_WIDTH + 80;
  for (const [cx, cy] of [
    [60, 16],
    [300, 40],
    [500, 10],
    [680, 60],
  ] as const) {
    const x = ((((cx - cloudScroll) % cloudLoop) + cloudLoop) % cloudLoop) - 40;
    drawSprite(ctx, CLOUD, x, cy, {});
  }

  drawLooping(ctx, far, toPx(roadOffset) * PARALLAX.far, ART_GROUND - FAR_HEIGHT - 20);
  drawLooping(ctx, shops, toPx(roadOffset) * PARALLAX.shops, ART_GROUND - SHOP_HEIGHT - 8);
  drawLooping(ctx, near, toPx(roadOffset) * PARALLAX.near, ART_GROUND - NEAR_HEIGHT);
}
