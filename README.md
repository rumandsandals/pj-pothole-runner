# 🚗 PJ Pothole Runner

Dodge Petaling Jaya's potholes, survive dodgy tow trucks and Workshop Hell, and learn your consumer rights along the way.

## Controls

↑ ↓ (W S) change lane · hold ← → (A D) to brake / speed up · Space jumps · M music · F full screen.
On phones: on-screen buttons, or swipe up/down on the road and tap to jump.

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
| Pixel art (your Mazda, sedan, SUV, sports car, motorcycle, bicycle, tow truck, palms, clouds) | `src/config/sprites.ts` |
| How chunky the pixels are (`PIXEL_SIZE`)   | `src/config/game.ts`        |
| Dust, shake, wheel spin and other effects (`ANIMATION`) | `src/config/game.ts` |
| Sound effects (pitch, length, volume) and default on/off | `src/config/sounds.ts` |
| Background music: notes, tempo, drums      | `src/config/music.ts`       |
| Menu and panel colours and fonts           | top of `src/style.css`      |
| When phones switch to sideways / upright layout | `LAYOUT` in `src/config/game.ts` |
| Where the car sits on screen               | `CAR.x` in `src/config/game.ts` |
| Number of lanes (1, 2 or 3) and highway look per level | `lanes` and `highway` in `src/config/levels.ts` |
| Lane width (the road grows with more lanes) and where vehicles sit | `ROAD` in `src/config/game.ts` |
| Mat Rempit lane-splitting and weaving       | `REMPIT` in `src/config/traffic.ts` |
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

## Facts to verify before sharing

The accident scenes (`src/config/accidents.ts`) were drafted for the game. Check each point against an official source before you share the game publicly:

1. Road accidents in Malaysia must be reported to the police within **24 hours** (Road Transport Act 1987, section 52).
2. Drivers involved in an accident must **stop and help**. Driving off (hit-and-run) is an offence.
3. **999** is the emergency number to call.
4. Without a police report, an insurance claim **may be rejected**.
5. **Knock-for-Knock**: if you weren't at fault, you can claim from your **own** insurer, and your **NCD is not affected**.
6. The **Ombudsman for Financial Services (OFS)** handles insurance disputes **free of charge** for consumers.
7. Insurers need a copy of the **police report and the accident sketch plan** for a serious claim.
8. Many motor policies include **free towing** to a panel workshop, up to a limit. This varies by insurer.
9. **"Ulat" tow touts** at crash scenes: the advice "never let a tow truck you didn't call take your car".
10. The RM amounts and outcomes are game numbers, not real figures.

The hotlines in `src/config/text.ts` (MBPJ, MACC, Tribunal, JPJ, BNM) came from the original game and should be re-checked too.
