/**
 * WORDS ON SCREEN
 * Menus, help text and hotlines. Basic HTML like <b> and <br> works here.
 */

export const TEXT = {
  title: '🚗 PJ POTHOLE RUNNER',
  tagline: "Navigate PJ's roads · Avoid potholes · Know your rights",

  menuIntro: `
    SPACE / TAP to jump over potholes<br>
    Deeper pits = more damage to your car<br>
    <b>ABYSS potholes = tow truck encounter!</b><br>
    Choose the right tow — or enter Workshop Hell 🔧`,

  howTo: `
    <b>CONTROLS:</b> SPACE / CLICK / TAP to jump<br>
    <b>POTHOLES:</b><br>
    &nbsp;· · · · = Shallow (−5 HP)&nbsp;&nbsp;──── = Medium (−15 HP)<br>
    &nbsp;━━━━━ = Deep (−30 HP)&nbsp;&nbsp;<b>[ABYSS]</b> = Car gets stuck!<br><br>
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

  towChoiceTitle: '🚨 CAR STUCK IN ABYSS POTHOLE!',
  towChoiceIntro: `
    Your car has sunk into a pothole so deep it can't escape.<br>
    Two tow trucks are approaching. <b>Choose wisely!</b>`,
  towArrivingTitle: '🚛 TOW TRUCK ARRIVING...',

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

  jumpButton: '▲ JUMP',
  controlsHint: 'SPACE · CLICK · TAP TO JUMP',
  rotateHint: '↻ Turn your phone sideways for a bigger road',
};
