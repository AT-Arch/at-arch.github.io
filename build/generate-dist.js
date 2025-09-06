import { mkdirSync, rmSync, copyFileSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const dist = 'dist';
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
mkdirSync(path.join(dist,'css'), { recursive: true });
mkdirSync(path.join(dist,'js'), { recursive: true });
mkdirSync(path.join(dist,'data'), { recursive: true });

function copyRecursive(srcDir, destDir) {
  for (const entry of readdirSync(srcDir)) {
    const s = path.join(srcDir, entry);
    const d = path.join(destDir, entry);
    const st = statSync(s);
    if (st.isDirectory()) {
      mkdirSync(d, { recursive: true });
      copyRecursive(s,d);
    } else if (/index\.html$/.test(entry)) {
      // Prefer minified if exists
      const minCandidate = s.replace(/index\.html$/, 'index.min.html');
      if (statExists(minCandidate)) copyFileSync(minCandidate, path.join(destDir, entry));
      else copyFileSync(s,d);
    } else if (/\.map$/.test(entry)) { /* skip maps */ }
    else copyFileSync(s,d);
  }
}
function statExists(f){ try { statSync(f); return true; } catch { return false; } }

// Copy root HTML (minified if available)
if (statExists('index.min.html')) copyFileSync('index.min.html', path.join(dist,'index.html')); else copyFileSync('index.html', path.join(dist,'index.html'));

// Copy scripts section
copyRecursive('scripts', path.join(dist,'scripts'));

// Choose CSS artifact preference: purged -> min -> original
if (statExists('css/custom.purged.css')) copyFileSync('css/custom.purged.css', path.join(dist,'css/custom.css'));
else if (statExists('css/custom.min.css')) copyFileSync('css/custom.min.css', path.join(dist,'css/custom.css'));
else copyFileSync('css/custom.css', path.join(dist,'css/custom.css'));

// Choose JS artifact: min -> original
if (statExists('js/site.min.js')) copyFileSync('js/site.min.js', path.join(dist,'js/site.js')); else copyFileSync('js/site.js', path.join(dist,'js/site.js'));

// Data
copyFileSync('data/scripts.json', path.join(dist,'data/scripts.json'));

// Assets list for SW manifest (generate)
const assetFiles = await glob('{dist/**/*.{html,css,js,json}}');
writeFileSync(path.join(dist,'asset-manifest.json'), JSON.stringify(assetFiles.map(f=>f.replace(/^dist/,'')).sort(), null, 2));
console.log('Dist build complete. Files:', assetFiles.length);
