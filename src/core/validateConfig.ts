import { LEVELS } from '../config/levels';
import { ROAD_EVENTS } from '../config/roadEvents';
import * as SPRITES from '../config/sprites';
import { PALETTE } from '../config/theme';
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
    if (level.seconds <= 0) problems.push(`${where}: seconds must be above 0.`);
    if (level.event && (level.eventAt <= 0 || level.eventAt >= 1))
      problems.push(`${where}: eventAt (${level.eventAt}) must be between 0 and 1 (e.g. 0.8 = 80% through the level).`);
  });

  for (const [id, event] of Object.entries(ROAD_EVENTS)) {
    if (event.choices.length === 0) problems.push(`roadEvents.ts, "${id}": needs at least one choice.`);
  }

  if (TOW_OPTIONS.length === 0) problems.push('towTrucks.ts: add at least one tow truck.');

  WORKSHOP_STEPS.forEach((step, i) => {
    if (step.choices.length === 0) problems.push(`workshop.ts, round ${i + 1} ("${step.title}"): needs at least one choice.`);
  });

  for (const [name, rows] of Object.entries(SPRITES)) {
    const width = rows[0]?.length ?? 0;
    rows.forEach((row, i) => {
      if (row.length !== width)
        problems.push(`sprites.ts, ${name} row ${i + 1}: is ${row.length} pixels wide, but row 1 is ${width}.`);
      for (const ch of row) {
        if (ch !== '.' && ch !== ' ' && !'XYZ'.includes(ch) && !(ch in PALETTE))
          problems.push(`sprites.ts, ${name} row ${i + 1}: "${ch}" isn't a palette colour (0-9, a-f), X/Y/Z, or ".".`);
      }
    });
  }

  return problems;
}
