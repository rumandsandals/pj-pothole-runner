import { EFFECTS } from '../config/game';
import { TEXT } from '../config/text';
import { byId } from './dom';

const SCREENS = {
  menu: 'ovMenu',
  howto: 'ovHowTo',
  event: 'ovEvent',
  tow: 'ovTow',
  dead: 'ovDead',
  win: 'ovWin',
} as const;

export type ScreenName = keyof typeof SCREENS;

const PANELS = ['wsPanel', 'wsEndPanel'];

/** Fills every element marked data-text="..." with the matching entry from text.ts. */
export function fillStaticText(): void {
  document.querySelectorAll<HTMLElement>('[data-text]').forEach((el) => {
    const key = el.dataset.text as keyof typeof TEXT;
    if (!(key in TEXT)) throw new Error(`text.ts has no entry called "${key}"`);
    el.innerHTML = TEXT[key];
  });
}

export function hideScreens(): void {
  for (const id of Object.values(SCREENS)) byId(id).classList.remove('show');
}

export function hidePanels(): void {
  for (const id of PANELS) byId(id).classList.remove('show');
}

export function showScreen(name: ScreenName): void {
  hideScreens();
  hidePanels();
  byId(SCREENS[name]).classList.add('show');
}

let toastTimer: number | undefined;
export function showToast(message: string): void {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), EFFECTS.toastMs);
}

export function hideToast(): void {
  window.clearTimeout(toastTimer);
  byId('toast').classList.remove('show');
}

export function flash(ms: number): void {
  const el = byId('flash');
  el.classList.add('show');
  window.setTimeout(() => el.classList.remove('show'), ms);
}

/** A small message over the road that doesn't hide the action (used while the tow truck arrives). */
export function showBanner(title: string, text: string): void {
  byId('bannerTitle').textContent = title;
  byId('bannerText').textContent = text;
  byId('banner').classList.add('show');
}

export function hideBanner(): void {
  byId('banner').classList.remove('show');
}
