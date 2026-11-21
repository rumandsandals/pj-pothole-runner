import { sound } from '../audio/sound';
import { ACCIDENT_EVENTS, CRASH_TOW_OPTIONS } from '../config/accidents';
import { ANIMATION, CAR, DRIVING, ECONOMY, JUICE, EFFECTS, TICKS_PER_SECOND, TOW, WORKSHOP } from '../config/game';
import { LEVELS } from '../config/levels';
import { tempoForLevel } from '../config/music';
import { LIGHTS } from '../config/trafficLights';
import { PEDESTRIANS } from '../config/pedestrians';
import { HEAT, POLICE, POLICE_CHOICES, POLICE_STOPS, type Offence } from '../config/police';
import { POTHOLES } from '../config/potholes';
import { ROAD_EVENTS, type EventChoice, type RoadEvent, type RoadEventId } from '../config/roadEvents';
import { TEXT } from '../config/text';
import { THEME } from '../config/theme';
import { TOW_OPTIONS, type TowOption } from '../config/towTrucks';
import { ACCIDENT_SEVERITY, TRAFFIC_RULES, VEHICLES } from '../config/traffic';
import { WORKSHOP_STEPS, type WorkshopChoice } from '../config/workshop';
import { showDead, showWin } from '../ui/endScreens';
import { showMenuBest } from '../ui/best';
import { updateHud } from '../ui/hud';
import { showLevelCard, type LevelCardInfo } from '../ui/levelCard';
import { flash, hideBanner, hidePanels, hideScreens, hideToast, showBanner, showScreen, showToast, wipe } from '../ui/overlays';
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
import { laneY, sameLane, setLaneCount } from '../world/lanes';
import { addFloatingText, updateParticles } from '../world/particles';
import { ART_HEIGHT, ART_WIDTH, makeCanvas } from '../world/pixels';
import { findCollision, maybeSpawnPothole, movePotholes } from '../world/potholes';
import { render } from '../world/render';
import { blocksPotholes, placeFurniture, stopAhead, stopPoints, updateFurniture, updateStrollers } from '../world/streetFurniture';
import { generateRoad } from '../world/road';
import { updateTowTruck } from '../world/towTruck';
import { clearAround, findVehicleHit, maybeSpawnVehicle, updateVehicles } from '../world/traffic';
import { clampHealth, createState, createTow, currentLevel, currentTime, freshLevelStats, levelLength, starsFor, type GameState } from './state';
import type { Viewport } from './Viewport';

