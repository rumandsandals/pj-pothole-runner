import { ANIMATION } from '../config/game';
import type { Scenery } from '../config/scenery';
import { CLOUD } from '../config/sprites';
import { THEME } from '../config/theme';
import { SKIES, type TimeId } from '../config/timeOfDay';
import { groundPx } from './lanes';
import { ART_HEIGHT, ART_WIDTH, drawSprite, fill, makeCanvas, seededRandom, toPx } from './pixels';
import { landmarkImage } from './landmarks';
import { buildingsStrip, roadsideStrip, type Strip } from './scenery';
import type { LandmarkId } from '../config/landmarks';

/**
 * Sky, clouds, then the level's buildings, PJ landmarks and roadside
 * (see scenery.ts and landmarks.ts). Layers further away scroll slower than the
 * road (parallax), which gives a sense of depth.
 */

const PARALLAX = { clouds: 0.06, buildings: 0.3, roadside: 0.5 };

// 2×2 ordered dither: which pixels switch colour first as the sky fades.
const BAYER = [
  [0, 2],
  [3, 1],
];

const skies = new Map<TimeId, HTMLCanvasElement>();

/** Sky for a time of day: three colours dithered top to horizon (plus a low sun at sunset, first stars at dusk). */
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
  if (time === 'dusk') {
    const random = seededRandom(5);
    for (let i = 0; i < 25; i++) fill(ctx, random() < 0.8 ? '7' : 'a', Math.floor(random() * ART_WIDTH), Math.floor(random() * 120), 1, 1);
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

/** Draws a strip side by side so it scrolls forever without a gap. */
function drawLooping(ctx: CanvasRenderingContext2D, strip: HTMLCanvasElement, scroll: number, y: number): void {
  const offset = -(Math.floor(scroll) % strip.width);
  for (let x = offset; x < ART_WIDTH; x += strip.width) ctx.drawImage(strip, x, y);
}

// Where each layer was drawn this frame, so the dusk lights line up with it.
let layers: Array<{ strip: Strip; scroll: number; y: number }> = [];
let placed: Array<{ art: Strip; x: number; y: number }> = [];

/** A landmark coming up on this level: `ahead` = how far down the road it is (world units). */
export interface LandmarkAhead {
  id: LandmarkId;
  ahead: number;
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  roadOffset: number,
  time: number,
  scenery: Scenery,
  timeOfDay: TimeId,
  landmarks: LandmarkAhead[] = [],
): void {
  let sky = skies.get(timeOfDay);
  if (!sky) skies.set(timeOfDay, (sky = buildSky(timeOfDay)));
  ctx.drawImage(sky, 0, 0);
  const ground = groundPx(); // moves up when the road has more lanes

  // Clouds
  {
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
    { strip: buildings, scroll: toPx(roadOffset) * PARALLAX.buildings, y: ground - buildings.image.height - 8 },
    { strip: roadside, scroll: toPx(roadOffset) * PARALLAX.roadside, y: ground - roadside.image.height },
  ];
  const [buildingLayer, roadsideLayer] = layers as [typeof layers[0], typeof layers[0]];
  drawLooping(ctx, buildingLayer.strip.image, buildingLayer.scroll, buildingLayer.y);

  // PJ landmarks slide past with the buildings (same parallax), standing in front of them
  placed = [];
  for (const l of landmarks) {
    const art = landmarkImage(l.id);
    const x = Math.round(ART_WIDTH + toPx(l.ahead) * PARALLAX.buildings);
    if (x > ART_WIDTH || x + art.image.width < 0) continue;
    const y = ground - art.image.height - 4;
    ctx.drawImage(art.image, x, y);
    placed.push({ art, x, y });
  }

  drawLooping(ctx, roadsideLayer.strip.image, roadsideLayer.scroll, roadsideLayer.y);
}

/** At dusk: windows, signs and lamps, drawn on top of the tinted scene. */
export function drawBackgroundLights(ctx: CanvasRenderingContext2D): void {
  for (const l of layers) drawLooping(ctx, l.strip.lights, l.scroll, l.y);
  for (const p of placed) ctx.drawImage(p.art.lights, p.x, p.y);
}
