import { build } from 'esbuild';
await build({
  entryPoints: ['functions/src/index.ts'],
  outfile: 'functions/lib/index.js',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  external: [
    'firebase-admin',
    'firebase-admin/*',
    'firebase-functions',
    'firebase-functions/*',
    'node:*',
  ],
  sourcemap: true,
});
console.log('Firebase notification and recovery functions built.');
