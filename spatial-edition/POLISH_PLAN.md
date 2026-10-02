# Spatial Edition — autonomous visual polish pass

## Baseline diagnosis

Fresh Chromium captures were reviewed at desktop, after-hours, detail, reverse-disc, about, film, captures, 320/390/600/768px, and short-landscape sizes. The core experience is coherent and production-ready. Two P2 weaknesses remained:

1. The collection ground treatment reads as a beautiful static surface. Disc lighting responds to the pointer, but the surrounding atmosphere does not give the pointer a physical footprint.
2. In short landscape film viewports, the projection player is deliberately over-constrained by large side gutters and feels smaller than the surrounding memory-room composition.

## Chosen improvements

1. Add a restrained pointer-following aperture to the gallery ground. It will be driven by the existing pointer coordinates, remain behind the controls, fade out on pointer leave, and be disabled for reduced motion/touch contexts.
2. Recompose the film room specifically for short landscape screens: reduce vertical chrome, widen the stage, and let the player use the available width while retaining the 16:10 archival frame and bottom caption hierarchy.

## Verification

- Build with TypeScript and Vite.
- Run the full Playwright suite, then isolate any media-load flakes.
- Capture equivalent desktop, night, detail, film, and short-landscape screenshots.
- Recheck reduced-motion behavior, pointer interaction, no-overflow layouts, keyboard navigation, and fallback mode.

## Non-goals

No new dependencies, no replacement of the disc scene, no broad visual redesign, and no copy/content expansion.
