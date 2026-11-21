/**
 * PIXEL ART
 * Each string is one row of pixels; each character is one pixel.
 *   .        = see-through
 *   0-9, a-j = a colour from the palette in theme.ts
 *   X, Y, Z  = swappable colours (set per vehicle, e.g. paint colour)
 * Keep every row in a sprite the same length. `npm run check` and the
 * browser console will tell you if a row is the wrong length.
 *
 * Vehicles are drawn in two parts — body and wheels — so the wheels can
 * spin. VEHICLE_ART (bottom of this file) says which wheels go where.
 * All vehicles face right.
 */

/** YOUR CAR: Mazda 3 hatchback (BM, 2013-2018). X = paint, Y = paint shadow. */
export const HATCHBACK_BODY = [
  '............................................................',
  '...............00000000000000000............................',
  '..........00000XXXXXXXXXXXXXXXXX000.........................',
  '......0000XXXX0Xjjjjjjjjj00jjjjjjXX00.......................',
  '......00XXXXjj0jjjjjj7jjj00jjjjjj7jXX0......................',
  '.....0XXXXXjjj0jjjjj77jjj00jjjjj7jjjjX0.....................',
  '....0XXXXXXjjj0jjjjj7jjjj00jjjjj7jjjjjX00...................',
  '...0XXXXXXjjjj0jjjjjjjjjj00jjjj7jjjjjjjXYY..................',
  'iiiiiXXXXXXXXX0XXXXXXXXXX00XXXXXXXXXXjjjYY0000..............',
  'eeeeeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX000000........',
  'eeeeeXXXXYYYYYXXXXXXXXXXXXYXXXXXXXXXXXXXXYXXXXXXXXX7777.....',
  'iiiiXXXXXX0000YYYYYY66XXXXYXXXXXXX66XXXXXYYY0000XXXXXXaaaa..',
  '0XXXXXXX00gggg00XXXXXYYYYYYXXXXXXYYYYYYYYY00gggg00XXXXXXX0..',
  '0XXXXXX0gggggggg0XXXXXXXXXYYYYYYYXXXXXXXX0gggggggg0XXXXXX000',
  '0XXXXX00gggggggg00XXXXXXXXYXXXXXXXXXXXXX00gggggggg00XXXXX000',
  '0XXXXX0gggggggggg0XXXXXXXXYXXXXXXXXXXXXX0gggggggggg0XXXXX000',
  '.0XXXX0gggggggggg0XXXXXXXXYXXXXXXXXXXXXX0gggggggggg0XXXXX000',
  '.0YYYY0gggggggggg0YYYYYYYYYYYYYYYYYYYYYY0gggggggggg0YYYYY000',
  '.5555Y0gggggggggg0YYYYYYYYYYYYYYYYYYYYYY0gggggggggg0YYYYYYhh',
  '.5555Y0gggggggggg0YYYYYYYYYYYYYYYYYYYYYY0gggggggggg0YYYYY0..',
  '.5555000gggggggg00000000000000000000000000gggggggg0000000...',
  '............................................................',
];

/** Sedan (separate boot). X = paint, Y = paint shadow. */
export const SEDAN_BODY = [
  '..............................................................',
  '..............................................................',
  '................000000000000000000000000......................',
  '...............0XXXXjjjjjjjXXjjjjjjjXXXX0.....................',
  '..............0XXjjjjjjjjjjXXjjjj7jjjjjXX0....................',
  '.............0XXjjjjjjjjjjjXXjjj7jjjjjjjXX0...................',
  '............0XXjjjjjjjjjjjjXXjjj7jjjjjjjjXX0..................',
  '......000000XXjjjjjjjjjjjjjXXjj7jjjjjjjjjjXYY.................',
  '..0000XXXXXXXjjjjjjjjjjjjjjXXjjjjjjjjjjjjjjYY0000.............',
  '.888XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX00000........',
  '0888XXXXXXXXXXXXXXXXXXXXXXXXYXXXXXXXXXXXXYXXXXXXXXXXXX0000....',
  '0888XXXXXXX0000XXXXXXXX66XXXYXXXXXXX66XXXYXXXXX0000XXXXXXXaaa.',
  '0XXXXXXXX00gggg00XXXXXXXXXXXYXXXXXXXXXXXXYXXX00gggg00XXXXXaaa.',
  '0XYYYYYY0gggggggg0YYYYYYYYYYYYYYYYYYYYYYYYYY0gggggggg0YYYYY77.',
  '0XXXXXX00gggggggg00XXXXXXXXXYXXXXXXXXXXXXYX00gggggggg00XXXXX0.',
  '0XXXXXX0gggggggggg0XXXXXXXXXYXXXXXXXXXXXXYX0gggggggggg0XXXXX0.',
  '.0YYYYY0gggggggggg0YYYYYYYYYYYYYYYYYYYYYYYY0gggggggggg0YYYYY0.',
  '.0YYYYY0gggggggggg0YYYYYYYYYYYYYYYYYYYYYYYY0gggggggggg0YYYYY0.',
  '.5555YY0gggggggggg0YYYYYYYYYYYYYYYYYYYYYYYY0gggggggggg0YY5555.',
  '.5555YY0gggggggggg0YYYYYYYYYYYYYYYYYYYYYYYY0gggggggggg0YY555..',
  '.55550000gggggggg0000000000000000000000000000gggggggg000055...',
  '..............................................................',
];

