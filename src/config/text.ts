/**
 * WORDS ON SCREEN
 * Menus, help text and hotlines. Basic HTML like <b> and <br> works here.
 */

export const TEXT = {
  title: '🚗 PJ POTHOLE RUNNER',
  tagline: "Navigate PJ's roads · Avoid potholes · Know your rights",

  pressStart: '- PRESS START -',

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
    <b>TOW TRUCK ENCOUNTER (ABYSS):</b><br>
    🟢 Licensed tow = safe recovery · back on road<br>
    🔴 Cheap tow = dragged to a dodgy workshop!<br><br>
    <b>WORKSHOP HELL (5 rounds):</b><br>
    Face: fake parts · dodgy adjusters · phantom charges<br>
    missing catalytic converters · inflated insurance claims<br>
    Make smart choices to reduce your final bill!<br><br>
    <b class="warn">IRL HOTLINES:</b><br>
    MBPJ: <b>www.mbpj.gov.my</b> / <b>03-7625 4688</b><br>
    MACC: <b>1-800-88-6000</b> · Tribunal: <b>1-800-886-800</b><br>
    JPJ Parts: <b>1-800-88-5983</b> · BNM: <b>1-300-88-5465</b>`,

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
  deadHotlines: `
    MBPJ: www.mbpj.gov.my · 03-7625 4688<br>
    MACC: 1-800-88-6000 · Tribunal: 1-800-886-800`,

  winTitle: '🏆 ROAD WARRIOR!',
  winChecklist: 'Police ✓ · Insurance ✓ · Workshop ✓ · Council ✓',
  winHotlines: 'MBPJ: www.mbpj.gov.my · MACC: 1-800-88-6000',

  workshopTitle: '🔧 WORKSHOP HELL',
  workshopGoodEnd: '🎉 SMART CHOICES PAID OFF!',
  workshopBadEnd: '💸 WORKSHOP NIGHTMARE COMPLETE',
  workshopProtection: `
    <b>IRL PROTECTION:</b><br>
    📋 Always get itemised invoices — Consumer Protection Act 1999<br>
    ⚖️ Dispute unfair charges: Tribunal Pengguna <b>1-800-886-800</b><br>
    🔩 Report stolen parts: JPJ Hotline <b>1-800-88-5983</b><br>
    📑 Insurance disputes: BNM BNMTELELINK <b>1-300-88-5465</b>`,

  effectsOn: '🔊 SFX',
  effectsOff: '🔇 SFX',
  musicOn: '🎵 MUSIC',
  musicOff: '🎵 MUSIC',

  jumpButton: 'JUMP',
  controlsHint: '↑ ↓ LANES · HOLD A / D BRAKE · GAS · SPACE JUMP · F FULL SCREEN',
  laneUpButton: '▲ LANE',
  laneDownButton: '▼ LANE',
  brakeButton: '◀ BRAKE',
  gasButton: 'GAS ▶',
  fullScreenEnter: '⛶ FULL',
  fullScreenExit: '⛶ EXIT',
  fullScreenIphoneTip: 'iPhone: tap Share ⬆ then “Add to Home Screen” — the game then opens full screen like an app.',
  rotateHint: '↻ Tip: turn your phone sideways for a bigger road',
};
