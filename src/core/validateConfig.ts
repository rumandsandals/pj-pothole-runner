import { LEVELS } from '../config/levels';
import { noteToHz, toHz } from '../audio/synth';
import { DRIVING_THEME } from '../config/music';
import { ROAD_EVENTS } from '../config/roadEvents';
import { SOUNDS, type Tone } from '../config/sounds';
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
    if (level.lanes < 1 || level.lanes > 3) problems.push(`${where}: lanes must be 1, 2 or 3.`);
    const t = level.traffic;
    if (t) {
      for (const key of ['motorcycleShare', 'rempitChance', 'laneChangeChance'] as const) {
        if (t[key] < 0 || t[key] > 1) problems.push(`${where}: traffic.${key} must be between 0 and 1.`);
      }
      if (t.maxOnScreen < 1) problems.push(`${where}: traffic.maxOnScreen must be at least 1 (or set traffic: null).`);
    }
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
    if (!Array.isArray(rows) || !rows.every((r) => typeof r === 'string')) continue; // not a picture
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

  // Sounds: every pitch must be a number or a real note name
  const badPitch = (v: number | string | undefined): boolean => v !== undefined && !(toHz(v) > 0);
  for (const [name, tones] of Object.entries(SOUNDS)) {
    tones.forEach((tone: Tone, i) => {
      if (badPitch(tone.from) || badPitch(tone.to))
        problems.push(`sounds.ts, "${name}" tone ${i + 1}: "${tone.from}${tone.to ? ` → ${tone.to}` : ''}" isn't a valid pitch (use e.g. 'C5', 'F#4' or 440).`);
    });
  }

  // Music: notes, '.', '-' only; channels should be the same length
  const lengths = DRIVING_THEME.channels.map((channel, c) => {
    const tokens = channel.notes.trim().split(/\s+/);
    tokens.forEach((token, step) => {
      if (token !== '.' && token !== '-' && !(noteToHz(token) > 0))
        problems.push(`music.ts, channel ${c + 1}, step ${step + 1}: "${token}" isn't a note (use e.g. C4, F#5, '.' or '-').`);
    });
    return tokens.length;
  });
  lengths.push(DRIVING_THEME.drums.trim().split(/\s+/).length);
  if (new Set(lengths).size > 1)
    problems.push(`music.ts: channels have different numbers of steps (${lengths.join(', ')}), so they'll drift out of time.`);

  return problems;
}
