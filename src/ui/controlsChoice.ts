import { TEXT } from '../config/text';
import { byId } from './dom';

/**
 * TOUCHSCREEN OR KEYBOARD?
 * The first time you play, a dialog asks which controls you want:
 *   touch    = on-screen joystick + JUMP (phones, iPads)
 *   keyboard = on-screen arrow keys + JUMP (computers; real keys always work too)
 * The choice is remembered on this device. Change it any time from the
 * CONTROLS button on the title screen.
 */

export type ControlStyle = 'touch' | 'keyboard';

const KEY = 'pjPotholeRunner.controls';

/** What this device looks like it wants (used to mark the recommended choice). */
export const suggestedControls = (): ControlStyle => (matchMedia('(pointer: coarse)').matches ? 'touch' : 'keyboard');

export function savedControls(): ControlStyle | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'touch' || value === 'keyboard' ? value : null;
  } catch {
    return null;
  }
}

/** Shows the chosen controls (styles follow <body data-touch>) and remembers the choice. */
export function useControls(style: ControlStyle, remember = true): void {
  if (style === 'touch') document.body.dataset.touch = 'yes';
  else delete document.body.dataset.touch;
  if (remember) {
    try {
      localStorage.setItem(KEY, style);
    } catch {
      /* private browsing: fine, we'll just ask again next time */
    }
  }
  byId('controlsLabel').textContent = style === 'touch' ? TEXT.controlsTouchShort : TEXT.controlsKeyboardShort;
}

/** Marks the recommended option in the dialog. */
export function markSuggestedControls(): void {
  const suggested = suggestedControls();
  document.querySelectorAll<HTMLElement>('.control-choice').forEach((el) => {
    el.classList.toggle('suggested', el.dataset.action === `controls-${suggested}`);
  });
}