/** SUV (tall, roof rails, black cladding). X = paint, Y = paint shadow. */
export const SUV_BODY = [
  '....66666666666666666666666666666666666.......................',
  '....0000600000000000000000000000006000000.....................',
  '..00XXXXXXXXXXXXXjjjjjjjjjjjjXXjjjjjjjjjX00...................',
  '.0XXjjjjjjjjjjjXXjjjjjjjjjjjjXXjjjjjjjjjjXX0..................',
  '.0XXjjjjjjjjjjjXXjjjjjjjjjjjjXXjjjjjj7jjjjXX0.................',
  '0XXXjjjjjjjjjjjXXjjjjjjjjjjjjXXjjjjjj7jjjjjX0.................',
  '0XXXjjjjjjjjjjjXXjjjjjjjjjjjjXXjjjjj7jjjjjjjX0................',
  '0XXjjjjjjjjjjjjXXjjjjjjjjjjjjXXjjjj7jjjjjjjjjX0...............',
  '0XXjjjjjjjjjjjjXXjjjjjjjjjjjjXXjjjj7jjjjjjjjjjX0..............',
  '088jjjjjjjjjjjjXXjjjjjjjjjjjjXXjjjjjjjjjjjjjjjjX0.............',
  '088jjjjjjjjjjjjXXjjjjjjjjjjjjXXjjjjjjjjjjjjjjjjYY00000........',
  '088XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXYY0XXXX000000..',
  '088XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0.',
  '088XXXXXXXXXXXXXYXXXXXXXXXXXXXYXXXXXXXXXXXXXYXXXXXXXXXXXXaaaa.',
  '088XXXXXXXXXXXXXYXXXXXXX66XXXXYXXXXXXX66XXXXYXXXXXXXXXXXXaaaa.',
  '0XXXXXXXXXX0000XYXXXXXXXXXXXXXYXXXXXXXXXXXXXYXX0000XXXXXXaaaa.',
  '.0YYYYYYY00gggg00YYYYYYYYYYYYYYYYYYYYYYYYYYYY00gggg00YYYYYY77.',
  '.0XXXXXX0gggggggg0XXXXXXXXXXXXYXXXXXXXXXXXXX0gggggggg0XXXXXX0.',
  '.0XXXXX0gggggggggg0XXXXXXXXXXXYXXXXXXXXXXXX0gggggggggg0XXXXX0.',
  '.0XXXX0gggggggggggg0XXXXXXXXXXYXXXXXXXXXXX0gggggggggggg0XXXX0.',
  '.0XXXX0gggggggggggg0XXXXXXXXXXYXXXXXXXXXXX0gggggggggggg0XXXX0.',
  '.0YYYY0gggggggggggg0YYYYYYYYYYYYYYYYYYYYYY0gggggggggggg0YYYY0.',
  '.5555Y0gggggggggggg0YYYYYYYYYYYYYYYYYYYYYY0gggggggggggg0Y5555.',
  '.5gggg0gggggggggggg0gggggggggggggggggggggg0gggggggggggg0gggg5.',
  '.5gggg0gggggggggggg0gggggggggggggggggggggg0gggggggggggg0gggg5.',
  '.555500gggggggggggg000000000000000000000000gggggggggggg00555..',
  '..............................................................',
  '..............................................................',
];

