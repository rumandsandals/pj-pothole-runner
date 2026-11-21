import { WORLD } from '../config/game';
import { THEME } from '../config/theme';

export interface RoadPoint {
  x: number;
  y: number;
}

const STEP = 3;

/** Builds a bumpy road line. Higher roughness = bumpier. */
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

export function drawRoad(ctx: CanvasRenderingContext2D, road: RoadPoint[], offset: number, roughness: number): void {
  const { width, groundY } = WORLD;

  // Faint texture dashes under the road
  ctx.strokeStyle = THEME.roadTexture;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 13]);
  for (let row = 0; row < 3; row++) {
    const y = groundY + 6 + row * 8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // The road surface line, scrolling and wrapping around
  const totalLength = road.length * STEP;
  const shift = offset % totalLength;
  ctx.strokeStyle = THEME.roadLine;
  ctx.lineWidth = 1.3 + roughness * 0.32;
  ctx.beginPath();
  let started = false;
  for (const point of road) {
    let px = point.x - shift;
    while (px < -4) px += totalLength;
    while (px > width + 4) px -= totalLength;
    const py = groundY + point.y;
    if (!started) {
      ctx.moveTo(px, py);
      started = true;
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
}
