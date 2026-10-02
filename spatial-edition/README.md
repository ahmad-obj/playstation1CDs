# PLAY / BACK — Spatial edition

A React, TypeScript and Three.js exhibition of eleven original PlayStation discs. Browse physical objects in studio or after-hours lighting, inspect their reverse, and enter a cinematic room of original game captures and archival films.

## Run locally

```sh
cd spatial-edition
npm install
npm run dev
```

If your terminal is already inside this folder, omit the first command.

Open `http://localhost:5174`. The development server uses strict port 5174.

## Build and deploy

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static host at the domain root. Assets use root-relative paths. Game links use URL hashes, so the app does not require server route rewrites or a backend.

Run `npm test` for Playwright regressions (Chromium defaults to `/usr/bin/chromium`; set `CHROMIUM_PATH` for another installed executable). Browser workflow checks and screenshots are in `scripts/verify.mjs` and `scripts/final-captures.mjs`. `scripts/film-review.mjs` captures the film layouts; `scripts/film-playback.mjs` decodes and seeks every locally served film in Chromium. Font license files accompany the local fonts in `public/fonts/`.

## Controls

- Collection: drag horizontally, scroll over the scene, press left/right arrows, use navigation buttons or choose a disc thumbnail.
- Inspection: click the centered disc or “Inspect the disc.” Move the pointer to catch the light; click the disc, use the flip button or press **F** to turn it over. **Escape** returns to the collection.
- Memory room: select “Enter its world.” The local archival film plays first, muted. Use the custom play, seek, sound and fullscreen controls. Switch to Captures for three original-resolution images, arrow and frame navigation, or optional autoplay. **Escape** closes the room; browser Back closes it before leaving inspection. After a film or the last capture, the next disc is offered.
- The header provides collection index, about/credits and optional sound. The scene's lighting switch toggles studio/after-hours.

Reduced-motion preferences are respected. Local disc images provide a fallback if WebGL is unavailable.

## Artwork and design

Disc textures, thirty-three game captures, eleven archival films, their posters and both fonts are hosted locally. Film files total about 48 MiB, but only the selected game’s film is mounted and loaded. Sources and preparation notes are recorded in [disc provenance](docs/assets.md), [capture provenance](docs/media-assets.md) and [film provenance](docs/film-sources.md). This independent fan exhibition provides no games or game downloads; artwork and trademarks belong to their respective owners. Public deployment of the archival footage requires permission from the relevant rights holders.

## Cloudflare Pages

Create a Pages project from this repository with these settings:

- Root directory: `spatial-edition`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: pinned to `22.16.0` in `.node-version`
- Environment variables: none required

The root directory matters because the repository root contains a separate edition. The collection uses hash-based navigation, so it needs no server-side routes or Functions. All individual assets are below Pages’ 25 MiB per-file limit.

Before making the exhibition public, obtain permission for the locally hosted game footage, captures and artwork from their respective rights holders. Source and provenance notes identify where the assets came from; they do not grant distribution rights.

See [DESIGN.md](DESIGN.md), [.impeccable/design.json](.impeccable/design.json) and the [surface brief](docs/surface.md) for the current implemented direction. This folder is the standalone spatial edition; the parent project's original edition is separate.
