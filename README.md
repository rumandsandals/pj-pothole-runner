# 🚗 PJ Pothole Runner

Dodge Petaling Jaya's potholes, survive dodgy tow trucks and Workshop Hell, and learn your consumer rights along the way.

## Controls

↑ ↓ (W S) change lane · hold ← → (A D) to brake / speed up · Space jumps · M music · F full screen.
The first time you play, the game asks: TOUCHSCREEN or KEYBOARD controls (it suggests the one that suits your device, remembers your pick, and you can change it from the CONTROLS button on the title screen). Wording is in `src/config/text.ts`; the logic is `src/ui/controlsChoice.ts`.

Keyboard controls: an arrow-key cluster — ▲ ▼ change lane, hold ◀ to brake, hold ▶ for gas — plus a wide JUMP key.

Touchscreen controls: a joystick instead — push up/down to change lane (keep holding to move again), hold left to brake, hold right for gas — plus the JUMP key. Tune it with `JOYSTICK` in `src/config/game.ts`. You can also swipe up/down on the road and tap to jump.

**Full screen on iPhone:** open the game in Safari, tap Share → **Add to Home Screen**. The icon then opens the game full screen like an app.

## Play it on your Mac

**Just play:** double-click **`Play PJ Pothole Runner.html`** in this folder.
After changing any settings, run `npm run play` in Terminal to rebuild that file.

> Don't double-click `index.html` — it's the unbuilt source and shows a blank, dead page.

**While editing (live updates):**

