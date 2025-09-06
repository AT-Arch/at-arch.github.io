import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Very naive purge: keeps only rules whose selectors appear in HTML/JS text.
(async () => {
  const files = await glob('{index.html,scripts/**/*.html,js/**/*.js}');
  let content = '';
  for (const f of files) content += readFileSync(f, 'utf8');
  let css = readFileSync('css/custom.css', 'utf8');
  // This is intentionally conservative to avoid stripping needed styles.
  // (Production: use PurgeCSS or similar.)
  const kept = css.split(/}\s*/).filter(block => {
    const sel = block.split('{')[0];
    if(!sel) return false;
    return sel.split(',').some(s => content.includes(s.trim().replace(/^[.#]/,'')));
  }).join('}\n');
  writeFileSync('css/custom.purged.css', kept);
  console.log('Generated css/custom.purged.css (conservative).');
})();
