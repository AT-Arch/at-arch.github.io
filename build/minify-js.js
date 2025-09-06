import { readFileSync, writeFileSync } from 'fs';
import { minify } from 'terser';

const input = 'js/site.js';
const code = readFileSync(input, 'utf8');
const result = await minify(code, { compress: true, mangle: true });
writeFileSync('js/site.min.js', result.code);
console.log('JS minified -> js/site.min.js');
