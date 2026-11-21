import { sound } from '../audio/sound';
import { ACCIDENT_EVENTS, CRASH_TOW_OPTIONS } from '../config/accidents';
import { ANIMATION, CAR, ECONOMY, EFFECTS, TICKS_PER_SECOND, TOW, WORKSHOP } from '../config/game';
import { LEVELS } from '../config/levels';
import { POTHOLES } from '../config/potholes';
import { ROAD_EVENTS, type EventChoice, type RoadEvent, type RoadEventId } from '../config/roadEvents';
import { TEXT } from '../config/text';
import { THEME } from '../config/theme';
import { TOW_OPTIONS, type TowOption } from '../config/towTrucks';
import { ACCIDENT_SEVERITY, TRAFFIC_RULES, VEHICLES } from '../config/traffic';
import { WORKSHOP_STEPS, type WorkshopChoice } from '../config/workshop';
import { showDead, showWin } from '../ui/endScreens';
import { updateHud } from '../ui/hud';
import { showLevelCard, type LevelCardInfo } from '../ui/levelCard';
import { flash, hideBanner, hidePanels, hideScreens, hideToast, showBanner, showScreen, showToast } from '../ui/overlays';
import { showRoadEvent } from '../ui/roadEventScreen';
import { showTowChoices } from '../ui/towScreen';
import { showWorkshopEnd, showWorkshopStep } from '../ui/workshopPanel';
import {
  canJump,
  changeLane,
  jump,
  rearWheelWorld,
  resetAfterRecovery,
  snapToLane,
  updateCar,
  updateSinking,
} from '../world/car';
import { burst, puff, shakeOffset, startShake, updateBits, updateShake } from '../world/effects';
import { laneY, type Lane } from '../world/lanes';
import { addFloatingText, updateParticles } from '../world/particles';
import { ART_HEIGHT, ART_WIDTH, makeCanvas } from '../world/pixels';
import { findCollision, maybeSpawnPothole, movePotholes } from '../world/potholes';
import { render } from '../world/render';
import { generateRoad } from '../world/road';
import { updateTowTruck } from '../world/towTruck';
import { clearAround, findVehicleHit, maybeSpawnVehicle, updateVehicles } from '../world/traffic';
import { clampHealth, createState, createTow, currentLevel, levelLength, type GameState } from './state';
import type { Viewport } from './Viewport';

const TICK_MS = 1000 / TICKS_PER_SECOND;
const MAX_FRAME_MS = 250; // after a pause (e.g. switching tabs), don't fast-forward
const CARD_KEY_DELAY_MS = 700; // so a player mashing Space doesn't skip the level card by accident

