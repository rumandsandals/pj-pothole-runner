import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// base: './' lets the built game run from any web address (e.g. GitHub Pages).
// `npm run play` (mode "file") packs the whole game — code, fonts, everything —
// into ONE html file you can double-click to play, no server needed.
export default defineConfig(({ mode }) =>
  mode === 'file'
    ? { base: './', plugins: [viteSingleFile()], build: { outDir: 'play', emptyOutDir: true } }
    : { base: './' },
);
