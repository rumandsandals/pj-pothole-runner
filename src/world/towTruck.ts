import { TOW } from '../config/game';
import { TOW_TRUCK_SPRITE } from '../config/sprites';
import { THEME } from '../config/theme';
import type { Car, TowTruck } from '../core/state';
import { carSpriteBox } from './car';
import { ART_GROUND, drawSprite, drawText, fill, toPx } from './pixels';

/** Moves the truck in, then waits while it hooks the car. Returns true when done. */
export function updateTowTruck(tow: TowTruck): boolean {
  if (tow.phase === 'incoming') {
    tow.x -= TOW.speed;
    if (tow.x <= TOW.stopAtX) {
      tow.x = TOW.stopAtX;
      tow.phase = 'towing';
    }
    return false;
  }
  tow.waited++;
  return tow.waited >= TOW.waitTicks;
}

const SPRITE_W = TOW_TRUCK_SPRITE[0]?.length ?? 0;
const SPRITE_H = TOW_TRUCK_SPRITE.length;
const HOOK_X = 2; // where the hook hangs in the sprite
const HOOK_Y = 4;

export function drawTowTruck(ctx: CanvasRenderingContext2D, tow: TowTruck, car: Car): void {
  if (!tow.active || !tow.option) return;
  const colours = tow.option.licensed ? THEME.tow.licensed : THEME.tow.cheap;
  const left = toPx(tow.x) - Math.floor(SPRITE_W / 2);
  const top = ART_GROUND - SPRITE_H + 1;

  drawSprite(ctx, TOW_TRUCK_SPRITE, left, top, { X: colours.body, Y: colours.stripe, Z: colours.cab });
  drawText(ctx, tow.option.truckLabel, left + SPRITE_W / 2, top - 8, colours.label, { align: 'center', shadow: '0' });

  // Chain from the hook to the car's roof
  if (tow.phase === 'towing') {
    const box = carSpriteBox(car);
    const x0 = left + HOOK_X;
    const y0 = top + HOOK_Y;
    const x1 = box.left + box.width - 6;
    const y1 = box.top;
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = 0; s <= steps; s += 2) {
      fill(ctx, THEME.tow.chain, x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps, 1, 1);
    }
  }
}
