import { MAX_HEALTH } from '../config/game';
import { LEVELS } from '../config/levels';
import { POTHOLES, type PotholeId } from '../config/potholes';
import { TEXT } from '../config/text';
import { byId, formatRM, make } from './dom';
import { showScreen } from './overlays';

export interface LevelCardInfo {
  /** The level just finished, or null before level 1. */
  cleared: { number: number; earned: number } | null;
  nextNumber: number;
  health: number;
  money: number;
}

const MAX_SPEED = Math.max(...LEVELS.map((l) => l.speed));

const potholeName = (id: PotholeId): string =>
  POTHOLES[id].label || id.charAt(0).toUpperCase() + id.slice(1);

/** Speed shown as 5 chunky bars. */
function speedBars(speed: number): string {
  const filled = Math.max(1, Math.round((speed / MAX_SPEED) * 5));
  return '▮'.repeat(filled) + '▯'.repeat(5 - filled);
}

export function showLevelCard(info: LevelCardInfo, onGo: () => void): void {
  const level = LEVELS[info.nextNumber - 1];
  if (!level) return;
  const previous = LEVELS[info.nextNumber - 2];

  // Result of the level just cleared
  const result = byId('lvlResult');
  result.replaceChildren();
  if (info.cleared) {
    result.append(
      make('div', 'tit', TEXT.levelClearTitle.replace('{n}', String(info.cleared.number))),
      make(
        'div',
        'lvl-stats',
        `Earned ${formatRM(Math.max(0, info.cleared.earned))} · HP ${Math.round((info.health / MAX_HEALTH) * 100)}% · Total ${formatRM(info.money)}`,
      ),
    );
  }

  byId('lvlKicker').textContent = info.cleared ? TEXT.levelNextLabel : TEXT.levelFirstLabel;
  byId('lvlNumber').textContent = `LEVEL ${info.nextNumber} / ${LEVELS.length}`;
  byId('lvlTitle').textContent = level.name;
  byId('lvlIntro').textContent = level.intro;

  // Quick facts: length, speed, pothole types (new ones flagged)
  const seen = new Set(previous?.potholes ?? []);
  const types = [...new Set(level.potholes)];
  const facts = byId('lvlFacts');
  facts.replaceChildren(
    make('div', '', `⏱ ${level.seconds} sec`),
    make('div', '', `Speed ${speedBars(level.speed)}`),
  );
  const holes = make('div', '', 'Potholes: ');
  types.forEach((id, i) => {
    if (i > 0) holes.append(', ');
    holes.append(potholeName(id));
    if (previous && !seen.has(id)) holes.append(make('span', 'new-tag', 'NEW'));
  });
  facts.append(holes);

  const go = byId('lvlGo');
  go.onclick = () => onGo();
  showScreen('level');
  go.focus({ preventScroll: true });
}
