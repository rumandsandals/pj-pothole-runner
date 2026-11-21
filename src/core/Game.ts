import { CAR, ECONOMY, EFFECTS, LEVEL_LENGTH, TICKS_PER_SECOND, TOW, WORKSHOP } from '../config/game';
import { LEVELS } from '../config/levels';
import { POTHOLES } from '../config/potholes';
import { ROAD_EVENTS, type EventChoice, type RoadEventId } from '../config/roadEvents';
import { TEXT } from '../config/text';
import { THEME } from '../config/theme';
import { TOW_OPTIONS, type TowOption } from '../config/towTrucks';
import { WORKSHOP_STEPS, type WorkshopChoice } from '../config/workshop';
import { showDead, showWin } from '../ui/endScreens';
import { updateHud } from '../ui/hud';
import { flash, hideBanner, hidePanels, hideScreens, hideToast, showBanner, showScreen, showToast } from '../ui/overlays';
import { showRoadEvent } from '../ui/roadEventScreen';
import { showTowChoices } from '../ui/towScreen';
import { showWorkshopEnd, showWorkshopStep } from '../ui/workshopPanel';
import { canJump, jump, resetAfterRecovery, updateCar, updateSinking } from '../world/car';
import { addFloatingText, updateParticles } from '../world/particles';
import { findCollision, maybeSpawnPothole, movePotholes } from '../world/potholes';
import { ART_HEIGHT, ART_WIDTH, makeCanvas } from '../world/pixels';
import { render } from '../world/render';
import { generateRoad } from '../world/road';
import { updateTowTruck } from '../world/towTruck';
import { clampHealth, createState, createTow, currentLevel, type GameState } from './state';
import type { Viewport } from './Viewport';

const TICK_MS = 1000 / TICKS_PER_SECOND;
const MAX_FRAME_MS = 250; // after a pause (e.g. switching tabs), don't fast-forward

/**
 * Runs the game. Logic updates at a fixed 60 ticks per second no matter
 * how fast the screen refreshes; drawing happens every screen frame.
 */
export class Game {
  state: GameState = createState();
  private readonly ctx: CanvasRenderingContext2D;
  /** Small low-res canvas the pixel art is drawn on, before being scaled up. */
  private readonly art: HTMLCanvasElement;
  private readonly artCtx: CanvasRenderingContext2D;
  private lastTime = 0;
  private accumulator = 0;

