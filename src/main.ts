import '@fontsource/press-start-2p/400.css';
import '@fontsource/vt323/400.css';
import './style.css';
import { sound } from './audio/sound';
import { bindInput } from './core/Input';
import { Game } from './core/Game';
import { validateConfig } from './core/validateConfig';
import { Viewport } from './core/Viewport';
import { byId } from './ui/dom';
import { fillStaticText, showScreen } from './ui/overlays';
import { bindSoundControls } from './ui/soundControls';

const problems = validateConfig();
if (problems.length > 0) {
  console.error('PJ Pothole Runner settings problems:\n- ' + problems.join('\n- '));
}

fillStaticText();

const canvas = byId<HTMLCanvasElement>('game');
const viewport = new Viewport(canvas);
const game = new Game(canvas, viewport);

// While developing, `game` is reachable from the browser console for testing.
if (import.meta.env.DEV) Object.assign(window, { game, sound });

bindInput(canvas, byId('jumpBtn'), () => game.jump());

// Browsers allow sound only after the player clicks or presses a key.
for (const type of ['pointerdown', 'keydown'] as const) {
  document.addEventListener(type, () => sound.unlock(), { capture: true });
}
bindSoundControls();

// Menu buttons: any element with data-action="start" | "howto" | "menu"
document.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  sound.play('click');
  if (action === 'start') game.start();
  else if (action === 'howto') showScreen('howto');
  else if (action === 'menu') game.showMenu();
});

showScreen('menu');
