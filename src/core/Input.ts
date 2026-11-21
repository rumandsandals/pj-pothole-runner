import type { Lane } from '../world/lanes';

export interface Controls {
  jump: () => void;
  lane: (lane: Lane) => void;
}

const JUMP_KEYS = new Set([' ']);
const UP_KEYS = new Set(['ArrowUp', 'w', 'W']);
const DOWN_KEYS = new Set(['ArrowDown', 's', 'S']);
const SWIPE_PX = 24; // finger movement that counts as a swipe rather than a tap

/**
 * Keyboard, mouse and touch controls.
 *   Space = jump · ↑/W = far lane · ↓/S = near lane
 *   Tap the road = jump · swipe up/down on the road = change lane
 *   On-screen buttons: ▲ LANE · JUMP · ▼ LANE
 */
export function bindInput(
  canvas: HTMLCanvasElement,
  buttons: { jump: HTMLElement; up: HTMLElement; down: HTMLElement },
  controls: Controls,
): void {
  document.addEventListener('keydown', (e) => {
    if (JUMP_KEYS.has(e.key)) controls.jump();
    else if (UP_KEYS.has(e.key)) controls.lane(1);
    else if (DOWN_KEYS.has(e.key)) controls.lane(0);
    else return;
    e.preventDefault(); // stop the page scrolling or a focused button being pressed
  });

  // Road: tap = jump, swipe = lane change (decided when the finger lifts)
  let startY: number | null = null;
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startY = e.clientY;
  });
  canvas.addEventListener('pointerup', (e) => {
    if (startY === null) return;
    const moved = e.clientY - startY;
    startY = null;
    if (moved < -SWIPE_PX) controls.lane(1);
    else if (moved > SWIPE_PX) controls.lane(0);
    else controls.jump();
  });
  canvas.addEventListener('pointercancel', () => (startY = null));

  const press = (el: HTMLElement, action: () => void): void =>
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      action();
    });
  press(buttons.jump, controls.jump);
  press(buttons.up, () => controls.lane(1));
  press(buttons.down, () => controls.lane(0));
}