const pickOne = <T,>(list: T[]): T | undefined => list[Math.floor(Math.random() * list.length)];

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
  private cardShownAt = 0;

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
    this.viewport.present(this.ctx, this.art, shakeOffset(this.state));
    requestAnimationFrame((t) => this.frame(t));
  }

  private update(): void {
    const s = this.state;
    s.time++;
    s.particles = updateParticles(s.particles);
    s.bits = updateBits(s.bits);
    updateShake(s);

    if (s.mode === 'towArriving') {
      if (s.tow.phase === 'incoming' && s.time % 6 === 0) {
        puff(s.bits, s.tow.x + 36, laneY(s.car.lanePos) - 4, THEME.smoke, -TOW.speed); // truck exhaust
      }
      const wasIncoming = s.tow.phase === 'incoming';
      if (updateTowTruck(s.tow)) this.finishTow();
      else if (wasIncoming && s.tow.phase === 'towing') sound.play('horn');
      return;
    }
    if (s.mode !== 'playing') return;

    const level = currentLevel(s);
    const car = s.car;
    if (updateCar(car)) {
      sound.play('land');
      burst(s.bits, car.x, rearWheelWorld(car).y, ANIMATION.landingDust, [THEME.smoke, 'f'], 0.5);
    }

    // Stuck in an ABYSS pothole: sink, then call the tow trucks.
    if (car.sinkY > 0) {
      if (s.time % 4 === 0) puff(s.bits, rearWheelWorld(car).x, laneY(car.lanePos) - 2, '5', 1.5);
      if (updateSinking(car)) this.openTowChoice('abyss');
      return;
    }

    // Wrecked after a serious crash: smoke for a moment, then the tow trucks.
    if (car.crashTimer > 0) {
      if (s.time % 3 === 0) puff(s.bits, car.x + 10, car.y - 20, '5', 0.5);
      if (--car.crashTimer === 0) this.openTowChoice('crash');
      return;
    }

    // Dust from the back wheel and puffs from the exhaust
    const wheel = rearWheelWorld(car);
    if (car.onGround && ANIMATION.dustEvery > 0 && s.time % ANIMATION.dustEvery === 0) {
      puff(s.bits, wheel.x, wheel.y, Math.random() < 0.5 ? THEME.smoke : 'f', s.speed);
    }
    if (ANIMATION.exhaustEvery > 0 && s.time % ANIMATION.exhaustEvery === 0) {
      puff(s.bits, car.x - car.width / 2 - 4, car.y - 8, '5', s.speed);
    }

    s.roadOffset += s.speed;
    maybeSpawnPothole(s.potholes, level, s.speed);
    s.potholes = movePotholes(s.potholes, s.speed);
    const newVehicle = maybeSpawnVehicle(s.vehicles, level.traffic);
    if (newVehicle?.kind === 'rempit') sound.play('rev');
    s.vehicles = updateVehicles(s.vehicles, s.speed, car);
    s.distance += s.speed;
    s.levelDistance += s.speed;
    s.tick++;

    const length = levelLength(level);
    if (!s.eventFired && level.event && s.levelDistance > level.eventAt * length) {
      s.eventFired = true;
      this.openRoadEvent(level.event);
      return;
    }

    if (s.levelDistance >= length) {
      if (s.level >= LEVELS.length) this.win();
      else this.completeLevel();
      return;
    }

    s.score++;
    if (s.score % ECONOMY.passiveIncomeEvery === 0) {
      s.money += ECONOMY.passiveIncome;
      updateHud(s);
      if (ANIMATION.showIncomePop) {
        addFloatingText(s.particles, car.x + 30, car.y - 30, `+${ECONOMY.passiveIncome}`, THEME.particles.stuck, 30);
      }
    }

    if (car.invulnerable <= 0 && !car.trapped) {
      this.checkVehicleHit();
      if (s.mode === 'playing' && !car.trapped && car.crashTimer === 0) this.checkPotholeHit();
    }
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
      snapToLane(car, hole.lane);
      car.trapped = true;
      car.sinkTarget = CAR.sinkDepth;
      car.sinkY = 1;
      addFloatingText(s.particles, car.x, car.y - 50, 'STUCK!', THEME.particles.stuck, 60, 2);
      burst(s.bits, car.x, laneY(hole.lane), ANIMATION.debrisOnStuck, ['5', '0', '6', '8'], 1.2);
      startShake(s, ANIMATION.shakeOnStuck);
      sound.play('stuck');
      flash(EFFECTS.stuckFlashMs);
      return;
    }

    s.potholes.splice(index, 1);
    s.health = clampHealth(s.health - type.damage);
    car.invulnerable = CAR.invulnerableAfterHit;
    addFloatingText(s.particles, car.x, car.y - 40, `-${type.damage}HP`, THEME.particles.damage);
    burst(s.bits, hole.x, laneY(hole.lane), ANIMATION.debrisOnHit, ['5', '0', '6'], type.damage >= 30 ? 1.2 : 0.8);
    startShake(s, ANIMATION.shakeOnHit);
    sound.play(type.damage >= 30 ? 'hitBig' : 'hit');
    flash(EFFECTS.hitFlashMs);
    updateHud(s);
    if (s.health <= 0) this.die();
  }

  // ── Traffic accidents ───────────────────────────────────────
  private checkVehicleHit(): void {
    const s = this.state;
    const car = s.car;
    const index = findVehicleHit(car, s.vehicles, CAR.hitboxInset);
    if (index < 0) return;
    const vehicle = s.vehicles[index];
    if (!vehicle) return;
    s.vehicles.splice(index, 1);

    const sev = ACCIDENT_SEVERITY;
    const isCar = VEHICLES[vehicle.kind].accident === 'fender';
    const serious =
      isCar &&
      ((s.level >= sev.seriousFromLevel && Math.random() < sev.seriousChance) ||
        s.health - sev.fenderDamage < sev.seriousIfHealthBelow);
    const damage = serious ? sev.seriousDamage : isCar ? sev.fenderDamage : sev.minorDamage;

    s.health = clampHealth(s.health - damage);
    car.invulnerable = TRAFFIC_RULES.invulnerableAfterAccident;
    s.vehicles = clearAround(s.vehicles, car.x, TRAFFIC_RULES.clearAroundAfterAccident);
    addFloatingText(s.particles, car.x, car.y - 40, `-${damage}HP`, THEME.particles.damage);
    burst(s.bits, (car.x + vehicle.x) / 2, car.y - 10, serious ? 24 : 12, ['5', '6', '8', 'c', '0'], serious ? 1.4 : 1);
    startShake(s, serious ? ANIMATION.shakeOnStuck : ANIMATION.shakeOnHit);
    sound.play(isCar ? 'carCrash' : 'bikeCrash');
    flash(serious ? EFFECTS.stuckFlashMs : EFFECTS.hitFlashMs);
    updateHud(s);

    if (s.health <= 0) {
      this.die();
      return;
    }
    if (serious) {
      // The car is wrecked: it stops, smokes, then the tow trucks arrive.
      car.trapped = true;
      car.crashTimer = sev.wreckTicks;
      car.hop = 0;
      car.vy = 0;
      car.onGround = true;
      addFloatingText(s.particles, car.x, car.y - 52, 'CRASH!', THEME.particles.damage, 60, 2);
      return;
    }
    this.openAccidentEvent(isCar ? 'fender' : vehicle.kind === 'rempit' && ACCIDENT_EVENTS.rempit.length > 0 ? 'rempit' : 'minor');
  }

  private openAccidentEvent(kind: keyof typeof ACCIDENT_EVENTS): void {
    const event = pickOne(ACCIDENT_EVENTS[kind]);
    if (!event) {
      this.state.mode = 'playing';
      return;
    }
    this.openEvent(event);
  }

  // ── Levels ──────────────────────────────────────────────────
  /** Finished a level: set up the next one and pause on the level card. */
  private completeLevel(): void {
    const s = this.state;
    const cleared = { number: s.level, earned: s.money - s.levelStartMoney };
    s.level++;
    s.levelDistance = 0;
    s.levelStartMoney = s.money;
    s.eventFired = false;
    s.potholes = [];
    s.vehicles = [];
    const level = currentLevel(s);
    s.speed = level.speed;
    s.road = generateRoad(level.roughness);
    updateHud(s);
    sound.play('levelClear');
    this.openLevelCard(cleared);
  }

  private openLevelCard(cleared: LevelCardInfo['cleared']): void {
    const s = this.state;
    s.mode = 'levelCard';
    this.cardShownAt = performance.now();
    hideToast();
    showLevelCard({ cleared, nextNumber: s.level, health: s.health, money: s.money }, () => this.go(true));
  }

  /** Leaves the level card and starts driving. Keys are ignored for a moment so Space-mashing doesn't skip it. */
  go(clicked = false): void {
    if (this.state.mode !== 'levelCard') return;
    if (!clicked && performance.now() - this.cardShownAt < CARD_KEY_DELAY_MS) return;
    hideScreens();
    this.state.mode = 'playing';
    sound.play('go');
  }

  // ── Player actions ─────────────────────────────────────────
  start(): void {
    this.state = createState();
    hideScreens();
    hidePanels();
    hideBanner();
    updateHud(this.state);
    this.openLevelCard(null);
  }

  /** Space / tap / jump button. On the level card it acts as GO. */
  jump(): void {
    const s = this.state;
    if (s.mode === 'levelCard') this.go();
    else if (s.mode === 'playing' && canJump(s.car)) {
      jump(s.car);
      sound.play('jump');
    }
  }

  /** ↑ / ↓ / swipe / lane buttons. */
  moveLane(lane: Lane): void {
    const s = this.state;
    if (s.mode === 'playing' && changeLane(s.car, lane)) sound.play('lane');
  }

  // ── Pop-up events (road events and accident scenes) ────────
  private openRoadEvent(id: RoadEventId): void {
    this.openEvent(ROAD_EVENTS[id]);
  }

  private openEvent(event: RoadEvent): void {
    this.state.mode = 'event';
    sound.play('eventPop');
    showRoadEvent(event, (choice) => this.applyEventChoice(choice));
  }

  private applyEventChoice(choice: EventChoice): void {
    const s = this.state;
    s.money = Math.max(0, s.money + (choice.effect.money ?? 0));
    s.health = clampHealth(s.health + (choice.effect.hp ?? 0));
    updateHud(s);
    sound.play(choice.tone === 'bad' ? 'bad' : choice.tone === 'good' ? 'good' : 'click');
    showToast(choice.message);
    hideScreens();
    if (s.health <= 0) this.die();
    else s.mode = 'playing';
  }

  // ── Tow trucks ──────────────────────────────────────────────
  private openTowChoice(reason: 'abyss' | 'crash'): void {
    this.state.mode = 'towChoice';
    const crash = reason === 'crash';
    showTowChoices(
      crash ? CRASH_TOW_OPTIONS : TOW_OPTIONS,
      crash ? TEXT.crashTowTitle : TEXT.towChoiceTitle,
      crash ? TEXT.crashTowIntro : TEXT.towChoiceIntro,
      (option) => this.pickTow(option, reason),
    );
  }

  private pickTow(option: TowOption, reason: 'abyss' | 'crash'): void {
    const s = this.state;
    s.tow = { ...createTow(), active: true, option, reason };
    s.mode = 'towArriving';
    sound.play('click');
    hideScreens();
    showBanner(TEXT.towArrivingTitle, option.arrivingText);
  }

  private finishTow(): void {
    const s = this.state;
    const { option, reason } = s.tow;
    s.tow = createTow();
    hideBanner();
    if (!option) return;

    if (option.licensed) {
      sound.play('good');
      resetAfterRecovery(s.car);
      s.potholes = s.potholes.filter((p) => Math.abs(p.x - s.car.x) > s.car.width);
      s.vehicles = clearAround(s.vehicles, s.car.x, TRAFFIC_RULES.clearAroundAfterAccident);
      s.money = Math.max(0, s.money - option.cost);
      s.health = clampHealth(s.health + TOW.licensedHeal);
      updateHud(s);
      showToast(`🚛 ${option.outcome}`);
      // After a serious crash, the paperwork: police report or adjuster
      if (reason === 'crash') this.openAccidentEvent('serious');
      else s.mode = 'playing';
      return;
    }

    sound.play('bad');
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
    sound.play(choice.good ? 'good' : 'bad');
    w.log.push({ text: choice.note, good: choice.good });
    w.step++;
    this.showWorkshop();
  }

  private leaveWorkshop(): void {
    sound.play('go');
    const s = this.state;
    const bill = s.workshop.bill;
    s.money = Math.max(0, s.money - bill);
    resetAfterRecovery(s.car);
    s.health = Math.max(WORKSHOP.minHealthAfter, s.health);
    s.potholes = [];
    s.vehicles = [];
    updateHud(s);
    hidePanels();
    hideScreens();
    showToast(`🔧 Back on the road! -RM${bill.toLocaleString('en-MY')}`);
    s.mode = 'playing';
  }

  // ── Endings ─────────────────────────────────────────────────
  private die(): void {
    sound.play('crash');
    this.state.mode = 'dead';
    showDead(this.state);
  }

  private win(): void {
    sound.play('win');
    this.state.mode = 'win';
    showWin(this.state);
  }

  showMenu(): void {
    if (this.state.mode === 'playing') return;
    showScreen('menu');
  }
}
