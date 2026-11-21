import { JUICE, MAX_HEALTH } from '../config/game';
import { currentLevel, type GameState } from '../core/state';
import { byId } from './dom';

export function updateHud(state: GameState): void {
  const pct = Math.round((state.health / MAX_HEALTH) * 100);
  const fill = byId('hpFill');
  fill.style.width = `${pct}%`;
  fill.dataset.level = pct > 60 ? 'high' : pct > 30 ? 'mid' : 'low';
  byId('hpNum').textContent = `${pct}%`;
  rollMoneyTo(state.money);
  byId('lvlName').textContent = `LVL ${state.level} — ${currentLevel(state).name}`;
}

// The RM counter rolls up (or down) to its new value instead of jumping.
let shown = 0;
let target = 0;
let rolling = false;

function rollMoneyTo(value: number): void {
  target = value;
  if (target < shown && target === 0) shown = 0; // new game: reset straight away
  if (rolling) return;
  rolling = true;
  const step = (): void => {
    const diff = target - shown;
    if (Math.abs(diff) < 1) shown = target;
    else shown += Math.sign(diff) * Math.max(1, Math.round(Math.abs(diff) * JUICE.moneyRollSpeed));
    byId('moneyNum').textContent = String(shown);
    if (shown !== target) requestAnimationFrame(step);
    else rolling = false;
  };
  requestAnimationFrame(step);
}
