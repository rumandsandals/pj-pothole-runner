/**
 * CORE GAME SETTINGS
 * Change the numbers here to tweak how the game feels.
 * Speeds and distances are "per tick" — the game runs 60 ticks every second
 * on every screen, so it plays the same on a 60 Hz laptop or a 120 Hz monitor.
 */

/** The game world is drawn at this size, then scaled to fit any screen. */
export const WORLD = {
  width: 640,
  height: 360, // 16:9 widescreen
  groundY: 250, // where the road begins (the kerb); the sky and skyline are above this
};

/**
 * The two lanes. Numbers are how far down the screen each lane's road
 * surface sits (world units). Lane 0 = near (bottom), lane 1 = far (top).
 */
export const LANES = {
  near: 332,
  far: 292,
  dividerY: 311, // the dashed yellow line between them
  changeTicks: 9, // how quickly the car slides between lanes
};

/**
 * Size of one art pixel in world units. 1 = the screen is 640×360 pixels
 * (detailed pixel art). 2 = chunkier, 320×180 — but the sprites are drawn
 * for 1, so they'd look twice as big.
 */
export const PIXEL_SIZE = 1;

export const TICKS_PER_SECOND = 60;

export const PHYSICS = {
  gravity: 0.55,
  jumpForce: -12, // more negative = higher jump
};

export const MAX_HEALTH = 100;

export const CAR = {
  x: 150, // where the car sits on screen (0 = left edge, 640 = right). Further right = more room to see traffic behind you
  width: 56, // collision size (the Mazda sprite is 60 wide)
  height: 22,
  hitboxInset: 9, // makes collisions a little forgiving
  invulnerableAfterHit: 60, // ticks of blinking after hitting a pothole
  invulnerableAfterRecovery: 90, // ticks of blinking after a tow / workshop
  sinkDepth: 30, // how far the car sinks into an ABYSS pothole
  sinkSpeed: 0.9,
};

/**
 * BRAKE & GAS
 * Hold ← / A (or the BRAKE button) to slow down, → / D (or GAS) to speed up.
 * Speeds are a share of each level's normal speed.
 */
export const DRIVING = {
  brakeSpeed: 0.55, // speed while holding BRAKE
  gasSpeed: 1.4, // speed while holding GAS
  change: 0.025, // how quickly the car speeds up / slows down (bigger = snappier)
  carMoves: 45, // how far the car slides forward (gas) or back (brake) on screen
};

export const FULL_SCREEN = {
  autoOnTouchDevices: true, // phones & tablets switch to full screen when you press START
};

export const SPAWN = {
  maxOnScreen: 2, // most potholes visible at once
  minGap: 294, // smallest gap between two potholes
  spawnX: WORLD.width + 65, // potholes appear just off the right edge
  despawnX: -110,
  hitboxInset: 6,
};

export const ECONOMY = {
  passiveIncomeEvery: 100, // ticks
  passiveIncome: 5, // RM earned each time
};

export const TOW = {
  arriveFromX: WORLD.width + 80,
  stopAhead: 72, // where the truck parks, in front of your car
  speed: 3.5,
  waitTicks: 84, // pause while the truck hooks your car (~1.4 seconds)
  licensedHeal: 20,
};

export const WORKSHOP = {
  startingBill: 3000,
  meterMax: 6000,
  goodResultBelow: 2500, // bill under this = "smart choices" ending
  minHealthAfter: 10,
};

export const EFFECTS = {
  hitFlashMs: 130,
  stuckFlashMs: 220,
  toastMs: 2800,
};

/**
 * ANIMATION & EFFECTS
 * Set any "Every" value to 0, or a strength to 0, to switch that effect off.
 */
export const ANIMATION = {
  wheelSpinEvery: 6, // world units driven per wheel frame (smaller = faster spin)
  dustEvery: 5, // ticks between dust puffs from the back wheel
  exhaustEvery: 14, // ticks between exhaust puffs
  landingDust: 6, // dust bits when landing a jump
  landingSquashTicks: 5, // how long the car squashes down after landing
  roughRoadJiggle: 0.8, // roads at least this rough make the car jiggle
  debrisOnHit: 10, // asphalt chips thrown up by a pothole hit
  debrisOnStuck: 18,
  shakeOnHit: { ticks: 8, strength: 2 }, // screen shake (strength in art pixels)
  shakeOnStuck: { ticks: 18, strength: 4 },
  cloudDrift: 0.03, // clouds drift even when the car stops
  labelBlinkEvery: 16, // ticks between ABYSS label blinks (0 = no blink)
  showIncomePop: true, // "+5" pop-up when passive income is earned
};

/** Screen-fitting rules. */
export const LAYOUT = {
  maxWidth: 1600, // the game never grows wider than this (px)
  minWidth: 280,
  reservedHeight: 200, // room for the title, HUD and jump button (computer / tablet)

  // Phone held sideways: the road fills the screen, buttons sit on top of it.
  // Used when the screen is wider than tall and no taller than this.
  sideways: { maxHeight: 500, reservedHeight: 30 },

  // Phone held upright: "handheld console" look — road on top, big buttons below.
  // Used when the screen is taller than wide and no wider than this.
  upright: { maxWidth: 600 },
};
