const JUMP_KEYS = new Set([' ', 'ArrowUp', 'w', 'W']);

/** Keyboard, mouse and touch controls. All of them call onJump. */
export function bindInput(canvas: HTMLCanvasElement, jumpButton: HTMLElement, onJump: () => void): void {
  document.addEventListener('keydown', (e) => {
    if (!JUMP_KEYS.has(e.key)) return;
    e.preventDefault(); // stop Space from scrolling the page or pressing a button
    onJump();
  });

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    onJump();
  });

  jumpButton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    onJump();
  });
}
