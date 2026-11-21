import { LAYOUT } from '../config/game';
import { ART_HEIGHT, ART_WIDTH } from '../world/pixels';

/**
 * Fits the game to any screen: keeps the road's shape, fills the space
 * available, and scales the pixel art by whole numbers where possible so
 * every pixel is the same size (crisp on Retina / high-DPI displays too).
 */
export class Viewport {
  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('resize', () => this.fit());
    window.addEventListener('orientationchange', () => this.fit());
    this.fit();
  }

  fit(): void {
    const aspect = ART_WIDTH / ART_HEIGHT;
    const availableWidth = Math.min(window.innerWidth - LAYOUT.sideGutter * 2, LAYOUT.maxWidth);
    const availableHeight = Math.max(window.innerHeight - LAYOUT.reservedHeight, 100);

    let cssWidth = Math.min(availableWidth, availableHeight * aspect);
    cssWidth = Math.max(cssWidth, Math.min(availableWidth, LAYOUT.minWidth));

    // Snap to a whole-number zoom of the pixel art if it costs < 15% of the size.
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    let deviceWidth = Math.floor(cssWidth * dpr);
    const zoom = Math.floor(deviceWidth / ART_WIDTH);
    if (zoom >= 1 && zoom * ART_WIDTH >= deviceWidth * 0.85) deviceWidth = zoom * ART_WIDTH;
    const deviceHeight = Math.round((deviceWidth * ART_HEIGHT) / ART_WIDTH);
    cssWidth = deviceWidth / dpr;

    this.canvas.width = deviceWidth;
    this.canvas.height = deviceHeight;
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${deviceHeight / dpr}px`;

    const root = document.documentElement.style;
    root.setProperty('--game-width', `${cssWidth}px`);
    root.setProperty('--ui-scale', String(Math.min(Math.max(cssWidth / 640, 0.85), 1.6)));
  }

  /**
   * Blows the low-res pixel art up to fill the screen, without blurring.
   * `shake` nudges the picture by whole art pixels for screen shake.
   */
  present(ctx: CanvasRenderingContext2D, art: HTMLCanvasElement, shake: [number, number] = [0, 0]): void {
    const zoom = this.canvas.width / ART_WIDTH;
    const [dx, dy] = shake;
    ctx.imageSmoothingEnabled = false;
    if (dx !== 0 || dy !== 0) {
      ctx.fillStyle = '#0b0b14';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    ctx.drawImage(art, Math.round(dx * zoom), Math.round(dy * zoom), this.canvas.width, this.canvas.height);
  }
}
