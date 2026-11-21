import { formatRM } from './dom';
import { byId } from './dom';

/**
 * BEST SCORE — your highest compensation, remembered on this device
 * (it never leaves your browser).
 */

const KEY = 'pjPotholeRunner.best';

export interface Best {
  money: number;
  level: number;
}

export function getBest(): Best | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Best) : null;
  } catch {
    return null;
  }
}

/** Saves the score if it beats the best. Returns true for a new best. */
export function saveBest(money: number, level: number): boolean {
  const best = getBest();
  if (best && best.money >= money) return false;
  try {
    localStorage.setItem(KEY, JSON.stringify({ money, level }));
  } catch {
    /* private browsing: still a new best this time */
  }
  return true;
}

/** The "BEST: RM …" line on the title screen. */
export function showMenuBest(): void {
  const best = getBest();
  byId('menuBest').textContent = best ? `🏆 BEST: ${formatRM(best.money)} · REACHED LEVEL ${best.level}` : '';
}