1. Open **Terminal** in this folder.
2. First time only: `npm install`
3. Every time: `npm run dev`, then open the link it shows (usually http://localhost:5173).

The page updates by itself whenever you save a change.

## Customise the game

Everything you're likely to change lives in **`src/config/`**. Edit a file, save, and the game updates.

| I want to change…                          | Edit this file              |
| ------------------------------------------ | --------------------------- |
| Levels (names, length in seconds, intro text, speed, potholes) | `src/config/levels.ts` |
| Pothole sizes, damage, labels              | `src/config/potholes.ts`    |
| Police / insurance / workshop pop-ups      | `src/config/roadEvents.ts`  |
| Traffic: vehicle types, how common, speeds, paint colours, damage | `src/config/traffic.ts` |
| Accident scenes and the crash tow trucks   | `src/config/accidents.ts`   |
| The two tow truck choices                  | `src/config/towTrucks.ts`   |
| Workshop Hell rounds                       | `src/config/workshop.ts`    |
| Menu text, help text, hotlines             | `src/config/text.ts`        |
| The 16-colour palette, road/car/truck colours | `src/config/theme.ts`    |
| Pixel art (your Tesla Roadster, sedan, SUV, sports car, motorcycle, bicycle, tow truck, palms, clouds) | `src/config/sprites.ts` |
| How chunky the pixels are (`PIXEL_SIZE`)   | `src/config/game.ts`        |
| Dust, shake, wheel spin and other effects (`ANIMATION`) | `src/config/game.ts` |
| Sound effects (pitch, length, volume) and default on/off | `src/config/sounds.ts` |
| Background music: notes, tempo, drums      | `src/config/music.ts`       |
| Menu and panel colours and fonts           | top of `src/style.css`      |
| When phones switch to sideways / upright layout | `LAYOUT` in `src/config/game.ts` |
| Juice: lean, jump stretch, landing squash and dip, money roll | `JUICE` in `src/config/game.ts` |
| From which level 0 HP means game over ("VEHICLE TOTALLED") | `GAME_OVER` in `src/config/game.ts` |
| Engine sound: volume, pitch, gear points | `ENGINE` in `src/config/sounds.ts` |
| Pedestrians: how often people cross, how fast, dogs, strollers, give-way heat | `src/config/pedestrians.ts` |
| Traffic lights and zebra crossings: where (per level) and how they behave | `trafficLights` / `crossings` in `levels.ts`; `LIGHTS` in `src/config/trafficLights.ts` |
| Where the car sits on screen               | `CAR.x` in `src/config/game.ts` |
| Number of lanes (1, 2 or 3) and highway look per level | `lanes` and `highway` in `src/config/levels.ts` |
| Lane width (the road grows with more lanes) and where vehicles sit | `ROAD` in `src/config/game.ts` |
| Mat Rempit lane-splitting and weaving       | `REMPIT` in `src/config/traffic.ts` |
| Time of day (morning, afternoon, sunset, dusk), sky colours and how often each appears | `src/config/timeOfDay.ts` |
| PJ landmarks: which level, and when they pass | `src/config/landmarks.ts`; drawings in `src/world/landmarks.ts` |
| Scenery for each level (buildings, roadside) | `scenery` in `levels.ts`; sets in `src/config/scenery.ts`; drawings in `src/world/scenery.ts` |
| Which tune each level plays, the tunes, and the tempo per level | `music` in `levels.ts`; tunes and `MUSIC_TEMPO` in `src/config/music.ts` |
| Police heat, stops, fines and the bribe gamble | `src/config/police.ts` (and `heat` on choices in `accidents.ts` / `roadEvents.ts`) |
| Highway colours (lane lines, barrier, walls, signs) | `highway` in `src/config/theme.ts` |
| Which vehicles may use the highway         | `onHighway` in `src/config/traffic.ts` |
| Brake / gas speeds and how far the car slides | `DRIVING` in `src/config/game.ts` |
| Auto full screen on phones (on/off)        | `FULL_SCREEN` in `src/config/game.ts` |
| Home Screen app name, icon and colours     | `public/manifest.webmanifest`, `public/icon-*.png` |
| Phone button positions and sizes           | "Phone layouts" at the bottom of `src/style.css` |
| Jump height, gravity, money, tow timing    | `src/config/game.ts`        |

Before you share a change, run `npm run check`. It catches typos, such as a pothole name in `levels.ts` that doesn't exist, and tells you the file and line.

### Redrawing the pixel art

In `sprites.ts`, each line of text is one row of pixels, and each character is one pixel. `.` is see-through, `0`–`9` and `a`–`j` are palette colours, and `X`/`Y`/`Z` are swappable colours. For example, the car's body colour is set in `theme.ts`, so you can repaint it without touching the art. Keep every row in a sprite the same length.

## How the code is organised

- `src/config/`: settings and content (the part you edit)
- `src/world/`: drawing and moving the road, potholes, car and tow truck
- `src/ui/`: menus, HUD, pop-ups and workshop panels
- `src/core/`: the game loop, screen fitting and controls

## Build for the web

`npm run build` creates a `dist/` folder: the finished game, ready to host (for example on GitHub Pages).

## Facts checked (November 2026)

All the dialogs (accidents, road events, police stops, tow trucks, Workshop Hell, hotlines) were checked against news reports, government pages and insurer guides in November 2026. These are game simplifications, not legal advice. Re-check before a public launch, because numbers and names change.

**Confirmed**
1. Road accidents must be reported to the police within **24 hours** (Road Transport Act 1987, s.52). A late report can mean a fine of about RM300.
2. Drivers **involved** in an accident must stop; driving off is hit-and-run. A pure **bystander** has no legal duty to stop, though calling **MERS 999** is encouraged.
3. **OD Knock-for-Knock** (Bank Negara, 2025): with comprehensive cover and a police finding that you weren't at fault, you claim from your own insurer and keep your NCD.
4. The insurance ombudsman is now the **Financial Markets Ombudsman Service (FMOS)**, formerly OFS. It's free, on 03-2272 2811.
5. Insurers ask for the **police report and the sketch plan** for claims.
6. Councils can be **liable for pothole damage**. In 2022 a Kajang driver won RM2,980 from MPKj in the Magistrates' Court small claims. The Consumer Claims Tribunal said it had **no jurisdiction** over councils.
7. Offering or giving a bribe is a crime under the **MACC Act 2009**. The MACC line is **1-800-88-6000**.
8. Speeding and red-light **compounds go up to about RM300** today. A rise to RM500 is planned for 2029.
9. **MBPJ hotline: 03-7954 2020**, or e-Aduan at embpj.mbpj.gov.my. **BNMLINK: 1-300-88-5465.**
10. **Consumer Claims Tribunal: 1-800-88-9811** (RM5 to file). 1-800-886-800 is the ministry's general complaints line, not the Tribunal.

**Fixed (were wrong)**
- "Section 107" and "Section 91" Road Transport Act claims: removed. They weren't backed up.
- "FAA 2013" right to a written report: replaced with "ask your insurer for the adjuster's report".
- "JPJ Parts hotline 1-800-88-5983" for stolen parts: missing parts are theft, so the dialog now says lodge a **police report**.
- Tribunal number 1-800-886-800, changed to 1-800-88-9811. MBPJ 03-7625 4688, changed to 03-7954 2020.
- "Bank Negara ruled in your favour", changed to FMOS. Bank Negara doesn't rule on individual disputes.
- "File with Tribunal Pengguna" against MBPJ, changed to the Magistrates' Court small claims.
- "LKPP registered" tow truck: removed. It isn't the right agency.

11. Causing death by reckless or dangerous driving (Road Transport Act 1987 s.41, amended 2020): **5–10 years' jail and a RM20,000–RM50,000 fine**. Source: news reports of the 2020 amendment; check the gazetted Act.

**Still game numbers**
- All RM rewards, fines (other than the ~RM300 compound) and HP amounts are made up for the game, including the RM3,000 penalty for injuring a pedestrian and the 30% chance a hit is fatal (`PEDESTRIAN_HIT` in `src/config/pedestrians.ts`).
