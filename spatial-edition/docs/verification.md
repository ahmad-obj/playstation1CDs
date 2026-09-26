# Verification — spatial edition

Final verification was performed in Chromium on 26 September 2026. The spatial edition remains isolated in this folder; the parent edition was not modified.

## Production build

`npm run build` passes TypeScript and Vite production compilation. Three.js and the memory viewer are separate lazy chunks. Disc artwork, captures, fonts, film posters and all six H.264/AAC films are self-hosted. Only the active film is mounted; no YouTube, thumbnail or streaming request is made by the experience.

## Browser regressions

The committed Playwright suite contains twelve scenarios. It covers cyclic collection navigation, inspection and reversal, memory-room focus and keyboard isolation, index selection, delayed scene loading, reduced motion, the WebGL fallback, browser Back behavior, the 844 × 390 collection composition, local film autoplay/pause/seek, retry after media failure, switching to captures, and the image-led next-memory handoff.

The focused film suite passed all four scenarios after the native seek test was changed to interact with the range track as a visitor would. The history and short-landscape regressions both pass. The final complete suite is rerun after all source edits and its result is recorded below.

## Local film integrity

`scripts/film-playback.mjs` opened each game in Chromium and verified that its local video advanced, reported a real duration, reached `readyState: 4`, and decoded after seeking near the midpoint. All six completed with no video error, no application runtime error and no YouTube, ytimg or googlevideo request.

Every MP4 was also decoded end to end with ffmpeg using an error-only pass; all six exited cleanly. The footage totals approximately 34 MB. Encoding and provenance are recorded in [film-sources.md](film-sources.md).

## Visual review

Desktop 1440 × 900, mobile 390 × 844 and 320 × 740, tablet 768 × 1024, and short landscape 844 × 390 were captured during interaction. The review covered collection, hover/focus dock titles, inspection, reverse surface, local playback, custom controls, captures and both ending handoffs. The fresh short-landscape dialog remained at scroll position zero and the player fit inside the viewport. No horizontal overflow or page runtime error was found in the media-layout capture pass.

The independent design review began at a subjective 7.3/10 and identified five priorities. All five were implemented and rechecked: video-first local playback; isolated inspection; clearer rim/hub material response; sighted dock labels; and an image-led continuation. A separate browser critic found and verified fixes for short-landscape controls, browser Back, video-duration synchronization, muted-text contrast and functional label sizing. Reports and their limitations are in [critic-review.md](critic-review.md) and [browser-critique.md](browser-critique.md); evidence is under `.impeccable/review/`.

These checks use software-rendered Chromium in the test environment. They verify behavior and layouts, but are not a physical-phone GPU benchmark or a rights clearance for public distribution of the archival footage.
