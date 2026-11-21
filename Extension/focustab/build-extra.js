import { build } from 'esbuild';

// Build service worker
await build({
  entryPoints: ['src/background/service-worker.ts'],
  bundle: true,
  outfile: 'dist/service-worker.js',
  format: 'esm',
  target: 'chrome120',
  minify: true,
});

// Build blocked page script
await build({
  entryPoints: ['src/blocked/blocked.ts'],
  bundle: true,
  outfile: 'dist/blocked.js',
  format: 'iife',
  target: 'chrome120',
  minify: true,
});

console.log('✓ service-worker.js and blocked.js built');