/** Sports car (low wedge, spoiler, stripe). X = paint, Y = paint shadow. */
export const SPORTS_BODY = [
  '..............................................................',
  '.....................00000000000..............................',
  '...................00XXXXXXXXXXX000...........................',
  '0000000..........00XXXXjjjjjjXXjjj7000........................',
  '..0..0.........00XXXXXjjjjjjjXXjjj7jjX00......................',
  '..0..0..0000000XXXXXXjjjjjjjjXXjj7jjjjXXYY....................',
  '..000000XXXXXXXXXXXXjjjjjjjjjXXjj7jjjjjjYY00..................',
  '.0XXXXXXXXX0000XXXXXXXXXXXXXXXXXXXXXXXXXXXXX0000..............',
  '08888XXXX00gggg00XXXXXXXXXXXXXYXXXXXXXXXXXXX00gggg00000.......',
  '08888XXX0gggggggg0XXXXXXXXXXXXYXXXXX66XXXXX0gggggggg0XX0000...',
  '0XXXXXX00gggggggg00XXXXXXXXXXXYXXXXXXXXXXX00gggggggg00XXXXaaa.',
  '0XYYYYY0gg77777777777777777777777777777777777777777gg0YYYYYX0.',
  '.0XXXXX0gggggggggg0XXXXXXXXXXXYXXXXXXXXXXX0gggggggggg0XXXXXX0.',
  '.0YYYYY0gggggggggg0YYYYYYYYYYYYYYYYYYYYYYY0gggggggggg0YYYYYY0.',
  '.0YYYYY0gggggggggg0YYYYYYYYYYYYYYYYYYYYYYY0gggggggggg0YYYYYY0.',
  '.555YYY0gggggggggg0YYYYYYYYYYYYYYYYYYYYYYY0gggggggggg0YYYY55..',
  '.55500000gggggggg000000000000000000000000000gggggggg0000005...',
  '..............................................................',
];

/** Motorcycle and rider. X = jacket, Y = helmet, Z = bike paint. */
export const MOTORCYCLE_BODY = [
  '.............YYYY.................',
  '............YYYYYY................',
  '............YYYYYY7...............',
  '...........YYYYYccc...............',
  '............YYYYccc...............',
  '............YYYYYY................',
  '.............YYYY.................',
  '.............XXXX........f00......',
  '............XXXXXX......XX0.......',
  '............0XXXXXXX....X.0.......',
  '...........0XXXXXXXXXXXX...0......',
  '...........XXXXXXXX........0......',
  '...........XXXXXXX..........ZZZ...',
  '...........X111XX...........ZZaa..',
  '...........11111111ZZZZZZ..6ZZZ...',
  '.....00000000Z111111ZZZZZZ.6......',
  '....00000000ZZZZZ1111ZZZZZZ.6.....',
  '..88.....ZZZZZZZZZ1111ZZZZ..6.....',
  '.......5.ZZZZZhhhhh11ZZZZZ..6.....',
  '......5.ZZZZZZh55555000ZZ....6....',
  '..6655........hhhhhh000......6....',
  '..6656.........555555........6....',
  '...5..66......................6...',
  '..5.....66666666666666........6...',
  '..................................',
  '..................................',
  '..................................',
  '..................................',
  '..................................',
  '..................................',
];

/** Bicycle and rider: thin frame, no engine. X = shirt, Y = helmet, Z = frame. */
export const BICYCLE_BODY = [
  '...........YYYY.................',
  '..........YYYYYY................',
  '..........YYYYYY................',
  '..........YYYYff................',
  '..........YYYYff................',
  '..........YYYYYf................',
  '...........XXXY.................',
  '..........XXXXXX................',
  '..........XXXXXX................',
  '..........XXXXXXX..ff000........',
  '..........XXXXX..Xff.6..........',
  '..........XXXXX.......6.........',
  '.........0XX11X.......6.aa......',
  '...........1111ZZZZZZZ66........',
  '...........Z111......Z6.........',
  '..........Z.1111....Z..6........',
  '..........Z.1.111...Z..6........',
  '.........Z..1..1...Z...6........',
  '........ZZ..1Z..1ZZ.....6.......',
  '........Z...1Z..1........6......',
  '.......Z....66..1........6......',
  '.......Z......6Z1........6......',
  '......Z...ZZZZ6.1.........6.....',
  '......ZZZZZ...6.1.........6.....',
  '...............61...............',
  '...............000..............',
  '................................',
  '................................',
  '................................',
  '................................',
];

