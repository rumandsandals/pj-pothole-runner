/** Finds an element by id, with a clear message if index.html is missing it. */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`index.html is missing an element with id="${id}"`);
  return el as T;
}

export function make<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

export const formatRM = (amount: number): string => `RM ${amount.toLocaleString('en-MY')}`;
