import { LANES, WORLD } from '../config/game';
import { THEME } from '../config/theme';
import { ART_GROUND, ART_HEIGHT, ART_WIDTH, fill, seededRandom, toPx } from './pixels';

export interface RoadPoint {
  x: number;
  y: number;
}

const STEP = 3;
const KERB_BLOCK = 4; // width of each red/white kerb block (art pixels)
const LANE_DASH = 10;

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
  return Array.from({ length: 220 }, () => ({
    x: Math.floor(random() * 400),
    y: 3 + Math.floor(random() * (ART_HEIGHT - ART_GROUND - 3)),
    shade: random() < 0.6 ? 0 : 1,
    rank: random(), // smoother roads show fewer speckles
  }));
})();

const wrap = (value: number, length: number): number => ((value % length) + length) % length;

export function drawRoad(ctx: CanvasRenderingContext2D, road: RoadPoint[], offset: number, roughness: number): void {
  const scroll = toPx(offset);

  // Asphalt
  fill(ctx, THEME.road, 0, ART_GROUND, ART_WIDTH, ART_HEIGHT - ART_GROUND);

  // Speckles: rougher roads get more
  const visibleShare = Math.min(0.25 + roughness * 0.3, 1);
  for (const s of SPECKLES) {
    if (s.rank > visibleShare) continue;
    const x = wrap(s.x - scroll, 400);
    if (x < ART_WIDTH) fill(ctx, THEME.roadSpeckles[s.shade] ?? THEME.road, x, ART_GROUND + s.y, 1, 1);
  }

  // Dashed yellow line between the two lanes
  const dividerY = toPx(LANES.dividerY);
  for (let x = -wrap(scroll, LANE_DASH * 2); x < ART_WIDTH; x += LANE_DASH * 2) {
    fill(ctx, THEME.laneLine, x, dividerY, LANE_DASH, 1);
  }

  // Red/white kerb, nudged up and down by the road's bumps
  const roadLength = road.length;
  for (let x = 0; x < ART_WIDTH; x++) {
    const worldX = (x * WORLD.width) / ART_WIDTH + offset;
    const point = road[Math.floor(wrap(worldX / STEP, roadLength))];
    const bump = Math.max(-1, Math.min(2, Math.round((point?.y ?? 0) / 2)));
    const block = Math.floor((x + scroll) / KERB_BLOCK) % THEME.kerb.length;
    const colour = THEME.kerb[block] ?? THEME.road;
    fill(ctx, colour, x, ART_GROUND + bump, 1, 2 - Math.min(bump, 0));
  }
}