/** Tow truck: crane on the left, cab on the right. X = body, Y = stripe, Z = cab. */
export const TOW_TRUCK_BODY = [
  '......................................................55..........................',
  '......................................................66..........................',
  '.........00aa.........................................66..........................',
  '........0.aaa.........................................66..........................',
  '......00.aa.aa........................................6600000000000000............',
  '.....0...aa.aa........................................660ZZZZZZZZZZZZZ0...........',
  '...60....aa.aa........................................660ZZZZZZZZZZZZZZ0..........',
  '...6.....aaaaaaa......................................660ZZjjjjjjjjjjZZ0..........',
  '...6....aa...aa.......................................660ZZjjjjjjjj7jjZZ0.........',
  '...6....aa....aa......................................660ZZjjjjjjjj7jjjZZ0........',
  '...6...aa.....aa......................................660ZZjjjjjjj7jjjjjZ0........',
  '..06...aa......aa.....................................660ZZjjjjjjj7jjjjjjZ0.......',
  '..000..aa......aa.....................................660ZZjjjjjjjjjjjjjjjZ0......',
  '.......aa......aa.....................................660ZZZZZZZZZZZZZZZZZZZ0.....',
  '......aa........aa....................................660ZZZZZZZZZZZ0ZZZZZZZZ00...',
  '..0000aa00000000aa00000000000000000000000000000000000000ZZZZZZZZZZZZ0ZZZZZZZZZZ0..',
  '..0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXZZZZZZZZ66ZZ0ZZZZZZZZZaaa.',
  '..0XXXXXXXXXXXXXXXXXXXXXXXXX5555555555555XXXXXXXXXXXXXXXZZZZZZZZZZZZ0ZZZZZZZZZaaa.',
  '..0XXXXXXXXXXXXXXXXXXXXXXXXX5666666666665XXXXXXXXXXXXXXXZZZZZZZZZZZZ0ZZZZZZZZZZ0..',
  '..0XXXXXXXXXXX0000XXXXXXXXXX5555555555555XXXXXXXXXXXXXXXZZZZZZZZ00000ZZZZZZZZZZ000',
  '..0XXXXXXXXX00gggg00XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXZZZZZZ00gggg00ZZZZZZZZZ000',
  '..0YYYYYYYY0gggggggg0YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYZZZZZ0gggggggg0ZZZZZZZZ000',
  '..0YYYYYYY0gggggggggg0YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYZZZZ0gggggggggg0ZZZZZZZ000',
  '..0XXXXXX0gggggggggggg0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXZZZ0gggggggggggg0ZZZZZZ000',
  '..0XXXXXX0gggggggggggg0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXZZZ0gggggggggggg0066666666',
  '..00000000gggggggggggg00000000000000000000000000000000000000gggggggg......66666666',
  '..................................................................................',
  '..................................................................................',
  '..................................................................................',
  '..................................................................................',
  '..................................................................................',
  '..................................................................................',
];

/** Car wheel (two pictures, swapped to make it spin). */
export const CAR_WHEEL_1 = [
  '...0000...',
  '.00000000.',
  '.006h6600.',
  '0066h66600',
  '00hh55hhh0',
  '0066556600',
  '0066h66600',
  '.006h6600.',
  '.000h0000.',
  '...0000...',
];

/** CAR_WHEEL_2 (second spin frame). */
export const CAR_WHEEL_2 = [
  '...0000...',
  '.00000000.',
  '.0h6666h0.',
  '006h66h600',
  '0066556600',
  '0066556600',
  '006h66h600',
  '.0h6666h0.',
  '.00000000.',
  '...0000...',
];

/** Bigger wheel for SUVs and the tow truck. */
export const SUV_WHEEL_1 = [
  '....0000....',
  '..00000000..',
  '.006666h600.',
  '.0h666h6660.',
  '006hh5566600',
  '006655556600',
  '00665555hhh0',
  '006hh5566600',
  '.0h666h6660.',
  '.006666h600.',
  '..00000000..',
  '....0000....',
];

/** SUV_WHEEL_2 (second spin frame). */
export const SUV_WHEEL_2 = [
  '....0000....',
  '..00000000..',
  '.006h666600.',
  '.0666h666h0.',
  '0066655hh600',
  '006655556600',
  '00hh55556600',
  '0066655hh600',
  '.0666h666h0.',
  '.006h666600.',
  '..00000000..',
  '....0000....',
];

/** Motorcycle wheel. */
export const MOTO_WHEEL_1 = [
  '...0000...',
  '.00000000.',
  '.00hhhh00.',
  '00hhhhhh00',
  '00hh66hhh0',
  '00hh66hh00',
  '00hhhhhh00',
  '.00hhhh00.',
  '.00000000.',
  '...0000...',
];

