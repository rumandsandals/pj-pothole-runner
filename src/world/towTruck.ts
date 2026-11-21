import { TOW, WORLD } from '../config/game';
import { THEME } from '../config/theme';
import type { Car, TowTruck } from '../core/state';

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

export function drawTowTruck(ctx: CanvasRenderingContext2D, tow: TowTruck, car: Car): void {
  if (!tow.active || !tow.option) return;
  const g = WORLD.groundY;
  const x = tow.x;
  const t = THEME.tow;
  const colours = tow.option.licensed ? t.licensed : t.cheap;

  // Body + cab + window
  ctx.fillStyle = colours.body;
  ctx.fillRect(x - 35, g - 38, 70, 28);
  ctx.fillStyle = colours.cab;
  ctx.fillRect(x + 20, g - 50, 30, 22);
  ctx.fillStyle = t.window;
  ctx.fillRect(x + 23, g - 47, 20, 12);

  // Crane arm + hook
  ctx.strokeStyle = t.crane;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 10, g - 38);
  ctx.lineTo(x - 10, g - 62);
  ctx.lineTo(x + 6, g - 62);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 6, g - 57, 5, 0, Math.PI * 2);
  ctx.stroke();

  // Wheels
  for (const wx of [x - 22, x + 18]) {
    ctx.fillStyle = t.tyre;
    ctx.fillRect(wx - 6, g - 12, 14, 10);
    ctx.fillStyle = t.rim;
    ctx.fillRect(wx - 4, g - 10, 10, 6);
  }

  // Label
  ctx.fillStyle = colours.label;
  ctx.font = `bold 7px ${THEME.font}`;
  ctx.textAlign = 'center';
  ctx.fillText(tow.option.truckLabel, x, g - 42);

  // Chain to the car
  if (tow.phase === 'towing') {
    ctx.strokeStyle = t.chain;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(x - 35, g - 28);
    ctx.lineTo(car.x + 22, car.y - 11 + car.sinkY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
