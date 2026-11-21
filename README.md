# 🚗 PJ Pothole Runner

Dodge Petaling Jaya's potholes, survive dodgy tow trucks and Workshop Hell, and learn your consumer rights along the way.

## Play it on your Mac

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
| The two tow truck choices                  | `src/config/towTrucks.ts`   |
| Workshop Hell rounds                       | `src/config/workshop.ts`    |
| Menu text, help text, hotlines             | `src/config/text.ts`        |
| The 16-colour palette, road/car/truck colours | `src/config/theme.ts`    |
| Pixel art (car, tow truck, palms, clouds)  | `src/config/sprites.ts`     |
| How chunky the pixels are (`PIXEL_SIZE`)   | `src/config/game.ts`        |
| Menu and panel colours and fonts           | top of `src/style.css`      |
| Jump height, gravity, money, tow timing    | `src/config/game.ts`        |

Before you share a change, run `npm run check`. It catches typos, such as a pothole name in `levels.ts` that doesn't exist, and tells you the file and line.

### Redrawing the pixel art

In `sprites.ts`, each line of text is one row of pixels, and each character is one pixel. `.` is see-through, `0`–`9` and `a`–`f` are palette colours, and `X`/`Y`/`Z` are swappable colours. For example, the car's body colour is set in `theme.ts`, so you can repaint it without touching the art. Keep every row in a sprite the same length.

## How the code is organised

- `src/config/`: settings and content (the part you edit)
- `src/world/`: drawing and moving the road, potholes, car and tow truck
- `src/ui/`: menus, HUD, pop-ups and workshop panels
- `src/core/`: the game loop, screen fitting and controls

## Build for the web

`npm run build` creates a `dist/` folder: the finished game, ready to host (for example on GitHub Pages).
