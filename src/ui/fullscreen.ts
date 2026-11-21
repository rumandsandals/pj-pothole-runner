import { FULL_SCREEN } from '../config/game';
import { TEXT } from '../config/text';
import { byId } from './dom';
import { showToast } from './overlays';

/**
 * FULL SCREEN
 * Hides the browser's address bar and tabs. Works on computers, Android and iPad.
 * iPhones don't allow it for web pages — there, "Add to Home Screen" opens the
 * game as its own full-screen app (set up by public/manifest.webmanifest).
 */

type Doc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
type El = HTMLElement & { webkitRequestFullscreen?: () => void };

const doc = document as Doc;
const root = document.documentElement as El;

export const canGoFullScreen = (): boolean => Boolean(root.requestFullscreen || root.webkitRequestFullscreen);
export const isFullScreen = (): boolean => Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
/** Already running as a Home Screen app (no browser bars to hide). */
const isInstalledApp = (): boolean =>
  matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export function enterFullScreen(): void {
  if (isFullScreen() || !canGoFullScreen()) return;
  try {
    const request = root.requestFullscreen ? root.requestFullscreen({ navigationUI: 'hide' }) : root.webkitRequestFullscreen?.();
    void Promise.resolve(request).catch(() => {}); // the browser may say no; the game still works
  } catch {
    /* not allowed here — fine */
  }
}

export function exitFullScreen(): void {
  if (!isFullScreen()) return;
  if (doc.exitFullscreen) void doc.exitFullscreen().catch(() => {});
  else doc.webkitExitFullscreen?.();
}

const toggle = (): void => {
  if (!canGoFullScreen()) {
    showToast(TEXT.fullScreenIphoneTip);
    return;
  }
  if (isFullScreen()) exitFullScreen();
  else enterFullScreen();
};

/** The ⛶ button in the corner, plus the F key. */
export function bindFullScreen(): void {
  const button = byId('fsBtn');
  if (isInstalledApp()) {
    button.hidden = true; // already full screen
    return;
  }
  const refresh = (): void => {
    button.textContent = isFullScreen() ? TEXT.fullScreenExit : TEXT.fullScreenEnter;
  };
  button.addEventListener('click', toggle);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') toggle();
  });
  document.addEventListener('fullscreenchange', refresh);
  document.addEventListener('webkitfullscreenchange', refresh);
  refresh();
}

/** Called when START is pressed: phones and tablets go full screen automatically. */
export function autoFullScreen(): void {
  if (FULL_SCREEN.autoOnTouchDevices && matchMedia('(pointer: coarse)').matches) enterFullScreen();
}