/** MOTO_WHEEL_2 (second spin frame). */
export const MOTO_WHEEL_2 = [
  '...0000...',
  '.00000000.',
  '.00hhhh00.',
  '00hhhhhh00',
  '00hh66hh00',
  '00hh66hh00',
  '00hhhhhh00',
  '.00hhhh00.',
  '.00000000.',
  '...0000...',
];

/** Bicycle wheel: thin tyre, see-through spokes. */
export const BIKE_WHEEL_1 = [
  '....0000....',
  '..00..6.00..',
  '.06...6..60.',
  '.0.6..6.6.0.',
  '0...6.66...0',
  '0....55....0',
  '066665566660',
  '0...6.66...0',
  '.0.6..6.6.0.',
  '.06...6..60.',
  '..00..6.00..',
  '....0000....',
];

/** BIKE_WHEEL_2 (second spin frame). */
export const BIKE_WHEEL_2 = [
  '....0000....',
  '..006..600..',
  '.0..6..6..0.',
  '.0...66...0.',
  '066..66..660',
  '0..665566..0',
  '0..665566..0',
  '066..66..660',
  '.0...66...0.',
  '.0..6..6..0.',
  '..006..600..',
  '....0000....',
];

/** Roadside palm tree. */
export const PALM = [
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '.......333..3.bb333.......',
  '......3333bb3b3bbb3.......',
  '.....3333b3bbbb3333333....',
  '...333333bb3333bb3.3333...',
  '..333.3.3334422333...33...',
  '..3...333..4422..333...3..',
  '.....333....44....333.....',
  '....333.....22.....333....',
  '....3.......22.......3....',
  '............44............',
  '............44............',
  '.............22...........',
  '.............22...........',
  '.............44...........',
  '.............44...........',
  '.............222..........',
  '.............222..........',
  '.............444..........',
  '..............444.........',
  '..............222.........',
  '..............222.........',
  '..............444.........',
  '..............444.........',
  '..............222.........',
  '..............222.........',
  '..............444.........',
  '..............444.........',
  '..............222.........',
  '..............222.........',
  '..............444.........',
  '..............444.........',
  '..............222.........',
  '..............222.........',
  '..............444.........',
  '..............444.........',
];

/** Cloud. */
export const CLOUD = [
  '...............777777...................',
  '.............7777777777.................',
  '.............7777777777.777777..........',
  '............7777777777777777777.........',
  '........777777777777777777777777........',
  '......77777777777777777777777777........',
  '......777777777777777777777777777777....',
  '...777777777777777777777777777777777....',
  '..77777777777777777777777777777777777...',
  '..77777777777777777777777777777777777...',
  '.6777777777777777777777777777777777777..',
  '..777777777767767767767767767767767767..',
  '..667766767766666666666666666666666666..',
  '...6666.6666............................',
];

export interface VehicleArt {
  body: string[];
  wheels: [string[], string[]]; // two spin frames
  wheelX: number[]; // wheel centres, pixels from the body's left edge
  wheelY: number; // wheel centre, pixels from the body's top edge
}

/** Which body and wheels make up each vehicle. */
export const VEHICLE_ART = {
  hatchback: { body: HATCHBACK_BODY, wheels: [CAR_WHEEL_1, CAR_WHEEL_2], wheelX: [12, 46], wheelY: 17 },
  sedan: { body: SEDAN_BODY, wheels: [CAR_WHEEL_1, CAR_WHEEL_2], wheelX: [13, 49], wheelY: 17 },
  suv: { body: SUV_BODY, wheels: [SUV_WHEEL_1, SUV_WHEEL_2], wheelX: [13, 49], wheelY: 22 },
  sports: { body: SPORTS_BODY, wheels: [CAR_WHEEL_1, CAR_WHEEL_2], wheelX: [13, 48], wheelY: 13 },
  motorcycle: { body: MOTORCYCLE_BODY, wheels: [MOTO_WHEEL_1, MOTO_WHEEL_2], wheelX: [6, 28], wheelY: 24 },
  bicycle: { body: BICYCLE_BODY, wheels: [BIKE_WHEEL_1, BIKE_WHEEL_2], wheelX: [6, 26], wheelY: 23 },
  towTruck: { body: TOW_TRUCK_BODY, wheels: [SUV_WHEEL_1, SUV_WHEEL_2], wheelX: [16, 66], wheelY: 26 },
} satisfies Record<string, VehicleArt>;

export type VehicleArtName = keyof typeof VEHICLE_ART;
