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
import { drawRempitWarnings, drawVehicles } from './traffic';
import { drawLane } from './lanes';

/**
 * Draws one full frame onto the low-res pixel canvas, back to front:
 * sky and road, then the far lane, then the near lane (so near things
 * overlap far ones), then effects and the HUD on top.
 */
export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  const roughness = currentLevel(state).roughness;
  const carLane = drawLane(state.car.lanePos);
  drawBackground(ctx, state.roadOffset, state.time);
  drawRoad(ctx, state.road, state.roadOffset, roughness);

  for (const lane of [1, 0] as const) {
    drawPotholes(ctx, state.potholes, lane, state.time);
    drawVehicles(ctx, state.vehicles, lane, state.time, state.roadOffset);
    if (carLane === lane) {
      drawTowTruck(ctx, state.tow, state.car, state.time);
      drawCar(ctx, state.car, state.time, state.roadOffset, roughness, state.mode === 'playing' ? state.pace : 1);
    }
  }

  drawRempitWarnings(ctx, state.vehicles, state.time);
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
  const right = ART_WIDTH - 8;

  const secs = secondsLeft(state);
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  const warn = secs <= 5 && Math.floor(state.tick / 15) % 2 === 0;
  const clockW = textWidth(clock, 2) + 12;
  fill(ctx, t.box, right - clockW, 8, clockW, 28);
  drawText(ctx, clock, right - 6, 12, warn ? t.timerWarn : t.timer, { align: 'right', scale: 2, shadow: t.shadow });

  const label = `LEVEL ${state.level}/${LEVELS.length}`;
  const labelW = textWidth(label, 2) + 12;
  const labelRight = right - clockW - 6;
  fill(ctx, t.box, labelRight - labelW, 8, labelW, 28);
  drawText(ctx, label, labelRight - 6, 12, t.number, { align: 'right', scale: 2, shadow: t.shadow });

  drawText(ctx, currentLevel(state).name, right, 42, t.name, { align: 'right', shadow: t.shadow });
}

function drawProgressBar(ctx: CanvasRenderingContext2D, state: GameState): void {
  const t = THEME.progress;
  const left = 16;
  const width = ART_WIDTH - 32;
  const y = ART_HEIGHT - 8;
  const progress = Math.min(state.levelDistance / levelLength(currentLevel(state)), 1);

  fill(ctx, t.track, left - 2, y - 2, width + 4, 7);
  fill(ctx, t.fill, left, y, Math.round(width * progress), 3);
  for (let i = 1; i < LEVELS.length; i++) fill(ctx, t.tick, left + Math.round(width * (i / LEVELS.length)), y, 2, 3);

  drawText(ctx, `${Math.floor(state.distance)}m`, left, y - 16, t.text, { shadow: t.textShadow });
  drawText(ctx, `RM ${state.money}`, left + width, y - 16, t.text, { align: 'right', shadow: t.textShadow });
}
