import { LEVELS } from '../config/levels';
import { THEME } from '../config/theme';
import { SCENERY } from '../config/scenery';
import { LIGHTS_ON } from '../config/timeOfDay';
import { currentLevel, currentTime, levelLength, secondsLeft, type GameState } from '../core/state';
import { drawBackground, drawBackgroundLights } from './background';
import { drawHeadlights, drawTimeTint } from './timeOfDay';
import { drawCar } from './car';
import { drawBits } from './effects';
import { drawParticles } from './particles';
import { ART_WIDTH, drawText, fill, textWidth } from './pixels';
import { drawHeatMeter, drawPoliceCar } from './police';
import { drawPotholes } from './potholes';
import { drawRoad } from './road';
import { drawTowTruck } from './towTruck';
import { drawRempitWarnings, drawVehicles } from './traffic';
import { drawLane, laneCount, setLaneCount } from './lanes';

/**
 * Draws one full frame onto the low-res pixel canvas, back to front:
 * sky and road, then the far lane, then the near lane (so near things
 * overlap far ones), then effects and the HUD on top.
 */
export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  const level = currentLevel(state);
  const roughness = level.roughness;
  setLaneCount(level.lanes);
  const carLane = drawLane(state.car.lanePos);
  const timeOfDay = currentTime(state);
  drawBackground(ctx, state.roadOffset, state.time, SCENERY[level.scenery], timeOfDay);
  drawRoad(ctx, state.road, state.roadOffset, roughness, level.highway);

  // Furthest lane first, so nearer things overlap further ones
  for (let lane = laneCount() - 1; lane >= 0; lane--) {
    drawPotholes(ctx, state.potholes, lane, state.time);
    drawVehicles(ctx, state.vehicles, lane, state.time, state.roadOffset);
    if (carLane === lane) {
      drawPoliceCar(ctx, state);
      drawTowTruck(ctx, state.tow, state.car, state.time);
      drawCar(ctx, state.car, state.time, state.roadOffset, roughness, state.mode === 'playing' ? state.pace : 1);
    }
  }

  // Time of day on top of the scene; at dusk the lights come on
  drawTimeTint(ctx, timeOfDay);
  if (LIGHTS_ON.includes(timeOfDay)) {
    drawBackgroundLights(ctx);
    drawHeadlights(ctx, state);
    drawPoliceCar(ctx, state); // flashing lights stay bright
  }

  drawRempitWarnings(ctx, state.vehicles, state.time);
  drawBits(ctx, state.bits);
  drawParticles(ctx, state.particles);
  drawLevelBadge(ctx, state);
  drawProgressBar(ctx, state);
  drawHeatMeter(ctx, state);
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
  // Top-left corner (the level badge is top-right), clear of the road
  const left = 12;
  const width = 220;
  const y = 14;
  const progress = Math.min(state.levelDistance / levelLength(currentLevel(state)), 1);

  fill(ctx, t.track, left - 2, y - 2, width + 4, 7);
  fill(ctx, t.fill, left, y, Math.round(width * progress), 3);
  for (let i = 1; i < LEVELS.length; i++) fill(ctx, t.tick, left + Math.round(width * (i / LEVELS.length)), y, 2, 3);

  drawText(ctx, `${Math.floor(state.distance)}m`, left, y + 9, t.text, { shadow: t.textShadow });
  drawText(ctx, `RM ${state.money}`, left + width, y + 9, t.text, { align: 'right', shadow: t.textShadow });
}
