/**
 * WORDS ON SCREEN
 * Menus, help text and hotlines. Basic HTML like <b> and <br> works here.
 */

export const TEXT = {
  title: '🚗 PJ POTHOLE RUNNER <span class="draft">DRAFT</span>', // remove the DRAFT tag when it's finished
  tagline: "Navigate PJ's roads · Avoid potholes · Know your rights",

  pressStart: '- PRESS START -',

  // Controls dialog (asked the first time you play)
  controlsTitle: 'CHOOSE YOUR CONTROLS',
  controlsTouchName: 'TOUCHSCREEN',
  controlsTouchDesc: 'Joystick + JUMP button<br>Phones & iPads',
  controlsKeyboardName: 'KEYBOARD',
  controlsKeyboardDesc: 'Arrow keys + SPACE to jump<br>Computers',
  controlsSuggested: 'BEST FOR THIS DEVICE',
  controlsNote: 'You can change this later from the title screen.',
  controlsTouchShort: 'JOYSTICK',
  controlsKeyboardShort: 'KEYBOARD',

  menuIntro: `
    ↑ ↓ switch lanes · ← → brake / speed up · SPACE / TAP to jump<br>
    Dodge cars, motorcycles & bicycles — crashes mean claims!<br>
    <b>ABYSS potholes = tow truck encounter!</b><br>
    Choose the right tow — or enter Workshop Hell 🔧`,

  howTo: `
    <b>CONTROLS:</b> ↑ ↓ (or W S, swipe, LANE buttons) switch lanes<br>
    Hold ← → (or A D, BRAKE / GAS buttons) to slow down or speed up<br>
    SPACE / CLICK / TAP to jump · M = music on/off · F = full screen<br>
    <b>POTHOLES:</b><br>
    &nbsp;· · · · = Shallow (−5 HP)&nbsp;&nbsp;──── = Medium (−15 HP)<br>
    &nbsp;━━━━━ = Deep (−30 HP)&nbsp;&nbsp;<b>[ABYSS]</b> = Car gets stuck!<br><br>
    <b>TRAFFIC (from level 2):</b><br>
    🏍️ 🚲 Clip a motorcycle or bicycle = minor accident · 🚗 Bump a car = insurance claim<br>
    Sedans, slow SUVs and fast sports cars share the road<br>
    💥 Serious crash = tow truck choice · ❗ = Mat Rempit coming from behind<br>
    Mat Rempit split lanes — riding the line, they can hit you in either lane. Jump!<br><br>
    <b>🚦 TRAFFIC LIGHTS:</b> hold BRAKE to stop before the white line on red.<br>
    Bikes will squeeze to the front. Running a red = police heat!<br>
    <b>🚸 ZEBRA CROSSINGS:</b> stop and let people (and dogs) cross!<br><br>
    <b>🚨 POLICE HEAT (lights top-left):</b><br>
    Speeding, jumping OVER vehicles, cutting in, causing crashes and<br>
    illegal choices raise your heat. High heat = pulled over!<br>
    Drive at normal speed to cool off. Pay the saman — never bribe.<br><br>
    <b>TOW TRUCK ENCOUNTER (ABYSS):</b><br>
    🟢 Licensed tow = safe recovery · back on road<br>
    🔴 Cheap tow = dragged to a dodgy workshop!<br><br>
    <b>WORKSHOP HELL (5 rounds):</b><br>
    Face: fake parts · dodgy adjusters · phantom charges<br>
    missing catalytic converters · inflated insurance claims<br>
    Make smart choices to reduce your final bill!<br><br>
    <b class="warn">IRL HOTLINES:</b><br>
    MBPJ: <b>03-7954 2020</b> · <b>embpj.mbpj.gov.my</b><br>
    MACC: <b>1-800-88-6000</b> · Consumer Claims Tribunal: <b>1-800-88-9811</b><br>
    Insurance disputes: FMOS <b>03-2272 2811</b> · BNMLINK: <b>1-300-88-5465</b><br>
    Emergency: <b>999</b>`,

  levelClearTitle: '🏁 LEVEL {n} CLEAR!',
  levelFirstLabel: 'GET READY',
  levelNextLabel: 'NEXT UP',
  goButton: '▶ GO!',
  goHint: 'or press SPACE / tap JUMP',

  towChoiceTitle: '🚨 CAR STUCK IN ABYSS POTHOLE!',
  towChoiceIntro: `
    Your car has sunk into a pothole so deep it can't escape.<br>
    Two tow trucks are approaching. <b>Choose wisely!</b>`,
  towArrivingTitle: '🚛 TOW TRUCK ARRIVING...',

  crashTowTitle: '💥 SERIOUS CRASH!',
  crashTowIntro: `
    Your car can't be driven. Two tow trucks are here —<br>
    one you called, and one you didn't. <b>Choose wisely!</b>`,

  deadTitle: '💥 VEHICLE TOTALLED',
  limpingOn: '🛟 Battered, but still driving! From level 7 on, 0 HP means your car is totalled.',
  deadHotlines: `
    MBPJ: 03-7954 2020 · embpj.mbpj.gov.my<br>
    MACC: 1-800-88-6000 · Consumer Claims Tribunal: 1-800-88-9811`,

  winTitle: '🏆 ROAD WARRIOR!',
  winChecklist: 'Police ✓ · Insurance ✓ · Workshop ✓ · Council ✓',
  winHotlines: 'MBPJ: 03-7954 2020 · MACC: 1-800-88-6000',

  workshopTitle: '🔧 WORKSHOP HELL',
  workshopGoodEnd: '🎉 SMART CHOICES PAID OFF!',
  workshopBadEnd: '💸 WORKSHOP NIGHTMARE COMPLETE',
  workshopProtection: `
    <b>IRL PROTECTION:</b><br>
    📋 Always get a written quote and an itemised invoice<br>
    ⚖️ Dispute unfair charges: Consumer Claims Tribunal <b>1-800-88-9811</b><br>
    🔩 Missing or stolen parts: lodge a <b>police report</b><br>
    📑 Insurance disputes: FMOS <b>03-2272 2811</b> (free) · BNMLINK <b>1-300-88-5465</b>`,

  effectsOn: 'SFX',
  effectsOff: 'SFX',
  musicOn: 'MUSIC',
  musicOff: 'MUSIC',

  jumpButton: 'JUMP',
  controlsHint: 'ARROW KEYS OR W A S D · ↑ ↓ LANE · HOLD ← BRAKE · HOLD → GAS · SPACE JUMP · F FULL SCREEN',
  // The arrow-key cluster (a small label sits under each arrow)
  laneUpButton: '▲<small>LANE</small>',
  laneDownButton: '▼<small>LANE</small>',
  brakeButton: '◀<small>BRAKE</small>',
  gasButton: '▶<small>GAS</small>',
  fullScreenEnter: 'FULL',
  fullScreenExit: 'EXIT',
  fullScreenIphoneTip: 'iPhone: tap Share ⬆ then “Add to Home Screen” — the game then opens full screen like an app.',
  policeStopTitle: '🚨 POLICE! PULL OVER',
  policeStopText: 'A patrol car is pulling you over…',
  rotateHint: '↻ Tip: turn your phone sideways for a bigger road',
};
