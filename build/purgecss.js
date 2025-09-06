import { PurgeCSS } from 'purgecss';
import { writeFileSync, readFileSync } from 'fs';

const purgeCSSResult = await new PurgeCSS().purge({
  content: ['index.html','scripts/**/*.html','js/**/*.js'],
  css: ['css/custom.css'],
  safelist: [/^btn/,/^badge/,/^modal/,/^h\d$/, /^col-/, /^row$/]
});

const result = purgeCSSResult[0];
writeFileSync('css/custom.purged.css', result.css);
console.log('PurgeCSS complete -> css/custom.purged.css (size:', result.css.length, 'bytes)');
