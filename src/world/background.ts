import { ANIMATION } from '../config/game';
import type { Scenery } from '../config/scenery';
import { CLOUD } from '../config/sprites';
import { THEME } from '../config/theme';
import { SKIES, type TimeId } from '../config/weather';
import { groundPx } from './lanes';
import { ART_HEIGHT, ART_WIDTH, drawSprite, fill, makeCanvas, seededRandom, toPx } from './pixels';
import { buildingsStrip, roadsideStrip, type Strip } from './scenery';

/**
 * Sky, clouds, the distant city skyline, then the level's buildings and
 * roadside (see scenery.ts). Layers further away scroll slower than the
 * road (parallax), which gives a sense of depth.
 */

const PARALLAX = { clouds: 0.06, far: 0.12, buildings: 0.3, roadside: 0.5 };
const FAR_HEIGHT = 150; // tallest distant towers

// 2×2 ordered dither: which pixels switch colour first as the sky fades.
const BAYER = [
  [0, 2],
  [3, 1],
];

const skies = new Map<TimeId, HTMLCanvasElement>();
let far: Strip | null = null;

/** Sky for a time of day: three colours dithered top to horizon (plus stars at night). */
function buildSky(time: TimeId): HTMLCanvasElement {
  const { top, middle, horizon } = SKIES[time];
  const { fadeStart, fadeEnd } = THEME.sky;
  const [canvas, ctx] = makeCanvas(ART_WIDTH, ART_HEIGHT);
  fill(ctx, top, 0, 0, ART_WIDTH, ART_HEIGHT);
  const band = (from: number, to: number, colour: typeof top): void => {
    for (let y = from; y < ART_HEIGHT; y++) {
      const amount = Math.min((y - from) / Math.max(to - from, 1), 1) * 4;
      for (let x = 0; x < ART_WIDTH; x++) if ((BAYER[y % 2]?.[x % 2] ?? 0) < amount) fill(ctx, colour, x, y, 1, 1);
    }
  };
  if (middle !== top) band(fadeStart - 60, fadeStart, middle);
  band(fadeStart, fadeEnd, horizon);
  if (time === 'night') {
    const random = seededRandom(5);
    for (let i = 0; i < 90; i++) fill(ctx, random() < 0.8 ? '7' : 'a', Math.floor(random() * ART_WIDTH), Math.floor(random() * 120), 1, 1);
    // moon
    for (let y = -9; y <= 9; y++) {
      const half = Math.round(Math.sqrt(81 - y * y));
      fill(ctx, 'f', 540 - half, 50 + y, half * 2, 1);
    }
    fill(ctx, '6', 536, 46, 3, 3);
    fill(ctx, '6', 543, 54, 2, 2);
  }
  if (time === 'sunset') {
    for (let y = -16; y <= 16; y++) {
      const half = Math.round(Math.sqrt(256 - y * y));
      fill(ctx, y < 4 ? 'a' : '9', 470 - half, 150 + y, half * 2, 1); // low sun
    }
  }
  return canvas;
}

/** Distant towers: flat colour with windows (lit at night). */
function buildFarSkyline(): Strip {
  const { body, windows } = THEME.farBuildings;
  const [image, ctx] = makeCanvas(ART_WIDTH, FAR_HEIGHT);
  const [lights, glow] = makeCanvas(ART_WIDTH, FAR_HEIGHT);
  const random = seededRandom(7);
  let x = 0;
  while (x < ART_WIDTH) {
    const w = 22 + Math.floor(random() * 34);
    const h = 40 + Math.floor(random() * (FAR_HEIGHT - 50));
    const top = FAR_HEIGHT - h;
    fill(ctx, body, x, top, w - 2, h);
    if (random() < 0.4) fill(ctx, body, x + 4, top - 6, w - 10, 6);
    if (random() < 0.3) {
      fill(ctx, body, x + Math.floor(w / 2) - 1, top - 16, 2, 16);
      fill(glow, '8', x + Math.floor(w / 2) - 1, top - 16, 2, 2);
    }
    for (let wy = top + 5; wy < FAR_HEIGHT - 4; wy += 6) {
      for (let wx = x + 3; wx < x + w - 5; wx += 4) {
        if (random() < 0.5) fill(ctx, windows, wx, wy, 2, 3);
        if (random() < 0.3) fill(glow, 'a', wx, wy, 2, 3);
      }
    }
    x += w;
  }
  return { image, lights };
}

/** Draws a strip side by side so it scrolls forever without a gap. */
function drawLooping(ctx: CanvasRenderingContext2D, strip: HTMLCanvasElement, scroll: number, y: number): void {
  const offset = -(Math.floor(scroll) % strip.width);
  for (let x = offset; x < ART_WIDTH; x += strip.width) ctx.drawImage(strip, x, y);
}

// Where each layer was drawn this frame, so the night lights line up with it.
let layers: Array<{ strip: Strip; scroll: number; y: number }> = [];

export function drawBackground(ctx: CanvasRenderingContext2D, roadOffset: number, time: number, scenery: Scenery, timeOfDay: TimeId): void {
  let sky = skies.get(timeOfDay);
  if (!sky) skies.set(timeOfDay, (sky = buildSky(timeOfDay)));
  far ??= buildFarSkyline();
  ctx.drawImage(sky, 0, 0);
  const ground = groundPx(); // moves up when the road has more lanes

  // Clouds (not at night)
  if (timeOfDay !== 'night') {
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
  }

  const buildings = buildingsStrip(scenery.buildings);
  const roadside = roadsideStrip(scenery.roadside);
  layers = [
    { strip: far, scroll: toPx(roadOffset) * PARALLAX.far, y: ground - FAR_HEIGHT - 20 },
    { strip: buildings, scroll: toPx(roadOffset) * PARALLAX.buildings, y: ground - buildings.image.height - 8 },
    { strip: roadside, scroll: toPx(roadOffset) * PARALLAX.roadside, y: ground - roadside.image.height },
  ];
  for (const l of layers) drawLooping(ctx, l.strip.image, l.scroll, l.y);
}

/** At night: windows, signs and lamps, drawn on top of the darkened scene. */
export function drawBackgroundLights(ctx: CanvasRenderingContext2D): void {
  for (const l of layers) drawLooping(ctx, l.strip.lights, l.scroll, l.y);
}
