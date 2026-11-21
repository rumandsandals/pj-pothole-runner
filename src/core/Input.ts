import type { Lane } from '../world/lanes';

export interface Controls {
  jump: () => void;
  lane: (lane: Lane) => void;
  throttle: (value: -1 | 0 | 1) => void;
}

const JUMP_KEYS = new Set([' ']);
const UP_KEYS = new Set(['ArrowUp', 'w', 'W']);
const DOWN_KEYS = new Set(['ArrowDown', 's', 'S']);
const BRAKE_KEYS = new Set(['ArrowLeft', 'a', 'A']);
const GAS_KEYS = new Set(['ArrowRight', 'd', 'D']);
const SWIPE_PX = 24; // finger movement that counts as a swipe rather than a tap

/**
 * Keyboard, mouse and touch controls.
 *   Space = jump · ↑/W = far lane · ↓/S = near lane · hold ←/A = brake · hold →/D = gas
 *   Tap the road = jump · swipe up/down on the road = change lane
 *   On-screen buttons: ▲ LANE · ▼ LANE · JUMP · hold ◀ BRAKE / GAS ▶
 */
export function bindInput(
  canvas: HTMLCanvasElement,
  buttons: { jump: HTMLElement; up: HTMLElement; down: HTMLElement; brake: HTMLElement; gas: HTMLElement },
  controls: Controls,
): void {
  // Brake and gas are "hold" controls: track what's held, from keys and buttons
  let brakeHeld = false;
  let gasHeld = false;
  const updateThrottle = (): void => controls.throttle(gasHeld === brakeHeld ? 0 : gasHeld ? 1 : -1);

  document.addEventListener('keydown', (e) => {
    if (JUMP_KEYS.has(e.key)) controls.jump();
    else if (UP_KEYS.has(e.key)) controls.lane(1);
    else if (DOWN_KEYS.has(e.key)) controls.lane(0);
    else if (BRAKE_KEYS.has(e.key)) (brakeHeld = true), updateThrottle();
    else if (GAS_KEYS.has(e.key)) (gasHeld = true), updateThrottle();
    else return;
    e.preventDefault(); // stop the page scrolling or a focused button being pressed
  });
  document.addEventListener('keyup', (e) => {
    if (BRAKE_KEYS.has(e.key)) (brakeHeld = false), updateThrottle();
    else if (GAS_KEYS.has(e.key)) (gasHeld = false), updateThrottle();
  });
  // Let go of everything if the window loses focus mid-press
  window.addEventListener('blur', () => {
    brakeHeld = gasHeld = false;
    updateThrottle();
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

  const hold = (el: HTMLElement, set: (held: boolean) => void): void => {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      el.classList.add('held');
      set(true);
      updateThrottle();
      try {
        el.setPointerCapture(e.pointerId); // keep holding even if the thumb slides a little
      } catch {
        /* fine without it */
      }
    });
    const release = (): void => {
      el.classList.remove('held');
      set(false);
      updateThrottle();
    };
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) el.addEventListener(type, release);
    el.addEventListener('contextmenu', (e) => e.preventDefault()); // long-press menu on phones
  };
  hold(buttons.brake, (held) => (brakeHeld = held));
  hold(buttons.gas, (held) => (gasHeld = held));
}
