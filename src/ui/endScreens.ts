import { LEVELS } from '../config/levels';
import { TEXT } from '../config/text';
import { currentLevel, type GameState } from '../core/state';
import { byId, formatRM } from './dom';
import { showScreen } from './overlays';

export function showDead(state: GameState): void {
  byId('deadScore').innerHTML = `
    Distance: <b>${Math.floor(state.distance)}m</b><br>
    Compensation: <b>${formatRM(state.money)}</b><br>
    Level: <b>${state.level} — ${currentLevel(state).name}</b>`;
  showScreen('dead');
}

export function showWin(state: GameState): void {
  byId('winScore').innerHTML = `
    All ${LEVELS.length} Levels Completed! 🎉<br>
    Total Compensation: <b>${formatRM(state.money)}</b><br>
    ${TEXT.winChecklist}`;
  showScreen('win');
}
