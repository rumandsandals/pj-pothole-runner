import { TINTS, WEATHER_EFFECTS, type Conditions } from '../config/weather';
import { VEHICLE_ART } from '../config/sprites';
import { VEHICLES } from '../config/traffic';
import type { GameState } from '../core/state';
import { carSpriteBox, vehicleBox } from './car';
import { groundPx, laneY } from './lanes';
import { ART_HEIGHT, ART_WIDTH, fill, toPx } from './pixels';

/**
 * Time of day and weather, drawn over the finished scene:
 * sunset glow, night darkness (then headlights), rain, haze, lightning.
 */

function tint(ctx: CanvasRenderingContext2D, colour: string, y = 0): void {
  ctx.fillStyle = colour;
  ctx.fillRect(0, y, ART_WIDTH, ART_HEIGHT - y);
}

/** Sunset glow or night darkness. */
export function drawTimeTint(ctx: CanvasRenderingContext2D, c: Conditions): void {
  if (c.time === 'sunset') tint(ctx, TINTS.sunset);
  if (c.time === 'night') tint(ctx, TINTS.night);
}

/** Headlight beams and tail lights, drawn after the scene is darkened at night. */
export function drawHeadlights(ctx: CanvasRenderingContext2D, state: GameState): void {
  const beam = (x: number, y: number, length: number): void => {
    ctx.fillStyle = 'rgba(255, 236, 39, 0.22)';
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

/** Rain streaks, a wet sheen on the road, and the darker sky. */
export function drawRain(ctx: CanvasRenderingContext2D, time: number, storm: boolean, roadOffset: number): void {
  tint(ctx, storm ? TINTS.storm : TINTS.rain);
  // wet road: short shiny streaks that scroll with the road
  const ground = groundPx();
  for (let i = 0; i < 60; i++) {
    const x = (((i * 137 - toPx(roadOffset)) % 700) + 700) % 700 - 30;
    const y = ground + 12 + ((i * 53) % Math.max(1, ART_HEIGHT - ground - 14));
    fill(ctx, '6', x, y, 10 + (i % 3) * 6, 1);
  }
  // falling drops
  const drops = storm ? WEATHER_EFFECTS.stormDrops : WEATHER_EFFECTS.rainDrops;
  for (let i = 0; i < drops; i++) {
    const x = (((i * 97 - time * (storm ? 5 : 3)) % 700) + 700) % 700 - 30;
    const y = (i * 61 + time * (storm ? 16 : 12)) % (ART_HEIGHT + 20) - 10;
    fill(ctx, i % 4 === 0 ? '7' : '6', x, y, 1, 3);
    fill(ctx, i % 4 === 0 ? '7' : '6', x - 1, y + 3, 1, 3);
  }
}

/** Haze: a grey-orange veil, thickest far ahead of the car. */
export function drawHaze(ctx: CanvasRenderingContext2D, state: GameState): void {
  tint(ctx, TINTS.haze);
  const clearTo = toPx(state.car.x + WEATHER_EFFECTS.hazeClearDistance);
  const gradient = ctx.createLinearGradient(clearTo - 60, 0, ART_WIDTH, 0);
  gradient.addColorStop(0, 'rgba(190, 160, 120, 0)');
  gradient.addColorStop(1, 'rgba(190, 160, 120, 0.92)');
  ctx.fillStyle = gradient;
  ctx.fillRect(clearTo - 60, 0, ART_WIDTH - clearTo + 60, ART_HEIGHT);
}

export function drawLightning(ctx: CanvasRenderingContext2D, ticks: number): void {
  if (ticks <= 0 || (ticks > 3 && ticks < 6)) return; // double flicker
  tint(ctx, TINTS.lightning);
}
