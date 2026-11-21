/**
 * PIXEL ART
 * Each string is one row of pixels; each character is one pixel.
 *   .        = see-through
 *   0-9, a-f = a colour from the palette in theme.ts
 *   X, Y, Z  = swappable colours (set in theme.ts, e.g. car body colour)
 * Keep every row in a sprite the same length. `npm run check` and the
 * browser console will tell you if a row is the wrong length.
 */

/** Red hatchback, facing right. X = body, Y = trim, c = windows, a = headlight, e = tail light. */
export const CAR_SPRITE = [
  '.......YYYYYYYYYY.........',
  '......YXcccXccccXXY.......',
  '.....YXccccXcccccXXXY.....',
  '....YXcccccXccccccXXXXYY..',
  '.YXXXXXXXXXXXXXXXXXXXXXXXY',
  'YXXXXXXXXXXXXXXXXXXXXXXXaY',
  'eXXXXXXXXXXXXXXXXXXXXXXXXY',
  'YXXXXXXXXXXXXXXXXXXXXXXXXY',
  'YYY000000YYYYYYYY000000YYY',
  '...005500........005500...',
  '...056650........056650...',
  '...005500........005500...',
  '....0000..........0000....',
];

/** Tow truck: crane on the left, cab on the right. X = body, Y = stripe, Z = cab. */
export const TOW_TRUCK_SPRITE = [
  '..aaaaaaa...........................',
  '..a.....a...........................',
  '..0.....a...................ZZZZZZ..',
  '.000....a..................ZccccZZ..',
  '.0.0....a..................ZccccZZZ.',
  '........a..................ZccccZZZZ',
  'XXXXXXXXXXXXXXXXXXXXXXXXXXXZZZZZZZZZ',
  'XXXXXXXXXXXXXXXXXXXXXXXXXXXZZZZZZZZa',
  'XYYYYYYYYYYYYYYYYYYYYYYYYYXZZZZZZZZZ',
  'XYYYYYYYYYYYYYYYYYYYYYYYYYXZZZZZZZZZ',
  'XXXXXXXXXXXXXXXXXXXXXXXXXXXZZZZZZZZZ',
  '555000000555555555555500000055555555',
  '...005500.............005500........',
  '...056650.............056650........',
  '...005500.............005500........',
  '....0000...............0000.........',
];

export const PALM_SPRITE = [
  '...bb.bb...',
  '.bb33b33bb.',
  'b33.343.33b',
  '3...444...3',
  '.....4.....',
  '.....4.....',
  '....44.....',
  '....4......',
  '....4......',
  '....44.....',
  '.....4.....',
  '.....4.....',
  '....44.....',
  '....4......',
  '....4......',
  '...444.....',
];

export const CLOUD_SPRITE = [
  '.....7777.......',
  '...77777777.77..',
  '.7777777777777..',
  '7777777777777777',
  '.66666666666666.',
];
