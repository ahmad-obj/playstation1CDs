# Independent browser assessment B

Assessment performed against the spatial edition, separate from the visual critic. No application source changes were made by this reviewer. Evidence was captured in a fresh Chromium context with software WebGL; these measurements are not a physical-device GPU benchmark.

## Verified findings before fixes

| Priority | Finding | Reproduction and evidence | Required correction |
| --- | --- | --- | --- |
| P1 | Short landscape collection loses its visible controls | At 844 × 390, the collection is 700px tall. Inspect and Enter its world sit at y570, and the dock starts at y625. The viewport ends at390. `critic-b/collection-844.png` and `evidence.json`. | A deliberate short-height composition with an appropriately framed disc and controls in the viewport, or an unmistakable scroll affordance. |
| P2 | Short landscape captures become an image slit | At 844 × 390, the photographic aperture is approximately120px tall, while display text overlaps it. `critic-b/memory-844.png`. | A landscape media layout using most available height and subdued supporting text. |
| P2 | Browser Back leaves the memory room over a different route | Open MGS inspection, enter its world, then browser Back. URL returns from `#game/metal-gear-solid` to `/`, and inspection closes underneath, but `.memory-viewer` remains mounted. `critic-b/back-memory.png` and `evidence.json`. | Synchronize modal state with route/history, so Back closes the topmost experience before changing the underlying artifact. |

## Verified strengths

- Clicking the left neighboring disc selects Final Fantasy VII correctly.
- Touch scrolling was tested with CDP touch events, not a wheel surrogate: a vertical swipe beginning on the inspection canvas scrolled the page285px.
- The idle scene scheduled zero requestAnimationFrame callbacks during a1.1s sample. Behind About, one settling callback occurred and no continuous scene loop remained.
- Escape returns focus to Enter its world after closing the memory room.
- No application page errors were recorded in this workflow.
- Desktop1440px has no horizontal overflow.

## Method and limitations

The native ChromeDevTools `new_page` call was attempted and failed because `/opt/google/chrome/chrome` is not installed. Browser evidence therefore uses the installed `/usr/bin/chromium` through Playwright. Raw evidence and screenshots are in `.impeccable/review/critic-b/`; the reproducer is `scripts/critic-b.mjs`.

The requested replacement of remote embeds with local film-first playback was implemented separately; the old embed flow was not scored as an additional discovery. Detector results were withheld until the independent visual assessment was complete.

## Regression baseline

`npm test -- tests/critic.spec.ts` was run before fixes: both tests failed for the intended assertions (not infrastructure errors).

- History test: `.memory-viewer` expected count0 after Back, received1.
- Landscape test: Inspect the disc expected fully in viewport, received intersection ratio0.

These regressions remain in `tests/critic.spec.ts` for the implementation team to rerun after changes. The full original browser workflow evidence remains preserved independently of the generated Playwright test-results directory.

## Post-fix confirmation — 26 September 2026

`npm test -- tests/critic.spec.ts`: **2 passed (56.5s)** in real Chromium with software WebGL. Browser Back now closes the memory room while preserving the inspection and its URL. At844×390, Inspect, Enter its world, Previous, Next, and the current dock control are completely inside the viewport.

The final media check confirmed that the local MGS film starts without a third-party embed and can be paused. It then exposed a real race: the film time advanced but the UI duration remained0, disabling seek. The implementation now synchronizes duration on `durationchange`, `canplay`, `playing`, and `timeupdate`, instead of relying only on `loadedmetadata`. The parent independently verified this correction in its six-film run. This reviewer does not claim a separate completed six-film pass.

A subsequent three-viewport media-layout run hit the30-second software-WebGL readiness limit while another review was rendering. It was stopped rather than repeating competing browser work. The parent took ownership of final desktop/mobile/844×390 media screenshots and the landscape-capture visual confirmation. The original baseline and both passing regression assertions above are unaffected.

## Final detector and overlay

The CLI detector was run **once** on `App.tsx`, `MemoryViewer.tsx`, `ArchiveFilm.tsx`, and `DiscScene.tsx`. It returned four advisory `design-system-color` findings, all in `DiscScene.tsx`: line82 `#39333d` (disc edge), line86 `#ffffff` (clear surface sheen), line133 `#697255` (ground contours), and line144 `#7a845f` (halo). These are intentional physical-material/scene colors, not accidental interface drift. No blocking CLI finding.

Mutable browser injection was verified, and the overlay inspected collection, inspection, film, and captures. It reported25,31,38, and41 affected elements respectively; counts overlap across the mounted underlying page and modal and are not unique defect counts. Raw details: `.impeccable/review/critic-b/overlay-evidence.json`.

Actionable overlay results were passed to the parent and addressed:

- The studio muted text was4.2:1 on its background. It is now `#4c5c59` on `#cdd3d1`, above4.5:1.
- Inspect, Enter, Back, Flip, and autoplay labels were small functional text. Their refinements now use11px.

Other flags were reviewed in context: clipped gallery boundaries, low-opacity atmospheric artwork, disc identifiers above game titles, scanlines, tracked ornamental labels, and reactive optical lighting are deliberate parts of this experience. Small nonessential annotations remain a readability tradeoff, not an undisclosed perfect-accessibility claim.

The overlay ran in **headless Chromium only**. No user-visible `[Human]` browser tab was available, and none is claimed. Its temporary server on port8400 was stopped after evidence capture. WebGL fallback was used for overlay-only DOM scanning; the two post-fix regressions used actual WebGL.
