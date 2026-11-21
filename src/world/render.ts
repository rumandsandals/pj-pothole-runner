import { LEVEL_LENGTH, WORLD } from '../config/game';
import { LEVELS } from '../config/levels';
import { THEME } from '../config/theme';
import { currentLevel, type GameState } from '../core/state';
import { drawCar } from './car';
import { drawParticles } from './particles';
import { drawPotholes } from './potholes';
import { drawRoad } from './road';
import { drawTowTruck } from './towTruck';

/** Draws one full frame of the game, back to front. */
export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { width, height } = WORLD;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = THEME.background;
  ctx.fillRect(0, 0, width, height);

  drawRoad(ctx, state.road, state.roadOffset, currentLevel(state).roughness);
  drawPotholes(ctx, state.potholes);
  drawTowTruck(ctx, state.tow, state.car);
  drawCar(ctx, state.car, state.tick);
  drawParticles(ctx, state.particles);
  drawProgressBar(ctx, state);
}

function drawProgressBar(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { width, height } = WORLD;
  const t = THEME.progress;
  const barWidth = width - 32;
  const progress = Math.min(state.levelDistance / LEVEL_LENGTH, 1);

  ctx.fillStyle = t.track;
  ctx.fillRect(16, height - 14, barWidth, 5);
  ctx.fillStyle = t.fill;
  ctx.fillRect(16, height - 14, barWidth * progress, 5);

  ctx.fillStyle = t.tick;
  for (let i = 1; i < LEVELS.length; i++) ctx.fillRect(16 + barWidth * (i / LEVELS.length), height - 16, 1, 8);

  ctx.fillStyle = t.text;
  ctx.font = `9px ${THEME.font}`;
  ctx.textAlign = 'left';
  ctx.fillText(`${Math.floor(state.distance)}m`, 16, height - 18);
  ctx.textAlign = 'right';
  ctx.fillText(`RM ${state.money}`, width - 16, height - 18);
}
