import { LAYOUT, WORLD } from '../config/game';

/**
 * Fits the game to any screen: keeps the road's shape, fills the space
 * available, and draws at full sharpness on Retina / high-DPI displays.
 */
export class Viewport {
  private pixelRatio = 1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('resize', () => this.fit());
    window.addEventListener('orientationchange', () => this.fit());
    this.fit();
  }

  fit(): void {
    const aspect = WORLD.width / WORLD.height;
    const availableWidth = Math.min(window.innerWidth - LAYOUT.sideGutter * 2, LAYOUT.maxWidth);
    const availableHeight = Math.max(window.innerHeight - LAYOUT.reservedHeight, 100);

    let width = Math.min(availableWidth, availableHeight * aspect);
    width = Math.max(width, Math.min(availableWidth, LAYOUT.minWidth));
    width = Math.floor(width);
    const height = Math.round(width / aspect);

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.pixelRatio = this.canvas.width / WORLD.width;

    const root = document.documentElement.style;
    root.setProperty('--game-width', `${width}px`);
    root.setProperty('--ui-scale', String(Math.min(Math.max(width / WORLD.width, 0.85), 1.6)));
  }

  /** Call before drawing so world units map to screen pixels. */
  apply(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }
}
