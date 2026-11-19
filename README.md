# NEON RUSH (free hosting version)

A plain static build of the game: no Lovable account or credits needed.

## Deploy free (no coding)
1. Create a free GitHub account, then a NEW repository (example: neon-rush-game).
2. Upload everything inside this folder to it (Add file > Upload files > Commit).
3. Create a free Netlify account (netlify.com) > Add new site > Import an existing project > GitHub > pick the repo.
   Build command: `npm run build`   Publish directory: `dist`   (netlify.toml already sets these.)
4. Click Deploy. In a few minutes you get a public link like https://something.netlify.app.
   Cloudflare Pages and Vercel work the same way (Vite preset).

## Run on your own computer (optional)
Install Node.js, then in this folder: `npm install` then `npm run dev`.

Note: saved coins and runners are stored per web address, so players start fresh on a new link.
Rupee purchases: see PAYMENTS.md.
