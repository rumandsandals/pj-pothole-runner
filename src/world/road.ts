import { WORLD } from '../config/game';
import { THEME } from '../config/theme';
import { laneLineYs } from './lanes';
import { ART_GROUND, ART_HEIGHT, ART_WIDTH, fill, seededRandom, toPx } from './pixels';

export interface RoadPoint {
  x: number;
  y: number;
}

const STEP = 3;
const KERB_BLOCK = 8; // width of each red/white kerb block (art pixels)
const KERB_HEIGHT = 5;
const LANE_DASH = 22;

/** Builds the road's bumps. Higher roughness = bumpier kerb and more cracks. */
export function generateRoad(roughness: number): RoadPoint[] {
  const points: RoadPoint[] = [];
  for (let x = 0; x <= WORLD.width + 120; x += STEP) {
    const y =
      Math.sin(x * 0.033) * roughness * 2.5 +
      Math.sin(x * 0.087 + 1.2) * roughness * 1.2 +
      Math.sin(x * 0.21 + 2.6) * roughness * 0.6 +
      Math.sin(x * 0.49 + 0.7) * roughness * 0.28;
    points.push({ x, y });
  }
  return points;
}

// Fixed speckle pattern for the asphalt texture.
const SPECKLES = (() => {
  const random = seededRandom(3);
  return Array.from({ length: 700 }, () => ({
    x: Math.floor(random() * 640),
    y: 6 + Math.floor(random() * (ART_HEIGHT - ART_GROUND - 6)),
    shade: random() < 0.6 ? 0 : 1,
    size: random() < 0.25 ? 2 : 1,
    rank: random(), // smoother roads show fewer speckles
  }));
})();

const wrap = (value: number, length: number): number => ((value % length) + length) % length;

/**
 * Draws the road: asphalt, speckles, lane lines and the kerb.
 * Town roads have yellow lane dashes and a red/white kerb; the highway has
 * long white dashes and a concrete barrier.
 */
export function drawRoad(ctx: CanvasRenderingContext2D, road: RoadPoint[], offset: number, roughness: number, highway = false): void {
  const scroll = toPx(offset);

  // Asphalt
  fill(ctx, THEME.road, 0, ART_GROUND, ART_WIDTH, ART_HEIGHT - ART_GROUND);

  // Speckles: rougher roads get more
  const visibleShare = Math.min(0.25 + roughness * 0.3, 1);
  for (const s of SPECKLES) {
    if (s.rank > visibleShare) continue;
    const x = wrap(s.x - scroll, 640);
    if (x < ART_WIDTH) fill(ctx, THEME.roadSpeckles[s.shade] ?? THEME.road, x, ART_GROUND + s.y, s.size, s.size);
  }

  // Dashed lines exactly between lanes (½ for two lanes; ⅓ and ⅔ for three)
  const dash = highway ? LANE_DASH * 1.6 : LANE_DASH;
  const colour = highway ? THEME.highway.laneLine : THEME.laneLine;
  for (const lineY of laneLineYs()) {
    const y = Math.round(toPx(lineY)) - 1; // 2 px line centred on the boundary
    for (let x = -wrap(scroll, dash * 2); x < ART_WIDTH; x += dash * 2) fill(ctx, colour, x, y, dash, 2);
  }

  if (highway) {
    drawBarrier(ctx, scroll);
    return;
  }

  // Red/white kerb, nudged up and down by the road's bumps
  const roadLength = road.length;
  for (let x = 0; x < ART_WIDTH; x++) {
    const worldX = (x * WORLD.width) / ART_WIDTH + offset;
    const point = road[Math.floor(wrap(worldX / STEP, roadLength))];
    const bump = Math.max(-2, Math.min(3, Math.round(point?.y ?? 0)));
    const block = Math.floor((x + scroll) / KERB_BLOCK) % THEME.kerb.length;
    const colour = THEME.kerb[block] ?? THEME.road;
    fill(ctx, colour, x, ART_GROUND + bump, 1, KERB_HEIGHT - Math.min(bump, 0));
    fill(ctx, '0', x, ART_GROUND + bump + KERB_HEIGHT - Math.min(bump, 0), 1, 1); // kerb shadow
  }
}

/** Highway concrete barrier along the top of the road. */
function drawBarrier(ctx: CanvasRenderingContext2D, scroll: number): void {
  const { face, top, shadow, joint } = THEME.highway.barrier;
  const y = ART_GROUND - 4;
  fill(ctx, top, 0, y, ART_WIDTH, 2);
  fill(ctx, face, 0, y + 2, ART_WIDTH, 6);
  fill(ctx, shadow, 0, y + 8, ART_WIDTH, 2);
  fill(ctx, '0', 0, y + 10, ART_WIDTH, 1);
  for (let x = -wrap(scroll, 40); x < ART_WIDTH; x += 40) fill(ctx, joint, x, y + 2, 1, 8); // panel joints
}
