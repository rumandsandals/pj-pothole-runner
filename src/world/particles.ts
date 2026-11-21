import { THEME, type ColourKey } from '../config/theme';
import type { Particle } from '../core/state';
import { drawText, toPx } from './pixels';

/** Floating text like "-15HP" or "STUCK!". */
export function addFloatingText(
  particles: Particle[],
  x: number,
  y: number,
  text: string,
  colour: ColourKey,
  life = 35,
  scale = 1,
): void {
  particles.push({ x, y, vx: 0, text, colour, life, scale });
}

export function updateParticles(particles: Particle[]): Particle[] {
  for (const p of particles) {
    p.life--;
    p.y -= 1.3;
    p.x += p.vx;
  }
  return particles.filter((p) => p.life > 0);
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    // Flicker out during the last few frames instead of fading (arcade style)
    if (p.life < 12 && p.life % 4 < 2) continue;
    drawText(ctx, p.text, toPx(p.x), toPx(p.y), p.colour, {
      align: 'center',
      scale: p.scale,
      shadow: THEME.particles.shadow,
    });
  }
}