  constructor(canvas: HTMLCanvasElement, private readonly viewport: Viewport) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('This browser cannot draw the game (no canvas support).');
    this.ctx = ctx;
    [this.art, this.artCtx] = makeCanvas(ART_WIDTH, ART_HEIGHT);
    updateHud(this.state);
    requestAnimationFrame((t) => this.frame(t));
  }

  // ── Main loop ───────────────────────────────────────────────
  private frame(now: number): void {
    if (this.lastTime === 0) this.lastTime = now;
    this.accumulator += Math.min(now - this.lastTime, MAX_FRAME_MS);
    this.lastTime = now;

    while (this.accumulator >= TICK_MS) {
      this.update();
      this.accumulator -= TICK_MS;
    }

    render(this.artCtx, this.state);
    this.viewport.present(this.ctx, this.art);
    requestAnimationFrame((t) => this.frame(t));
  }

  private update(): void {
    const s = this.state;
    s.particles = updateParticles(s.particles);

    if (s.mode === 'towArriving') {
      if (updateTowTruck(s.tow)) this.finishTow();
      return;
    }
    if (s.mode !== 'playing') return;

    const level = currentLevel(s);
    const car = s.car;
    updateCar(car);

    // Stuck in an ABYSS pothole: sink, then call the tow trucks.
    if (car.sinkY > 0) {
      if (updateSinking(car)) this.openTowChoice();
      return;
    }

    s.roadOffset += s.speed;
    maybeSpawnPothole(s.potholes, level, s.speed);
    s.potholes = movePotholes(s.potholes, s.speed);
    s.distance += s.speed;
    s.levelDistance += s.speed;
    s.tick++;

    if (!s.eventFired && level.event && s.levelDistance > level.eventAt) {
      s.eventFired = true;
      this.openRoadEvent(level.event);
      return;
    }

    if (s.levelDistance >= LEVEL_LENGTH) {
      if (s.level >= LEVELS.length) {
        this.win();
        return;
      }
      this.nextLevel();
    }

    s.score++;
    if (s.score % ECONOMY.passiveIncomeEvery === 0) {
      s.money += ECONOMY.passiveIncome;
      updateHud(s);
    }

    if (car.invulnerable <= 0 && !car.trapped) this.checkPotholeHit();
  }

  private checkPotholeHit(): void {
    const s = this.state;
    const car = s.car;
    const index = findCollision(car, s.potholes, CAR.hitboxInset);
    if (index < 0) return;
    const hole = s.potholes[index];
    if (!hole) return;
    const type = POTHOLES[hole.type];

    if (type.trapsCar) {
      // Keep the hole on screen, centred under the car, until it's rescued.
      hole.x = car.x;
      car.trapped = true;
      car.sinkTarget = CAR.sinkDepth;
      car.sinkY = 1;
      addFloatingText(s.particles, car.x, car.y - 50, 'STUCK!', THEME.particles.stuck, 60, 2);
      flash(EFFECTS.stuckFlashMs);
      return;
    }

    s.potholes.splice(index, 1);
    s.health = clampHealth(s.health - type.damage);
    car.invulnerable = CAR.invulnerableAfterHit;
    addFloatingText(s.particles, car.x, car.y - 40, `-${type.damage}HP`, THEME.particles.damage);
    flash(EFFECTS.hitFlashMs);
    updateHud(s);
    if (s.health <= 0) this.die();
  }

  private nextLevel(): void {
    const s = this.state;
    s.level++;
    s.levelDistance -= LEVEL_LENGTH;
    s.eventFired = false;
    const level = currentLevel(s);
    s.speed = level.speed;
    s.road = generateRoad(level.roughness);
    updateHud(s);
    showToast(`⬆️ LVL ${s.level}: ${level.name}`);
  }

  // ── Player actions ─────────────────────────────────────────
  start(): void {
    this.state = createState('playing');
    hideScreens();
    hidePanels();
    hideBanner();
    hideToast();
    updateHud(this.state);
  }

  jump(): void {
    const s = this.state;
    if (s.mode === 'playing' && canJump(s.car)) jump(s.car);
  }

  // ── Road events ─────────────────────────────────────────────
  private openRoadEvent(id: RoadEventId): void {
    this.state.mode = 'event';
    showRoadEvent(ROAD_EVENTS[id], (choice) => this.applyEventChoice(choice));
  }

  private applyEventChoice(choice: EventChoice): void {
    const s = this.state;
    s.money = Math.max(0, s.money + (choice.effect.money ?? 0));
    s.health = clampHealth(s.health + (choice.effect.hp ?? 0));
    updateHud(s);
    showToast(choice.message);
    hideScreens();
    if (s.health <= 0) this.die();
    else s.mode = 'playing';
  }

  // ── Tow trucks ──────────────────────────────────────────────
  private openTowChoice(): void {
    this.state.mode = 'towChoice';
    showTowChoices(TOW_OPTIONS, (option) => this.pickTow(option));
  }

  private pickTow(option: TowOption): void {
    const s = this.state;
    s.tow = { ...createTow(), active: true, option };
    s.mode = 'towArriving';
    hideScreens();
    showBanner(TEXT.towArrivingTitle, option.arrivingText);
  }

  private finishTow(): void {
    const s = this.state;
    const option = s.tow.option;
    s.tow = createTow();
    hideBanner();
    if (!option) return;

    if (option.licensed) {
      resetAfterRecovery(s.car);
      s.potholes = s.potholes.filter((p) => Math.abs(p.x - s.car.x) > s.car.width);
      s.money = Math.max(0, s.money - option.cost);
      s.health = clampHealth(s.health + TOW.licensedHeal);
      updateHud(s);
      showToast(`🚛 ${option.outcome}`);
      s.mode = 'playing';
      return;
    }

    showToast(option.outcome);
    s.mode = 'workshop';
    s.workshop = { bill: WORKSHOP.startingBill, step: 0, log: [] };
    this.showWorkshop();
  }

  // ── Workshop Hell ───────────────────────────────────────────
  private showWorkshop(): void {
    const w = this.state.workshop;
    const step = WORKSHOP_STEPS[w.step];
    if (!step) {
      showWorkshopEnd(w.bill, w.log, () => this.leaveWorkshop());
      return;
    }
    showWorkshopStep(step, w.step, WORKSHOP_STEPS.length, w.bill, w.log, (choice) => this.chooseWorkshop(choice));
  }

  private chooseWorkshop(choice: WorkshopChoice): void {
    const w = this.state.workshop;
    w.bill = Math.max(0, w.bill + choice.billChange);
    w.log.push({ text: choice.note, good: choice.good });
    w.step++;
    this.showWorkshop();
  }

  private leaveWorkshop(): void {
    const s = this.state;
    const bill = s.workshop.bill;
    s.money = Math.max(0, s.money - bill);
    resetAfterRecovery(s.car);
    s.health = Math.max(WORKSHOP.minHealthAfter, s.health);
    s.potholes = [];
    updateHud(s);
    hidePanels();
    hideScreens();
    showToast(`🔧 Back on the road! -RM${bill.toLocaleString('en-MY')}`);
    s.mode = 'playing';
  }

  // ── Endings ─────────────────────────────────────────────────
  private die(): void {
    this.state.mode = 'dead';
    showDead(this.state);
  }

  private win(): void {
    this.state.mode = 'win';
    showWin(this.state);
  }

  showMenu(): void {
    if (this.state.mode === 'playing') return;
    showScreen('menu');
  }
}
