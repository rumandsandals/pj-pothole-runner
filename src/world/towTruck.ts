import { TOW } from '../config/game';
import { VEHICLE_ART } from '../config/sprites';
import { THEME } from '../config/theme';
import type { Car, TowTruck } from '../core/state';
import { carSpriteBox, drawVehicleArt, wheelFrame } from './car';
import { laneY } from './lanes';
import { drawText, fill, toPx } from './pixels';

/** Moves the truck in, then waits while it hooks the car. Returns true when done. */
export function updateTowTruck(tow: TowTruck, car: Car): boolean {
  if (tow.phase === 'incoming') {
    tow.x -= TOW.speed;
    if (tow.x <= car.x + TOW.stopAhead) {
      tow.x = car.x + TOW.stopAhead;
      tow.phase = 'towing';
    }
    return false;
  }
  tow.waited++;
  return tow.waited >= TOW.waitTicks;
}

const ART = VEHICLE_ART.towTruck;
const BODY_W = ART.body[0]?.length ?? 0;
const HEIGHT = ART.body.length;
const HOOK_X = 3; // where the hook hangs in the sprite
const HOOK_Y = 12;

export function drawTowTruck(ctx: CanvasRenderingContext2D, tow: TowTruck, car: Car, time: number): void {
  if (!tow.active || !tow.option) return;
  const colours = tow.option.licensed ? THEME.tow.licensed : THEME.tow.cheap;
  const left = toPx(tow.x) - Math.floor(BODY_W / 2);
  const top = toPx(laneY(car.lanePos)) - HEIGHT + 1; // parks in the car's lane

  // Body rocks while driving, then bounces once as it brakes
  let bob = 0;
  if (tow.phase === 'incoming') bob = Math.floor(time / 5) % 2;
  else if (tow.waited < 8) bob = tow.waited < 4 ? 2 : 0;

  const box = { left, top, width: BODY_W, height: HEIGHT };
  drawVehicleArt(ctx, ART, box, { X: colours.body, Y: colours.stripe, Z: colours.cab }, wheelFrame(tow.x), bob);
  drawText(ctx, tow.option.truckLabel, left + BODY_W / 2, top - 14, colours.label, { align: 'center', shadow: '0' });

  // Flashing beacon on the cab roof
  if (Math.floor(time / 8) % 2 === 0) {
    fill(ctx, '9', left + 62, top + 1 + bob, 6, 3);
    fill(ctx, 'a', left + 64, top + 1 + bob, 2, 1);
  } else {
    fill(ctx, '4', left + 62, top + 2 + bob, 6, 2);
  }

  // Chain from the hook to the car's roof
  if (tow.phase === 'towing') {
    const carBox = carSpriteBox(car);
    const x0 = left + HOOK_X;
    const y0 = top + HOOK_Y + bob;
    const x1 = carBox.left + carBox.width - 14;
    const y1 = carBox.top + 2;
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let s = 0; s <= steps; s += 3) {
      fill(ctx, THEME.tow.chain, x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps, 2, 2);
    }
  }
}
