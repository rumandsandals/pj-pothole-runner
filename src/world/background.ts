import { CLOUD_SPRITE, PALM_SPRITE } from '../config/sprites';
import { THEME } from '../config/theme';
import { ART_GROUND, ART_WIDTH, drawSprite, fill, makeCanvas, seededRandom, toPx } from './pixels';

/**
 * Sky, clouds, city skyline and roadside palms. Layers further away scroll
 * slower than the road (parallax), which gives a sense of depth.
 */

const PARALLAX = { clouds: 0.06, far: 0.18, near: 0.5 };
const FAR_HEIGHT = 42;
const NEAR_HEIGHT = 20;
const NEAR_WIDTH = 480;

// 2×2 ordered dither: which pixels switch colour first as the sky fades.
const BAYER = [
  [0, 2],
  [3, 1],
];

let sky: HTMLCanvasElement | null = null;
let far: HTMLCanvasElement | null = null;
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

function buildFarSkyline(): HTMLCanvasElement {
  const { body, windows } = THEME.farBuildings;
  const [canvas, ctx] = makeCanvas(ART_WIDTH, FAR_HEIGHT);
  const random = seededRandom(7);
  let x = 0;
  while (x < ART_WIDTH) {
    const w = 10 + Math.floor(random() * 16);
    const h = 12 + Math.floor(random() * (FAR_HEIGHT - 14));
    const top = FAR_HEIGHT - h;
    fill(ctx, body, x, top, w - 1, h);
    if (random() < 0.25) fill(ctx, body, x + Math.floor(w / 2) - 1, top - 4, 1, 4); // antenna
    for (let wy = top + 3; wy < FAR_HEIGHT - 2; wy += 4) {
      for (let wx = x + 2; wx < x + w - 3; wx += 3) {
        if (random() < 0.55) fill(ctx, windows, wx, wy, 1, 1);
      }
    }
    x += w;
  }
  return canvas;
}

function buildNearRow(): HTMLCanvasElement {
  const { dark, light } = THEME.bushes;
  const [canvas, ctx] = makeCanvas(NEAR_WIDTH, NEAR_HEIGHT);
  const random = seededRandom(21);
  let x = 6;
  while (x < NEAR_WIDTH - 16) {
    drawSprite(ctx, PALM_SPRITE, x, NEAR_HEIGHT - PALM_SPRITE.length);
    x += 40 + Math.floor(random() * 70);
  }
  // Hedge along the roadside
  for (let bx = 0; bx < NEAR_WIDTH; bx += 6) {
    const h = 2 + Math.floor(random() * 3);
    fill(ctx, dark, bx, NEAR_HEIGHT - h, 6, h);
    fill(ctx, light, bx + 1, NEAR_HEIGHT - h, 2, 1);
  }
  return canvas;
}

/** Draws a strip twice side by side so it scrolls forever without a gap. */
function drawLooping(ctx: CanvasRenderingContext2D, strip: HTMLCanvasElement, scroll: number, y: number): void {
  const offset = -(Math.floor(scroll) % strip.width);
  for (let x = offset; x < ART_WIDTH; x += strip.width) ctx.drawImage(strip, x, y);
}

export function drawBackground(ctx: CanvasRenderingContext2D, roadOffset: number): void {
  sky ??= buildSky();
  far ??= buildFarSkyline();
  near ??= buildNearRow();

  ctx.drawImage(sky, 0, 0);

  // Clouds
  const cloudScroll = toPx(roadOffset) * PARALLAX.clouds;
  const cloudLoop = ART_WIDTH + 40;
  for (const [cx, cy] of [
    [30, 8],
    [150, 18],
    [250, 5],
  ] as const) {
    const x = ((((cx - cloudScroll) % cloudLoop) + cloudLoop) % cloudLoop) - 20;
    drawSprite(ctx, CLOUD_SPRITE, x, cy, {});
  }

  drawLooping(ctx, far, toPx(roadOffset) * PARALLAX.far, ART_GROUND - FAR_HEIGHT);
  drawLooping(ctx, near, toPx(roadOffset) * PARALLAX.near, ART_GROUND - NEAR_HEIGHT);
}
