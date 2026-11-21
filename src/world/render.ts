import { LEVELS } from '../config/levels';
import { THEME } from '../config/theme';
import { currentLevel, levelLength, secondsLeft, type GameState } from '../core/state';
import { drawBackground } from './background';
import { drawCar } from './car';
import { drawBits } from './effects';
import { drawParticles } from './particles';
import { ART_HEIGHT, ART_WIDTH, drawText, fill, textWidth } from './pixels';
import { drawPotholes } from './potholes';
import { drawRoad } from './road';
import { drawTowTruck } from './towTruck';

/** Draws one full frame onto the low-res pixel canvas, back to front. */
export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  const roughness = currentLevel(state).roughness;
  drawBackground(ctx, state.roadOffset, state.time);
  drawRoad(ctx, state.road, state.roadOffset, roughness);
  drawPotholes(ctx, state.potholes, state.time);
  drawTowTruck(ctx, state.tow, state.car, state.time);
  drawCar(ctx, state.car, state.time, state.roadOffset, roughness);
  drawBits(ctx, state.bits);
  drawParticles(ctx, state.particles);
  drawLevelBadge(ctx, state);
  drawProgressBar(ctx, state);
}

/**
 * "LEVEL 2/9" and the countdown clock in the top-right corner, level name
 * underneath. Kept on the right so the car never jumps behind it.
 */
function drawLevelBadge(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.mode === 'menu') return;
  const t = THEME.levelBadge;
  const right = ART_WIDTH - 4;

  const secs = secondsLeft(state);
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  const warn = secs <= 5 && Math.floor(state.tick / 15) % 2 === 0;
  const clockW = textWidth(clock, 2) + 6;
  fill(ctx, t.box, right - clockW, 4, clockW, 14);
  drawText(ctx, clock, right - 3, 6, warn ? t.timerWarn : t.timer, { align: 'right', scale: 2, shadow: t.shadow });

  const label = `LEVEL ${state.level}/${LEVELS.length}`;
  const labelW = textWidth(label, 2) + 6;
  const labelRight = right - clockW - 3;
  fill(ctx, t.box, labelRight - labelW, 4, labelW, 14);
  drawText(ctx, label, labelRight - 3, 6, t.number, { align: 'right', scale: 2, shadow: t.shadow });

  drawText(ctx, currentLevel(state).name, right, 21, t.name, { align: 'right', shadow: t.shadow });
}

function drawProgressBar(ctx: CanvasRenderingContext2D, state: GameState): void {
  const t = THEME.progress;
  const left = 8;
  const width = ART_WIDTH - 16;
  const y = ART_HEIGHT - 5;
  const progress = Math.min(state.levelDistance / levelLength(currentLevel(state)), 1);

  fill(ctx, t.track, left - 1, y - 1, width + 2, 4);
  fill(ctx, t.fill, left, y, Math.round(width * progress), 2);
  for (let i = 1; i < LEVELS.length; i++) fill(ctx, t.tick, left + Math.round(width * (i / LEVELS.length)), y, 1, 2);

  drawText(ctx, `${Math.floor(state.distance)}m`, left, y - 8, t.text, { shadow: t.textShadow });
  drawText(ctx, `RM ${state.money}`, left + width, y - 8, t.text, { align: 'right', shadow: t.textShadow });
}
