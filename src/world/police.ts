import { HEAT, POLICE } from '../config/police';
import { VEHICLE_ART } from '../config/sprites';
import type { GameState } from '../core/state';
import { drawVehicleArt, vehicleBox, wheelFrame } from './car';
import { laneY } from './lanes';
import { drawText, fill } from './pixels';

const ART = VEHICLE_ART.sedan;

/** The PDRM patrol car pulling you over: navy sedan, "POLIS" on the door, flashing light bar. */
export function drawPoliceCar(ctx: CanvasRenderingContext2D, state: GameState): void {
  const p = state.police;
  if (!p) return;
  const box = vehicleBox(ART, p.x, laneY(state.car.lanePos));
  const moving = p.x < state.car.x - POLICE.stopBehind;
  drawVehicleArt(ctx, ART, box, POLICE.paint, moving ? wheelFrame(p.x) : 0);
  fill(ctx, '7', box.left + 6, box.top + 13, box.width - 12, 1); // white stripe
  drawText(ctx, 'POLIS', box.left + box.width / 2 - 2, box.top + 14, '7', { align: 'center', scale: 0.5 });
  // Light bar on the roof: red and blue, flashing
  const flip = Math.floor(state.time / 6) % 2 === 0;
  const barX = box.left + 22;
  const barY = box.top - 1;
  fill(ctx, '0', barX - 1, barY - 1, 14, 4);
  fill(ctx, flip ? '8' : '1', barX, barY, 6, 2);
  fill(ctx, flip ? '1' : 'c', barX + 6, barY, 6, 2);
  if (flip) fill(ctx, '8', barX - 3, barY - 3, 3, 3);
  else fill(ctx, 'c', barX + 12, barY - 3, 3, 3);
}

/** Five lights under the progress bar: how much police attention you have. */
export function drawHeatMeter(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.mode === 'menu' || state.level < POLICE.fromLevel) return;
  const lit = Math.ceil((state.heat / HEAT.max) * 5);
  const hot = state.heat >= POLICE.stopsFromHeat * 3;
  const flip = Math.floor(state.time / 10) % 2 === 0;
  const left = 12;
  const top = 40;
  drawText(ctx, 'POLICE', left, top + 1, lit > 0 ? '7' : '6', { shadow: '0' });
  for (let i = 0; i < 5; i++) {
    const x = left + 76 + i * 13;
    fill(ctx, '0', x - 1, top - 1, 12, 12);
    const colour = i >= lit ? '5' : hot ? ((i % 2 === 0) === flip ? '8' : 'c') : i < 2 ? 'a' : i < 4 ? '9' : '8';
    fill(ctx, colour, x, top, 10, 10);
  }
}
