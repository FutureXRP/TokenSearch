# Crypto News Search — GitHub Pages
A static site that aggregates crypto headlines from the last 12 months. A GitHub Action fetches RSS feeds and writes `public/news.json`; the front-end filters client-side by your search term.

## Quick start
1. **Use this repo** (or copy these files) and push to your GitHub account.
2. In your repo, go to **Settings → Pages** and set the branch to `main` and the folder to `/root` (or `/docs` if you move files there). Save.
3. Go to **Actions** and enable workflows if prompted. The first run will generate `public/news.json`. If it doesn't trigger automatically, manually run the "Build news.json" workflow from the Actions tab.
4. Open your site at `https://<username>.github.io/<repo>/`.

## Customize
- Add/remove feeds in `scripts/build.js` (`CRYPTO_FEEDS`). Only use official/public RSS.
- Adjust the cron schedule in `.github/workflows/build.yml`.
- Styling tweaks live in `index.html` (Tailwind CDN) and `assets/main.js`.

## Compliance
- Uses RSS headlines/snippets, links out to sources.
- No paywall bypassing; respects publishers' distribution via RSS.

## Local dev
```bash
npm i
npm run build
# open index.html via Live Server or any static server
