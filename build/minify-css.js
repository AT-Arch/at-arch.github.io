import { readFileSync, writeFileSync } from 'fs';
import { minify } from 'csso';

const input = 'css/custom.css';
const css = readFileSync(input, 'utf8');
const out = minify(css).css;
writeFileSync('css/custom.min.css', out);
console.log('CSS minified -> css/custom.min.css');
