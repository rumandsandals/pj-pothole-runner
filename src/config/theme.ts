/**
 * COLOURS FOR THE GAME DRAWING (road, car, potholes, tow truck).
 * Menu and panel colours live in src/style.css (top of the file).
 * "rgb" values are written as 'r,g,b' because they get faded in and out.
 */

export const THEME = {
  font: 'monospace',
  background: '#f9f9f9',
  roadTexture: '#e0e0e0',
  roadLine: '#1a1a1a',

  pothole: {
    fill: '#080808',
    shadeRgb: '0,0,0',
    crack: '#444',
    label: '#111',
    damageDot: '#444',
  },

  car: {
    shadow: 'rgba(0,0,0,0.12)',
    body: '#1a1a1a',
    roof: '#2e2e2e',
    window: '#b0b0b0',
    glare: 'rgba(255,255,255,0.5)',
    headlight: '#e8e8e8',
    tyre: '#111',
    rim: '#888',
    hub: '#444',
    smokeRgb: '60,60,60',
  },

  tow: {
    licensed: { body: '#1a1a1a', cab: '#2e2e2e', label: '#fff' },
    cheap: { body: '#555', cab: '#666', label: '#eee' },
    window: '#aaa',
    crane: '#111',
    tyre: '#111',
    rim: '#888',
    chain: '#666',
  },

  particleText: '#111',

  progress: {
    track: '#e0e0e0',
    fill: '#222',
    tick: '#bbb',
    text: '#666',
  },
};
