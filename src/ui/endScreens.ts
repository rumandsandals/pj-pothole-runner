import { LEVELS } from '../config/levels';
import { TEXT } from '../config/text';
import { currentLevel, type GameState } from '../core/state';
import { getBest, saveBest } from './best';
import { byId, formatRM } from './dom';
import { showScreen } from './overlays';

function bestLine(state: GameState): string {
  const isNew = saveBest(state.money, state.level);
  const best = getBest();
  return isNew ? '<br><span class="new-best">🏆 NEW BEST!</span>' : best ? `<br>Best: <b>${formatRM(best.money)}</b>` : '';
}

export function showDead(state: GameState): void {
  byId('deadScore').innerHTML = `
    Distance: <b>${Math.floor(state.distance)}m</b><br>
    Compensation: <b>${formatRM(state.money)}</b><br>
    Level: <b>${state.level} — ${currentLevel(state).name}</b>${bestLine(state)}`;
  showScreen('dead');
}

export function showWin(state: GameState): void {
  byId('winScore').innerHTML = `
    All ${LEVELS.length} Levels Completed! 🎉<br>
    Total Compensation: <b>${formatRM(state.money)}</b>${bestLine(state)}<br>
    ${TEXT.winChecklist}`;
  showScreen('win');
}
