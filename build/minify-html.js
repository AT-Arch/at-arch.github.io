import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { minify } from 'html-minifier-terser';

const files = await glob('{index.html,scripts/**/index.html}');
for (const f of files) {
  const html = readFileSync(f,'utf8');
  const out = await minify(html, {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    removeRedundantAttributes: true,
    keepClosingSlash: true,
    minifyCSS: true,
    minifyJS: true
  });
  writeFileSync(f.replace(/index\.html$/, 'index.min.html'), out);
  console.log('Minified', f);
}
