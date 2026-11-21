import { LEVEL_LENGTH } from '../config/game';
import { LEVELS } from '../config/levels';
import { THEME } from '../config/theme';
import { currentLevel, type GameState } from '../core/state';
import { drawBackground } from './background';
import { drawCar } from './car';
import { drawParticles } from './particles';
import { ART_HEIGHT, ART_WIDTH, drawText, fill } from './pixels';
import { drawPotholes } from './potholes';
import { drawRoad } from './road';
import { drawTowTruck } from './towTruck';

/** Draws one full frame onto the low-res pixel canvas, back to front. */
export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  drawBackground(ctx, state.roadOffset);
  drawRoad(ctx, state.road, state.roadOffset, currentLevel(state).roughness);
  drawPotholes(ctx, state.potholes);
  drawTowTruck(ctx, state.tow, state.car);
  drawCar(ctx, state.car, state.tick);
  drawParticles(ctx, state.particles);
  drawProgressBar(ctx, state);
}

function drawProgressBar(ctx: CanvasRenderingContext2D, state: GameState): void {
  const t = THEME.progress;
  const left = 8;
  const width = ART_WIDTH - 16;
  const y = ART_HEIGHT - 5;
  const progress = Math.min(state.levelDistance / LEVEL_LENGTH, 1);

  fill(ctx, t.track, left - 1, y - 1, width + 2, 4);
  fill(ctx, t.fill, left, y, Math.round(width * progress), 2);
  for (let i = 1; i < LEVELS.length; i++) fill(ctx, t.tick, left + Math.round(width * (i / LEVELS.length)), y, 1, 2);

  drawText(ctx, `${Math.floor(state.distance)}m`, left, y - 8, t.text, { shadow: t.textShadow });
  drawText(ctx, `RM ${state.money}`, left + width, y - 8, t.text, { align: 'right', shadow: t.textShadow });
}
