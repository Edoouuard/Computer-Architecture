// Build : assemble src/ en un seul fichier dist/index.html, ouvrable hors ligne.
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const res = await build({ entryPoints: ['src/main.js'], bundle: true, format: 'iife', target: 'es2020', minify: false, write: false, charset: 'utf8' });
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = await readFile('src/styles.css', 'utf8');
const html = (await readFile('src/index.html', 'utf8')).replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => js);
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html);
console.log(`dist/index.html : ${(html.length / 1024).toFixed(0)} Ko`);
