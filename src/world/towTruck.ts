import { TOW } from '../config/game';
import { TOW_TRUCK_BODY_SPRITE, WHEEL_FRAME_1, WHEEL_POSITIONS } from '../config/sprites';
import { THEME } from '../config/theme';
import type { Car, TowTruck } from '../core/state';
import { carSpriteBox, wheelFrame } from './car';
import { laneY } from './lanes';
import { drawSprite, drawText, fill, toPx } from './pixels';

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

const BODY_W = TOW_TRUCK_BODY_SPRITE[0]?.length ?? 0;
const BODY_H = TOW_TRUCK_BODY_SPRITE.length;
const HEIGHT = BODY_H + WHEEL_FRAME_1.length;
const HOOK_X = 2; // where the hook hangs in the sprite
const HOOK_Y = 4;

export function drawTowTruck(ctx: CanvasRenderingContext2D, tow: TowTruck, car: Car, time: number): void {
  if (!tow.active || !tow.option) return;
  const colours = tow.option.licensed ? THEME.tow.licensed : THEME.tow.cheap;
  const left = toPx(tow.x) - Math.floor(BODY_W / 2);
  const top = toPx(laneY(car.lanePos)) - HEIGHT + 1; // parks in the car's lane

  // Body rocks while driving, then bounces once as it brakes
  let bob = 0;
  if (tow.phase === 'incoming') bob = Math.floor(time / 5) % 2;
  else if (tow.waited < 8) bob = tow.waited < 4 ? 1 : 0;

  for (const wx of WHEEL_POSITIONS.truck) {
    drawSprite(ctx, wheelFrame(tow.x), left + wx, top + BODY_H);
  }
  drawSprite(ctx, TOW_TRUCK_BODY_SPRITE, left, top + bob, { X: colours.body, Y: colours.stripe, Z: colours.cab });
  drawText(ctx, tow.option.truckLabel, left + BODY_W / 2, top - 8, colours.label, { align: 'center', shadow: '0' });

  // Flashing beacon on the cab roof
  if (Math.floor(time / 8) % 2 === 0) fill(ctx, '9', left + BODY_W - 6, top + 1 + bob, 2, 1);

  // Chain from the hook to the car's roof
  if (tow.phase === 'towing') {
    const box = carSpriteBox(car);
    const x0 = left + HOOK_X;
    const y0 = top + HOOK_Y + bob;
    const x1 = box.left + box.width - 6;
    const y1 = box.top;
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let s = 0; s <= steps; s += 2) {
      fill(ctx, THEME.tow.chain, x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps, 1, 1);
    }
  }
}
