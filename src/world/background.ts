import { ANIMATION } from '../config/game';
import { CLOUD, PALM } from '../config/sprites';
import { THEME, type ColourKey } from '../config/theme';
import { groundPx } from './lanes';
import { ART_HEIGHT, ART_WIDTH, drawSprite, drawText, fill, makeCanvas, seededRandom, toPx } from './pixels';

/**
 * Sky, clouds, city skyline, then either a row of PJ shophouses and palms
 * (town levels) or sound walls, lamp posts and road signs (highway levels).
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
let walls: HTMLCanvasElement | null = null;
let highwaySide: HTMLCanvasElement | null = null;

const WALL_HEIGHT = 40;
const WALL_WIDTH = 640;
const SIDE_HEIGHT = 70;
const SIDE_WIDTH = 900;

function buildSky(): HTMLCanvasElement {
  const { top, horizon, fadeStart, fadeEnd } = THEME.sky;
  const [canvas, ctx] = makeCanvas(ART_WIDTH, ART_HEIGHT);
  fill(ctx, top, 0, 0, ART_WIDTH, ART_HEIGHT);
  for (let y = fadeStart; y < ART_HEIGHT; y++) {
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

/** Highway sound-barrier walls: grey panels with a green cap. */
function buildWalls(): HTMLCanvasElement {
  const { panel, line, top } = THEME.highway.wall;
  const [canvas, ctx] = makeCanvas(WALL_WIDTH, WALL_HEIGHT);
  fill(ctx, top, 0, 0, WALL_WIDTH, 3);
  fill(ctx, panel, 0, 3, WALL_WIDTH, WALL_HEIGHT - 3);
  for (let x = 0; x < WALL_WIDTH; x += 32) {
    fill(ctx, '5', x, 3, 2, WALL_HEIGHT - 3); // posts
    for (let y = 9; y < WALL_HEIGHT; y += 8) fill(ctx, line, x + 3, y, 28, 1); // panel ribs
  }
  return canvas;
}

/** Highway roadside: lamp posts, green direction signs and a few palms. */
function buildHighwaySide(): HTMLCanvasElement {
  const { pole, light } = THEME.highway.lamp;
  const sign = THEME.highway.sign;
  const [canvas, ctx] = makeCanvas(SIDE_WIDTH, SIDE_HEIGHT);
  const ground = SIDE_HEIGHT;
  // Lamp posts with an arm reaching over the road
  for (let x = 40; x < SIDE_WIDTH; x += 150) {
    fill(ctx, pole, x, 8, 3, ground - 8);
    fill(ctx, pole, x, 8, 18, 2);
    fill(ctx, light, x + 14, 10, 6, 2);
    fill(ctx, '5', x - 2, ground - 3, 7, 3);
  }
  // Green direction signs
  const places = ['PJ 3 KM', 'KL 12 KM', 'SUBANG 8', 'SHAH ALAM'];
  places.forEach((text, i) => {
    const x = 100 + i * 220;
    fill(ctx, sign.post, x + 8, 30, 3, ground - 30);
    fill(ctx, sign.post, x + 66, 30, 3, ground - 30);
    fill(ctx, '0', x - 1, 7, 80, 26);
    fill(ctx, sign.board, x, 8, 78, 24);
    fill(ctx, sign.text, x + 2, 10, 74, 1);
    fill(ctx, sign.text, x + 2, 29, 74, 1);
    drawText(ctx, text, x + 39, 15, sign.text, { align: 'center' });
  });
  // A few palms in the verge
  for (const x of [10, 330, 610, 820]) drawSprite(ctx, PALM, x, ground - PALM.length);
  return canvas;
}

/** Draws a strip twice side by side so it scrolls forever without a gap. */
function drawLooping(ctx: CanvasRenderingContext2D, strip: HTMLCanvasElement, scroll: number, y: number): void {
  const offset = -(Math.floor(scroll) % strip.width);
  for (let x = offset; x < ART_WIDTH; x += strip.width) ctx.drawImage(strip, x, y);
}

export function drawBackground(ctx: CanvasRenderingContext2D, roadOffset: number, time: number, highway = false): void {
  sky ??= buildSky();
  far ??= buildFarSkyline();
  shops ??= buildShophouses();
  near ??= buildNearRow();

  ctx.drawImage(sky, 0, 0);
  const ground = groundPx(); // moves up when the road has more lanes

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

  drawLooping(ctx, far, toPx(roadOffset) * PARALLAX.far, ground - FAR_HEIGHT - 20);
  if (highway) {
    walls ??= buildWalls();
    highwaySide ??= buildHighwaySide();
    drawLooping(ctx, walls, toPx(roadOffset) * PARALLAX.shops, ground - WALL_HEIGHT - 10);
    drawLooping(ctx, highwaySide, toPx(roadOffset) * PARALLAX.near, ground - SIDE_HEIGHT);
    return;
  }
  drawLooping(ctx, shops, toPx(roadOffset) * PARALLAX.shops, ground - SHOP_HEIGHT - 8);
  drawLooping(ctx, near, toPx(roadOffset) * PARALLAX.near, ground - NEAR_HEIGHT);
}
