import { WORKSHOP } from '../config/game';
import { TEXT } from '../config/text';
import type { WorkshopChoice, WorkshopStep } from '../config/workshop';
import type { WorkshopLogEntry } from '../core/state';
import { byId, formatRM, make } from './dom';
import { hidePanels, hideScreens } from './overlays';

function renderLog(container: HTMLElement, log: WorkshopLogEntry[]): void {
  container.replaceChildren(...log.map((entry) => make('div', entry.good ? 'log-good' : 'log-bad', entry.text)));
}

export function showWorkshopStep(
  step: WorkshopStep,
  index: number,
  total: number,
  bill: number,
  log: WorkshopLogEntry[],
  onChoose: (choice: WorkshopChoice) => void,
): void {
  hideScreens();
  byId('wsStepLabel').textContent = `Step ${index + 1} of ${total} — ${step.icon} ${step.title}`;
  byId('wsBillNum').textContent = formatRM(bill);
  byId('wsBillFill').style.width = `${Math.min((bill / WORKSHOP.meterMax) * 100, 100)}%`;
  byId('wsBillBase').textContent = `${formatRM(WORKSHOP.startingBill)} base`;
  byId('wsBillMax').textContent = `${formatRM(WORKSHOP.meterMax)}+`;
  byId('wsQuestion').textContent = `${step.icon} ${step.question}`;

  const box = byId('wsChoices');
  box.replaceChildren();
  for (const choice of step.choices) {
    const button = make('button', `ws-choice ${choice.good ? 'good' : 'bad'}`, choice.label);
    button.addEventListener('click', () => onChoose(choice), { once: true });
    box.appendChild(button);
  }
  renderLog(byId('wsLog'), log);

  const panel = byId('wsPanel');
  panel.classList.add('show');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function showWorkshopEnd(bill: number, log: WorkshopLogEntry[], onContinue: () => void): void {
  hidePanels();
  const saved = WORKSHOP.startingBill - bill;
  byId('wsEndTitle').textContent = bill < WORKSHOP.goodResultBelow ? TEXT.workshopGoodEnd : TEXT.workshopBadEnd;
  byId('wsEndBill').textContent = formatRM(bill);
  byId('wsEndSaved').textContent =
    saved > 0
      ? `You saved ${formatRM(saved)} by making smart choices!`
      : `You overpaid ${formatRM(Math.abs(saved))} through bad decisions.`;
  renderLog(byId('wsEndLog'), log);

  const button = byId('wsEndBtn');
  button.textContent = `▶ BACK ON THE ROAD (−${formatRM(bill)})`;
  button.onclick = () => {
    button.onclick = null;
    onContinue();
  };

  const panel = byId('wsEndPanel');
  panel.classList.add('show');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
