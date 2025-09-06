# arch000.xyz

Modernized static site for Arch's Garry's Mod / Helix / Liro scripts.

## Features

- Semantic & accessible HTML (header/nav/main/footer, skip link, native `<dialog>`)
- Dark / Light theme toggle with persistence
- Reduced-motion friendly (respects `prefers-reduced-motion` for tilt effect)
- Animated particle background & scroll reveal
- Dynamic script card rendering from `data/scripts.json`
- Modular JS (`js/site.js`) – no framework, minimal footprint
- Custom cursor (hidden automatically on small screens / mobile)
- Toast notifications, progressive enhancement (content visible without JS)

## Data Driven Cards

Edit `data/scripts.json` to add or remove scripts. Fields:

```json
{
  "id": "unique-id",
  "name": "Display Name",
  "status": "development|beta|released",
  "short": "Short blurb shown on card",
  "description": "Longer description (can be used later on detail pages)",
  "tags": ["tag1","tag2"],
  "plannedVersion": "0.1.0"
}
```

## Adding a New Script

1. Add an object to `data/scripts.json`.
2. (Optional) Add a detail page under `scripts/<id>.html` (link card later when released).
3. Change `status` to `released` once downloadable.
4. Replace card link's `aria-disabled` by adjusting logic in `site.js` (future enhancement).

## Optional Build / Optimization

Currently the site is fully static. If you want a tiny build pipeline:

- Minify CSS/JS (optional): use an npm init and `npm install lightningcss terser`.
- Generate a hashed asset filename for cache-busting.

Example (optional) commands:

```bash
npm init -y
npm install --save-dev lightningcss terser
npx lightningcss css/custom.css -o dist/custom.min.css --minify
npx terser js/site.js -o dist/site.min.js -c -m
```

Then update HTML to reference the minified files (or automate with a small script).

## Performance Notes

- CSS is a single file, loaded early. Consider `rel="preload"` (already added) only if it materially improves LCP – otherwise can remove.
- JS is deferred; first render is not blocked.
- Particle canvas & tilt are the main animation costs; both are lightweight but you can gate them behind `prefers-reduced-motion` entirely if desired.

## Accessibility

- Skip link for keyboard users.
- Toast uses `role="status"` + `aria-live="polite"`.
- Dialog uses native `<dialog>`; ESC + close button supported.
- Hover tilt disabled for users requesting reduced motion (no abrupt transforms triggered).

## Deployment

Hosted via GitHub Pages (root). Ensure Pages is set to serve `main` branch / root.

Push changes:

```bash
git add .
git commit -m "Update site: dynamic cards + accessibility"
git push
```

Changes typically publish within a minute.

## Future Enhancements

- Add offline support with a Service Worker (cache JSON & assets).
- Provide filter/search UI for tags.
- Automated version badge per item.
- Replace inline colors with CSS custom properties for theme tokens.
- Build a detail page template + static generation script.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| JSON not loading | Check browser console network tab; ensure path `/data/scripts.json` correct (GitHub Pages is case-sensitive). |
| Cards show twice | Remove any leftover static card HTML if dynamic load used. |
| Dialog not opening | Some very old browsers: polyfill (optional). |
| Theme not persisting | LocalStorage blocked; site still works with default dark mode. |

---
MIT licensed (if you choose) – or keep private.
