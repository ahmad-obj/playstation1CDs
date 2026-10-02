# Verification — spatial edition

Release review performed 2 October 2026 against the current `feat/expanded-collection` candidate.

## Build and Cloudflare Pages shape

`npm run build` passed TypeScript and Vite production compilation. The production output is `dist/`; Three.js and the memory viewer are separate lazy chunks. Cloudflare Pages settings are recorded in [README.md](../README.md): project root `spatial-edition`, build command `npm run build`, output directory `dist`, and Node.js `22.16.0` pinned in `.node-version`. No build-time environment variables are required.

The built output contains 78 files and is approximately 51.9 MiB. The largest file is `tekken-3.mp4` at 12,353,599 bytes, below Pages’ 25 MiB per-file limit. The full set is below Pages’ 20,000-file Free-plan limit. See [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/).

## Browser regressions

`npm test` passed **19/19 scenarios in 5.6 minutes** in Chromium. Coverage includes all eleven collection items, their detail and capture routes, keyboard and pointer interaction, inspection and reversal, delayed scene loading, the accessible loading screen, reduced motion, WebGL fallback, browser Back, short-landscape controls, local film controls, retry after a media failure, and the next-memory handoff.

## Production-preview smoke

The Vite production preview served the built `dist` output in Chromium. The loading screen cleared when the scene became ready; the 11-item collection and a direct `#game/tony-hawk-2` link rendered. The Metal Gear Solid film played, reported `readyState: 4` and a real duration, then the visitor switched to captures and closed the memory room. No browser runtime or console errors, unexpected failed requests, or third-party video requests were recorded.

All eleven local MP4s were then opened from the production preview, played, and sought. Each reached `readyState: 4` without a media error. There were no YouTube, `ytimg`, or `googlevideo` requests.

## Release conditions and evidence limits

- The workspace has no Git remote configured, so no remote `main` push, Cloudflare build, deployed commit check, production-URL smoke, or Cloudflare rollback check was possible.
- Project notes say permission for public distribution of the locally hosted game films is required. The workspace contains no permission evidence. The five added disc textures and fifteen added captures also lack exact source-file entries in the provenance tables. Public release is conditional on resolving those asset rights and provenance gaps.
- Browser verification used software-rendered Chromium. It is not a physical-phone GPU or real-device performance check.

The locally tested build is a candidate for static Cloudflare Pages hosting, with public release conditional on the items above.
