import type { ColourKey } from './theme';

/**
 * TIME OF DAY
 * Every game shuffles the time of day for each level (level 1 is always
 * morning). Bigger `chance` = more common. At dusk, windows, signs, street
 * lamps and headlights start to glow.
 */

export type TimeId = 'morning' | 'afternoon' | 'sunset' | 'dusk';

export const FIRST_LEVEL_TIME: TimeId = 'morning';

export const TIMES: Record<TimeId, { chance: number; label: string }> = {
  morning: { chance: 3, label: '🌄 Morning' },
  afternoon: { chance: 3, label: '☀️ Afternoon' },
  sunset: { chance: 2, label: '🌅 Sunset' },
  dusk: { chance: 2, label: '🌆 Dusk' },
};

/** Sky colours (palette keys): top of the sky, a middle band, and the horizon. */
export const SKIES: Record<TimeId, { top: ColourKey; middle: ColourKey; horizon: ColourKey }> = {
  morning: { top: 'c', middle: 'c', horizon: 'f' },
  afternoon: { top: 'c', middle: 'c', horizon: '7' },
  sunset: { top: '2', middle: '8', horizon: '9' },
  dusk: { top: '1', middle: '2', horizon: 'd' },
};

/** A colour wash laid over the whole scene (CSS colour with transparency), or null for none. */
export const TINTS: Record<TimeId, string | null> = {
  morning: 'rgba(255, 210, 170, 0.08)',
  afternoon: null,
  sunset: 'rgba(255, 120, 40, 0.16)',
  dusk: 'rgba(30, 20, 80, 0.34)',
};

/** Times of day when lights glow (windows, signs, lamps, headlights). */
export const LIGHTS_ON: TimeId[] = ['dusk'];