const TICK_MS = 1000 / TICKS_PER_SECOND;
const MAX_FRAME_MS = 250; // after a pause (e.g. switching tabs), don't fast-forward
const TITLE_CRUISE_SPEED = 1.6; // how fast the street scrolls behind the title screen
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
    const [dx, dy] = shakeOffset(this.state);
    const s = this.state;
    // Engine hum follows your speed while driving (idles at lights); silent on menus and pop-ups
    const driving = s.mode === 'playing' || s.mode === 'pullover' || s.mode === 'towArriving';
    sound.engine(driving && s.car.crashTimer === 0 && s.car.sinkY === 0 ? (s.mode === 'playing' ? s.speed : 0) : null);
    const dip = s.dip > 0 ? Math.round(Math.sin((s.dip / JUICE.landingDipTicks) * Math.PI) * JUICE.landingDip) : 0;
    this.viewport.present(this.ctx, this.art, [dx, dy + dip]);
    requestAnimationFrame((t) => this.frame(t));
  }

  private update(): void {
    const s = this.state;
    setLaneCount(currentLevel(s).lanes);
    s.time++;
    if (s.dip > 0) s.dip--;
    s.particles = updateParticles(s.particles);
    s.bits = updateBits(s.bits);
    updateShake(s);

    if (s.mode === 'towArriving') {
      if (s.tow.phase === 'incoming' && s.time % 6 === 0) {
        puff(s.bits, s.tow.x + 36, laneY(s.car.lanePos) - 4, THEME.smoke, -TOW.speed); // truck exhaust
      }
      const wasIncoming = s.tow.phase === 'incoming';
      if (updateTowTruck(s.tow, s.car)) this.finishTow();
      else if (wasIncoming && s.tow.phase === 'towing') sound.play('horn');
      return;
    }
    // Title screen: your Mazda cruises slowly past PJ behind the menu
    if (s.mode === 'menu') {
      s.roadOffset += TITLE_CRUISE_SPEED;
      s.levelDistance = (s.levelDistance + TITLE_CRUISE_SPEED) % levelLength(currentLevel(s));
      updateCar(s.car);
      return;
    }

    if (s.mode === 'pullover') {
      this.updatePullover();
      return;
    }
    if (s.mode !== 'playing') return;

    const level = currentLevel(s);
    const car = s.car;
    if (updateCar(car)) {
      sound.play('land');
      s.dip = JUICE.landingDipTicks;
      burst(s.bits, car.x, rearWheelWorld(car).y, ANIMATION.landingDust, [THEME.smoke, 'f'], 0.5);
    }
    this.checkJumpOver();

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

    // Brake / gas: ease towards the target speed, and slide the car back or forward
    let target = s.throttle < 0 ? DRIVING.brakeSpeed : s.throttle > 0 ? DRIVING.gasSpeed : 1;
    let rate = DRIVING.change;
    // Traffic lights: braking near a red / amber light brings you to a full stop, and you wait there
    const redAhead = stopAhead(s.signals, s.crossings, car, LIGHTS.brakeZone) !== null; // red light or people crossing
    if (redAhead && s.throttle < 0) {
      target = 0;
      rate *= LIGHTS.stopPower;
    } else if (redAhead && s.pace < 0.08 && s.throttle <= 0) {
      target = 0; // waiting at the light
    }
    s.pace += Math.sign(target - s.pace) * Math.min(Math.abs(target - s.pace), rate);
    s.speed = level.speed * s.pace;
    const lean = Math.max(-1, s.pace >= 1 ? (s.pace - 1) / (DRIVING.gasSpeed - 1) : (s.pace - 1) / (1 - DRIVING.brakeSpeed));
    car.x = CAR.x + lean * DRIVING.carMoves;

    // Dust from the back wheel and puffs from the exhaust
    const wheel = rearWheelWorld(car);
    if (car.onGround && ANIMATION.dustEvery > 0 && s.time % ANIMATION.dustEvery === 0) {
      puff(s.bits, wheel.x, wheel.y, Math.random() < 0.5 ? THEME.smoke : 'f', s.speed);
    }
    if (ANIMATION.exhaustEvery > 0 && s.time % ANIMATION.exhaustEvery === 0) {
      puff(s.bits, car.x - car.width / 2 - 4, car.y - 8, '5', s.speed);
    }

    s.roadOffset += s.speed;
    // Traffic lights and zebra crossings
    placeFurniture(level, s.levelDistance, levelLength(level), s.placed, s.signals, s.crossings);
    const furniture = updateFurniture(s.signals, s.crossings, s.speed, car, s.pace < 0.03);
    s.signals = furniture.signals;
    s.crossings = furniture.crossings;
    if (furniture.ranRed > 0) {
      this.addHeat(LIGHTS.runRedHeat, 'redLight');
      addFloatingText(s.particles, car.x, car.y - 46, 'RAN RED LIGHT!', THEME.particles.damage, 50);
      sound.play('bad');
    }
    if (furniture.noGiveWay > 0) {
      this.addHeat(PEDESTRIANS.giveWayHeat, 'giveWay');
      addFloatingText(s.particles, car.x, car.y - 46, 'GIVE WAY!', THEME.particles.damage, 50);
      sound.play('horn');
    }
    s.strollers = updateStrollers(s.strollers, s.speed, !level.highway);

    if (!blocksPotholes(s.signals, s.crossings)) maybeSpawnPothole(s.potholes, level, s.speed);
    s.potholes = movePotholes(s.potholes, s.speed);
    const newVehicle = maybeSpawnVehicle(s.vehicles, level.traffic, level.highway);
    if (newVehicle?.kind === 'rempit') sound.play('rev');
    s.vehicles = updateVehicles(s.vehicles, s.speed, level.speed, car, stopPoints(s.signals, s.crossings));
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

    // Income goes by distance (normal speed = 1 point a tick), so braking can't farm money
    const before = Math.floor(s.score / ECONOMY.passiveIncomeEvery);
    s.score += s.pace;
    if (Math.floor(s.score / ECONOMY.passiveIncomeEvery) > before) {
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
    if (s.mode === 'playing') this.updateHeat();
  }

  // ── Police & heat ───────────────────────────────────────────
  private addHeat(amount: number, offence: Offence): void {
    const s = this.state;
    s.heat = Math.min(HEAT.max, Math.max(0, s.heat + amount));
    // Remember what you'd be stopped for: one-off offences win over ongoing speeding
    if (offence !== 'speeding' || s.lastOffence === null || s.lastOffence === 'speeding') s.lastOffence = offence;
  }

  /** Speeding builds heat, normal driving cools it, and high heat can get you pulled over. */
  private updateHeat(): void {
    const s = this.state;
    const car = s.car;
    if (s.pace > 1.05) this.addHeat(HEAT.speedingPerSecond / TICKS_PER_SECOND, 'speeding');
    else s.heat = Math.max(0, s.heat - HEAT.coolPerSecond / TICKS_PER_SECOND);
    if (s.heat === 0) s.lastOffence = null;

    if (s.policeCooldown > 0) {
      s.policeCooldown--;
      return;
    }
    const canStop = car.onGround && !car.trapped && car.crashTimer === 0 && car.sinkY === 0;
    if (!canStop || s.level < POLICE.fromLevel || s.heat < POLICE.stopsFromHeat) return;
    const share = s.heat / HEAT.max;
    if (Math.random() < (share * share * POLICE.stopChancePerSecondAtMax) / TICKS_PER_SECOND) this.startPullover();
  }

  /** Jumping clean over another vehicle is stunt driving. */
  private checkJumpOver(): void {
    const s = this.state;
    const car = s.car;
    if (car.onGround) {
      s.jumpedOver = false;
      return;
    }
    if (s.jumpedOver) return;
    const over = s.vehicles.some(
      (v) => sameLane(car.lanePos, v.lanePos) && car.hop >= VEHICLES[v.kind].height && Math.abs(v.x - car.x) < VEHICLES[v.kind].halfWidth + car.width / 2 - 8,
    );
    if (!over) return;
    s.jumpedOver = true;
    this.addHeat(HEAT.jumpOverVehicle, 'jump');
    addFloatingText(s.particles, car.x, car.y - 46, 'ILLEGAL JUMP!', THEME.particles.damage, 45);
  }

  private startPullover(): void {
    const s = this.state;
    s.mode = 'pullover';
    s.throttle = 0;
    s.police = { x: -90, waited: 0 };
    s.vehicles = clearAround(s.vehicles, s.car.x - 120, 200); // make room behind you
    sound.play('siren');
    showBanner(TEXT.policeStopTitle, TEXT.policeStopText);
  }

  private updatePullover(): void {
    const s = this.state;
    const p = s.police;
    if (!p) return;
    const target = s.car.x - POLICE.stopBehind;
    if (p.x < target) p.x = Math.min(target, p.x + POLICE.arriveSpeed);
    else if (++p.waited === POLICE.waitTicks) this.openPoliceStop();
  }

  /** The stop itself: pay the saman, or try a bribe (most officers are honest). */
  private openPoliceStop(): void {
    const s = this.state;
    hideBanner();
    s.levelStats.stops++;
    const stop = POLICE_STOPS[s.lastOffence ?? 'speeding'];
    const { pay, bribe } = POLICE_CHOICES;
    const honest = Math.random() < POLICE.honestChance;
    const penalty = stop.fine * bribe.honestPenaltyTimes;
    const event: RoadEvent = {
      title: stop.title,
      description: `${stop.description} Fine: RM ${stop.fine}.`,
      choices: [
        { label: pay.label.replace('{fine}', String(stop.fine)), effect: { money: -stop.fine, heat: -HEAT.max }, message: pay.message, tone: 'good' },
        honest
          ? { label: bribe.label, effect: { money: -penalty, heat: 20 }, message: bribe.honestMessage.replace('{penalty}', String(penalty)), tone: 'bad' }
          : { label: bribe.label, effect: { money: -bribe.bribe }, message: bribe.corruptMessage, tone: 'bad' },
      ],
    };
    s.mode = 'event';
    sound.play('eventPop');
    showRoadEvent(event, (choice) => {
      s.police = null;
      s.policeCooldown = POLICE.cooldownSeconds * TICKS_PER_SECOND;
      this.applyEventChoice(choice);
    });
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
      s.levelStats.potholes++;
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
    s.levelStats.damage += type.damage;
    s.levelStats.potholes++;
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
    // Causing a crash puts you on the police radar (not when a Mat Rempit hits you)
    if (vehicle.kind !== 'rempit') this.addHeat(serious ? HEAT.accident.serious : isCar ? HEAT.accident.fender : HEAT.accident.minor, 'accident');

    s.health = clampHealth(s.health - damage);
    s.levelStats.damage += damage;
    s.levelStats.crashes++;
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
    const scene =
      isCar ? 'fender'
      : vehicle.kind === 'rempit' && ACCIDENT_EVENTS.rempit.length > 0 ? 'rempit'
      : VEHICLES[vehicle.kind].accident === 'cyclist' && ACCIDENT_EVENTS.cyclist.length > 0 ? 'cyclist'
      : 'minor';
    this.openAccidentEvent(scene);
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
    const cleared = { number: s.level, earned: s.money - s.levelStartMoney, stats: { ...s.levelStats }, stars: starsFor(s.levelStats) };
    s.levelStats = freshLevelStats();
    s.level++;
    s.levelDistance = 0;
    s.levelStartMoney = s.money;
    s.eventFired = false;
    s.signals = [];
    s.crossings = [];
    s.strollers = [];
    s.placed = [];
    s.potholes = [];
    s.vehicles = [];
    const level = currentLevel(s);
    s.speed = level.speed;
    s.pace = 1;
    s.road = generateRoad(level.roughness);
    updateHud(s);
    sound.play('levelClear');
    s.mode = 'levelCard'; // pause straight away; the card appears behind the wipe
    wipe(() => this.openLevelCard(cleared));
  }

  private openLevelCard(cleared: LevelCardInfo['cleared']): void {
    const s = this.state;
    document.body.dataset.lanes = String(currentLevel(s).lanes); // dims the lane buttons on one-lane roads
    s.mode = 'levelCard';
    this.cardShownAt = performance.now();
    hideToast();
    showLevelCard({ cleared, nextNumber: s.level, health: s.health, money: s.money, time: currentTime(s) }, () => this.go(true));
  }

  /** Leaves the level card and starts driving. Keys are ignored for a moment so Space-mashing doesn't skip it. */
  go(clicked = false): void {
    if (this.state.mode !== 'levelCard') return;
    if (!clicked && performance.now() - this.cardShownAt < CARD_KEY_DELAY_MS) return;
    if (this.goPressed) return;
    this.goPressed = true;
    sound.play('go');
    wipe(() => {
      hideScreens();
      this.state.mode = 'playing';
      this.goPressed = false;
      this.playLevelMusic();
    });
  }
  private goPressed = false;

  /** Each level's tune. */
  private playLevelMusic(): void {
    sound.setTrack(currentLevel(this.state).music);
    sound.setTempo(tempoForLevel(this.state.level, LEVELS.length)); // a little faster every level
  }

  // ── Player actions ─────────────────────────────────────────
  start(): void {
    this.state = createState();
    this.state.mode = 'levelCard';
    wipe(() => {
      hideScreens();
      hidePanels();
      hideBanner();
      updateHud(this.state);
      this.openLevelCard(null);
    });
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

  /** ↑ / ↓ / swipe / lane buttons: +1 = one lane up (further), -1 = one lane down (nearer). */
  moveLane(step: 1 | -1): void {
    const s = this.state;
    if (s.mode !== 'playing' || !changeLane(s.car, step)) return;
    sound.play('lane');
    // Cutting in right beside another vehicle is a dangerous lane change
    const tooClose = s.vehicles.some((v) => sameLane(v.lanePos, s.car.lane) && Math.abs(v.x - s.car.x) < HEAT.nearMissDistance);
    if (tooClose) {
      this.addHeat(HEAT.dangerousLaneChange, 'laneChange');
      addFloatingText(s.particles, s.car.x, s.car.y - 40, 'CUT IN!', THEME.particles.stuck, 35);
    }
  }

  /** ← / → / BRAKE / GAS: -1 = brake, 1 = gas, 0 = let go. */
  setThrottle(throttle: -1 | 0 | 1): void {
    this.state.throttle = throttle;
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
    const heat = choice.effect.heat ?? 0;
    if (heat > 0) this.addHeat(heat, 'record'); // illegal choice: it's on record
    else if (heat < 0) s.heat = Math.max(0, s.heat + heat);
    if (s.heat === 0) s.lastOffence = null;
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
    if (this.state.mode === 'dead' || this.state.mode === 'win') return; // only once per game
    sound.play('crash');
    this.state.mode = 'dead';
    wipe(() => showDead(this.state));
  }

  private win(): void {
    if (this.state.mode === 'dead' || this.state.mode === 'win') return; // only once per game
    sound.play('win');
    this.state.mode = 'win';
    wipe(() => showWin(this.state));
  }

  showMenu(): void {
    if (this.state.mode === 'playing') return;
    showMenuBest();
    showScreen('menu');
  }
}
