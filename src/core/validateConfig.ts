import { LEVEL_LENGTH } from '../config/game';
import { LEVELS } from '../config/levels';
import { ROAD_EVENTS } from '../config/roadEvents';
import { TOW_OPTIONS } from '../config/towTrucks';
import { WORKSHOP_STEPS } from '../config/workshop';

/**
 * Checks the settings files for mistakes that TypeScript can't catch,
 * and explains them in plain words in the browser console.
 */
export function validateConfig(): string[] {
  const problems: string[] = [];

  if (LEVELS.length === 0) problems.push('levels.ts: add at least one level.');
  LEVELS.forEach((level, i) => {
    const where = `levels.ts, level ${i + 1} ("${level.name}")`;
    if (level.potholes.length === 0) problems.push(`${where}: "potholes" list is empty.`);
    if (level.speed <= 0) problems.push(`${where}: speed must be above 0.`);
    if (level.event && level.eventAt >= LEVEL_LENGTH)
      problems.push(`${where}: eventAt (${level.eventAt}) must be less than LEVEL_LENGTH (${LEVEL_LENGTH}) or the event never shows.`);
  });

  for (const [id, event] of Object.entries(ROAD_EVENTS)) {
    if (event.choices.length === 0) problems.push(`roadEvents.ts, "${id}": needs at least one choice.`);
  }

  if (TOW_OPTIONS.length === 0) problems.push('towTrucks.ts: add at least one tow truck.');

  WORKSHOP_STEPS.forEach((step, i) => {
    if (step.choices.length === 0) problems.push(`workshop.ts, round ${i + 1} ("${step.title}"): needs at least one choice.`);
  });

  return problems;
}
