import { MAX_HEALTH } from '../config/game';
import { currentLevel, type GameState } from '../core/state';
import { byId } from './dom';

export function updateHud(state: GameState): void {
  const pct = Math.round((state.health / MAX_HEALTH) * 100);
  const fill = byId('hpFill');
  fill.style.width = `${pct}%`;
  fill.dataset.level = pct > 60 ? 'high' : pct > 30 ? 'mid' : 'low';
  byId('hpNum').textContent = `${pct}%`;
  byId('moneyNum').textContent = String(state.money);
  byId('lvlName').textContent = `LVL ${state.level} — ${currentLevel(state).name}`;
}
