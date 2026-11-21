import { THEME } from '../config/theme';
import type { Particle } from '../core/state';

/** Floating text like "-15HP" or "STUCK!". */
export function addFloatingText(particles: Particle[], x: number, y: number, text: string, life = 35, size = 11): void {
  particles.push({ x, y, vx: 0, text, color: THEME.particleText, life, size });
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
  ctx.textAlign = 'center';
  for (const p of particles) {
    ctx.globalAlpha = Math.min(p.life / 30, 1);
    ctx.fillStyle = p.color;
    ctx.font = `bold ${p.size}px ${THEME.font}`;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}
