import type { TowOption } from '../config/towTrucks';
import { byId, make } from './dom';
import { showScreen } from './overlays';

export function showTowChoices(options: TowOption[], onPick: (option: TowOption) => void): void {
  const box = byId('towCards');
  box.replaceChildren();
  for (const option of options) {
    const card = make('div', `tow-card ${option.licensed ? 'good-card' : 'bad-card'}`);
    card.append(
      make('div', 'tow-name', option.name),
      make('div', 'tow-tag', option.tag),
      make('div', 'tow-desc', option.description),
      make('div', 'tow-price', option.priceLabel),
    );
    const button = make('button', `btn tow-btn${option.licensed ? '' : ' bad'}`, option.buttonLabel);
    button.addEventListener('click', () => onPick(option), { once: true });
    card.appendChild(button);
    box.appendChild(card);
  }
  showScreen('tow');
}
