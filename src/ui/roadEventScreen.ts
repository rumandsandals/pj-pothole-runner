import type { EventChoice, RoadEvent } from '../config/roadEvents';
import { byId, make } from './dom';
import { showScreen } from './overlays';

export function showRoadEvent(event: RoadEvent, onChoose: (choice: EventChoice) => void): void {
  byId('evTitle').textContent = event.title;
  byId('evDesc').textContent = event.description;
  const box = byId('evChoices');
  box.replaceChildren();
  for (const choice of event.choices) {
    const button = make('button', `btn${choice.tone === 'bad' ? ' bad' : ''}`, choice.label);
    button.addEventListener('click', () => onChoose(choice), { once: true });
    box.appendChild(button);
  }
  showScreen('event');
}
