import { TINTS, type TimeId } from '../config/timeOfDay';
import { VEHICLE_ART } from '../config/sprites';
import { VEHICLES } from '../config/traffic';
import type { GameState } from '../core/state';
import { carSpriteBox, vehicleBox } from './car';
import { laneY } from './lanes';
import { ART_HEIGHT, ART_WIDTH, fill } from './pixels';

/** The time of day's colour wash over the finished scene (warm morning, orange sunset, blue dusk). */
export function drawTimeTint(ctx: CanvasRenderingContext2D, time: TimeId): void {
  const colour = TINTS[time];
  if (!colour) return;
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, ART_WIDTH, ART_HEIGHT);
}

/** Headlight beams and tail lights, drawn at dusk after the scene is tinted. */
export function drawHeadlights(ctx: CanvasRenderingContext2D, state: GameState): void {
  const beam = (x: number, y: number, length: number): void => {
    ctx.fillStyle = 'rgba(255, 236, 39, 0.18)';
    ctx.beginPath();
    ctx.moveTo(x, y - 1);
    ctx.lineTo(x + length, y - 7);
    ctx.lineTo(x + length, y + 6);
    ctx.lineTo(x, y + 2);
    ctx.fill();
    fill(ctx, 'a', x - 2, y - 1, 3, 3);
  };
  for (const v of state.vehicles) {
    const type = VEHICLES[v.kind];
    const art = VEHICLE_ART[type.art];
    const box = vehicleBox(art, v.x, laneY(v.lanePos));
    const y = box.top + Math.round(box.height * (type.group === 'car' ? 0.5 : 0.45));
    beam(box.left + box.width, y, type.group === 'car' ? 70 : 50);
    fill(ctx, '8', box.left, y, 2, 2);
  }
  const car = carSpriteBox(state.car);
  if (state.car.sinkY === 0) {
    beam(car.left + car.width, car.top + 11, 80);
    fill(ctx, '8', car.left, car.top + 9, 2, 3);
  }
}
