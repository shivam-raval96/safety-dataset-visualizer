import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
// This dedicated Worker serves only the comment API. GitHub Pages continues to
// use build:static; the existing vinext build remains available independently.
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/.openai', { recursive: true });
await build({ entryPoints: ['service/comments-worker.ts'], outfile: 'dist/server/index.js', bundle: true, format: 'esm', platform: 'browser', target: 'es2022', minify: true });
cpSync('.openai/hosting.json', 'dist/.openai/hosting.json');
cpSync('drizzle', 'dist/.openai/drizzle', { recursive: true });
console.log('Built the comments Worker with database migrations.');
