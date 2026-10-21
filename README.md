# វចនានុក្រមខ្មែរ — Khmer Dictionary

A mobile-friendly Khmer dictionary web app built with React + Vite. It loads the included `public/data/kh_dictionary.csv` dataset and supports Khmer/English keyboard search against Khmer headwords and definitions.

## Run locally (Termux or computer)

```bash
pkg update
pkg install nodejs-lts git
npm install
npm run dev -- --host 0.0.0.0
```

Open the local URL printed by Vite. For production build:

```bash
npm run build
```

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. In Vercel choose **Add New → Project** and import that repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Deploy.

## Dataset attribution and license

The included dictionary data is from the Khmer Choun Nath Dictionary digitalized by the Open Institute as part of the SPICE program. The source repository indicates the data is offered under LGPL 2.1. Keep the attribution and `LICENSE` file when redistributing. This web app is a new interface around the dataset; it does not claim the source data itself is newly authored.

## Upgrade notes (v2.0.0)

- Dependencies are set to `latest`; the first `npm install` resolves the newest releases and writes `package-lock.json`. Commit that file to pin them.
- Requires Node.js 22.x (matches Vercel's Node 22 setting) (Termux: `pkg install nodejs-lts`).
- `main.jsx` now uses React 19 features (`StrictMode`, `useDeferredValue`), `fetch` + `AbortController` for loading, pre-normalized search index, keyboard-accessible result cards, copy feedback, and scroll-to-top on paging.

## Vercel checklist

1. Run `npm install` locally once and commit `package-lock.json` (so Vercel installs the same versions every deploy).
2. Push to GitHub and import the repo in Vercel: Framework **Vite**, build `npm run build`, output `dist` (already set in `vercel.json`).
3. In Project Settings > General, set Node.js Version to **22.x**.
