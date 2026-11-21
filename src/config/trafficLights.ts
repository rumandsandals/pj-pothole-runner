/**
 * TRAFFIC LIGHTS & ZEBRA CROSSINGS
 * Where they appear is set per level in levels.ts (`trafficLights` and
 * `crossings`, as shares of the level: 0.5 = halfway).
 *
 * How a traffic light works:
 *   1. It's green as you approach. When you get close, it may turn amber, then red.
 *   2. Hold BRAKE to stop before the white stop line. Once stopped you stay
 *      stopped until it turns green.
 *   3. Cars ahead queue at the line; motorcyclists filter between them and
 *      bunch up in front of the first car. Mat Rempit… run it.
 *   4. Driving over the line on red = "RAN RED LIGHT!" (police heat).
 *
 * ⚠️ FACT-CHECK: the red-light fine in police.ts is a game number.
 */
export const LIGHTS = {
  changeWhenWithin: 430, // the light decides to change when you're this close (world units)
  redChance: 0.75, // how often it turns red (otherwise it stays green and you drive through)
  amberTicks: 50, // amber lasts this long (~0.8 s) before red
  greenAfterStoppedTicks: 150, // once you've stopped, it turns green after this long (~2.5 s)
  maxRedTicks: 480, // and never stays red longer than this (~8 s)
  brakeZone: 380, // braking this close to a red / amber light brings you to a full stop
  stopPower: 1.6, // how hard you brake when stopping for a light (× normal braking)
  runRedHeat: 30, // police heat for running a red light

  carStopGap: 14, // cars stop this far behind the stop line
  carQueueSpacing: 70, // space between queued cars
  bikeStopGap: 4, // motorcycles creep right up to the line…
  bikeBunchSpacing: 10, // …and bunch up close together, in front of the first car
};
