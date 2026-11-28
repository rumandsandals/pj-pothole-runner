import type { GameState } from '../core/state';
import { groundShadow } from './car';
import { laneY } from './lanes';
import { drawText, fill, toPx } from './pixels';

/**
 * The ambulance that comes after you hit someone at a zebra crossing:
 * a white van with a red stripe, "AMBULANS" on the side and flashing lights.
 */
export function drawAmbulance(ctx: CanvasRenderingContext2D, state: GameState): void {
  const scene = state.incident;
  if (!scene) return;
  const x = Math.round(toPx(scene.ambulanceX));
  const ground = Math.round(toPx(laneY(state.car.lanePos)));
  const left = x - 30;
  const top = ground - 30;
  groundShadow(ctx, x, ground + 1, 32);
  // Body: tall box at the back, cab at the front (it faces left, towards you)
  fill(ctx, '0', left - 1, top - 1, 46, 26);
  fill(ctx, '7', left, top, 44, 24);
  fill(ctx, '0', left - 13, top + 9, 13, 16); // cab outline
  fill(ctx, '7', left - 12, top + 10, 12, 14); // cab
  fill(ctx, 'j', left - 11, top + 11, 8, 6); // windscreen
  fill(ctx, '8', left - 12, top + 18, 56, 3); // red stripe
  fill(ctx, 'a', left - 13, top + 20, 2, 2); // headlight
  drawText(ctx, 'AMBULANS', left + 22, top + 4, '8', { align: 'center', scale: 0.5 });
  // Red cross
  fill(ctx, '8', left + 19, top + 10, 6, 2);
  fill(ctx, '8', left + 21, top + 8, 2, 6);
  // Wheels
  for (const wx of [left - 5, left + 34]) {
    fill(ctx, '0', wx - 4, ground - 7, 9, 8);
    fill(ctx, 'h', wx - 1, ground - 4, 3, 3);
  }
  // Flashing lights on the roof
  const flip = Math.floor(state.time / 5) % 2 === 0;
  fill(ctx, '0', left + 2, top - 4, 40, 4);
  fill(ctx, flip ? '8' : 'c', left + 3, top - 3, 18, 2);
  fill(ctx, flip ? 'c' : '8', left + 23, top - 3, 18, 2);
  if (flip) fill(ctx, '8', left, top - 7, 3, 3);
  else fill(ctx, 'c', left + 41, top - 7, 3, 3);
}
