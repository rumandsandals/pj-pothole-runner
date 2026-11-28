import { JOYSTICK } from '../config/game';

export interface Controls {
  jump: () => void;
  lane: (step: 1 | -1) => void; // +1 = one lane up (further), -1 = one lane down (nearer)
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
 *   Space = jump · ↑/W = lane up · ↓/S = lane down · hold ←/A = brake · hold →/D = gas
 *   Tap the road = jump · swipe up/down on the road = change lane
 *   On-screen buttons: ▲ LANE · ▼ LANE · JUMP · hold ◀ BRAKE / GAS ▶
 *   Touchscreen controls: a joystick instead of the arrow buttons (see bindJoystick;
 *   the player picks touchscreen or keyboard in src/ui/controlsChoice.ts)
 */
export function bindInput(
  canvas: HTMLCanvasElement,
  buttons: { jump: HTMLElement; up: HTMLElement; down: HTMLElement; brake: HTMLElement; gas: HTMLElement; joystick: HTMLElement; knob: HTMLElement },
  controls: Controls,
): void {
  // Brake and gas are "hold" controls: track what's held, from keys and buttons
  let brakeHeld = false;
  let gasHeld = false;
  let joyThrottle: -1 | 0 | 1 = 0; // from the joystick
  const updateThrottle = (): void => {
    const brake = brakeHeld || joyThrottle < 0;
    const gas = gasHeld || joyThrottle > 0;
    controls.throttle(gas === brake ? 0 : gas ? 1 : -1);
  };

  document.addEventListener('keydown', (e) => {
    if (JUMP_KEYS.has(e.key)) controls.jump();
    else if (UP_KEYS.has(e.key)) controls.lane(1);
    else if (DOWN_KEYS.has(e.key)) controls.lane(-1);
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
    else if (moved > SWIPE_PX) controls.lane(-1);
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
  press(buttons.down, () => controls.lane(-1));

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

  bindJoystick(buttons.joystick, buttons.knob, controls, (value) => {
    joyThrottle = value;
    updateThrottle();
  });
}

/**
 * The on-screen joystick. Drag the knob:
 *   up / down = change lane (keep holding to move again) · left = brake · right = gas
 * Diagonals work too (e.g. up-right = change lane while on the gas).
 */
function bindJoystick(base: HTMLElement, knob: HTMLElement, controls: Controls, setThrottle: (value: -1 | 0 | 1) => void): void {
  let pointer: number | null = null;
  let laneDir: 1 | -1 | 0 = 0;
  let repeat: number | undefined;
  let throttle: -1 | 0 | 1 = 0;

  const setLane = (dir: 1 | -1 | 0): void => {
    if (dir === laneDir) return;
    laneDir = dir;
    window.clearInterval(repeat);
    if (dir === 0) return;
    controls.lane(dir);
    repeat = window.setInterval(() => controls.lane(dir), JOYSTICK.laneRepeatMs);
  };

  const move = (e: PointerEvent): void => {
    const box = base.getBoundingClientRect();
    const reach = box.width / 2 - knob.offsetWidth / 2; // how far the knob can travel
    let dx = (e.clientX - (box.left + box.width / 2)) / reach;
    let dy = (e.clientY - (box.top + box.height / 2)) / reach;
    const length = Math.hypot(dx, dy);
    if (length > 1) (dx /= length), (dy /= length);
    knob.style.transform = `translate(calc(-50% + ${dx * reach}px), calc(-50% + ${dy * reach}px))`;

    const live = Math.hypot(dx, dy) > JOYSTICK.deadZone;
    const next: -1 | 0 | 1 = live && dx > JOYSTICK.pedalAt ? 1 : live && dx < -JOYSTICK.pedalAt ? -1 : 0;
    if (next !== throttle) {
      throttle = next;
      setThrottle(next);
    }
    setLane(live && dy < -JOYSTICK.laneAt ? 1 : live && dy > JOYSTICK.laneAt ? -1 : 0);
    base.classList.toggle('gas', throttle > 0);
    base.classList.toggle('brake', throttle < 0);
    base.classList.toggle('up', laneDir > 0);
    base.classList.toggle('down', laneDir < 0);
  };

  const release = (): void => {
    pointer = null;
    knob.style.transform = '';
    base.classList.remove('active', 'gas', 'brake', 'up', 'down');
    setLane(0);
    if (throttle !== 0) {
      throttle = 0;
      setThrottle(0);
    }
  };

  base.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (pointer !== null) return;
    pointer = e.pointerId;
    base.classList.add('active');
    try {
      base.setPointerCapture(e.pointerId); // keep steering even if the thumb slides off
    } catch {
      /* fine without it */
    }
    move(e);
  });
  base.addEventListener('pointermove', (e) => {
    if (e.pointerId === pointer) move(e);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    base.addEventListener(type, (e) => {
      if (e.pointerId === pointer) release();
    });
  }
  base.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('blur', release);
}
