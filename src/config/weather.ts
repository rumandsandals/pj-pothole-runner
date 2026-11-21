import type { ColourKey } from './theme';

/**
 * WEATHER & TIME OF DAY
 * Every game shuffles the conditions for each level (level 1 is always a
 * clear day). Bigger `chance` = more common.
 */

export type WeatherId = 'clear' | 'rain' | 'storm' | 'haze';
export type TimeId = 'day' | 'sunset' | 'night';
export interface Conditions {
  weather: WeatherId;
  time: TimeId;
}

export const FIRST_LEVEL: Conditions = { weather: 'clear', time: 'day' };

export const WEATHER: Record<WeatherId, { chance: number; label: string; tip: string }> = {
  clear: { chance: 4, label: '☀️ Clear', tip: '' },
  rain: { chance: 2.5, label: '🌧️ Rain', tip: 'Slippery road, and potholes hide under puddles!' },
  storm: { chance: 1.2, label: '⛈️ Thunderstorm', tip: 'Heavy rain and lightning. Slippery, and hidden potholes!' },
  haze: { chance: 1.5, label: '🌫️ Haze', tip: "Haze hides the road far ahead. Watch closely!" },
};

export const TIMES: Record<TimeId, { chance: number; label: string }> = {
  day: { chance: 5, label: 'Day' },
  sunset: { chance: 2, label: '🌅 Sunset' },
  night: { chance: 2.5, label: '🌙 Night' },
};

/** What the weather does to driving. */
export const WEATHER_EFFECTS = {
  rainGrip: 0.6, // on a wet road, lane changes / braking / gas respond this much as fast
  puddleRevealDistance: 210, // potholes look like puddles until this close (world units)
  rainDrops: 90,
  stormDrops: 170,
  lightningChancePerSecond: 0.25,
  hazeClearDistance: 330, // the road is clear this far ahead of the car; fades out beyond
};

/** Sky colours (palette keys): top of the sky fading to the horizon. */
export const SKIES: Record<TimeId, { top: ColourKey; middle: ColourKey; horizon: ColourKey }> = {
  day: { top: 'c', middle: 'c', horizon: 'f' },
  sunset: { top: '2', middle: '8', horizon: '9' },
  night: { top: '0', middle: '1', horizon: '2' },
};

/** Tints laid over the whole scene (CSS colours with transparency). */
export const TINTS = {
  sunset: 'rgba(255, 120, 40, 0.16)',
  night: 'rgba(8, 10, 40, 0.55)',
  rain: 'rgba(40, 50, 80, 0.22)',
  storm: 'rgba(20, 24, 50, 0.38)',
  haze: 'rgba(190, 160, 120, 0.38)',
  lightning: 'rgba(255, 255, 255, 0.75)',
};
