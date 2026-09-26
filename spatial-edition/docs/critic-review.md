# Independent design critique — Spatial Edition

Assessment A: `/root/design_critic`, 25 September 2026. Independent design review; no detector results or Assessment B findings were consumed. Source target: `src/App.tsx`, with `MemoryViewer.tsx`, `DiscScene.tsx` and supporting styles. This records the **pre-local-video revision**, not the final state after fixes.

## Verdict

**7.3/10, subjective portfolio-experience score—not an Awwwards score or a promise of an award.** Strong, specific first impression and a credible physical-object concept. The gap to exceptional work is not more effects: it is consistency of material detail, recognition at small scale, and an emotional journey that keeps developing after the first disc. Composition 8/10; materiality 7/10; interaction 7.5/10; emotional range 6.5/10.

This is authored for discs, not a generic game-card website. It has not yet earned “nothing to improve” or “best in the world.” Those are not verifiable quality claims.

## What I actually inspected

Fresh Playwright/Chromium context, 1440 × 900 and 390 × 844. Used drag navigation, hover, direct dock selection, inspection, reversal, memory-room entry, Film mode, Escape, collection and About panels, mobile inspection and mobile media view. Screenshots are in `.impeccable/review/critic-a/`; scripts are `scripts/critic-a.mjs` and `scripts/critic-benchmarks.mjs`.

Some screenshots caught entry animation rather than settled composition (`room.png`, `index.png`); these are motion evidence, not proof that their settled screens are empty. Rendering used software Chromium, not a physical-device performance benchmark. The review is visual/interaction criticism, not a full accessibility certification.

## Benchmark calibration

- [A24 by Ravi Klaassens](https://a24.raviklaassens.com/) was opened, hovered/scrolled and captured in the live browser. Its discs show more layered edge/hub response and more confident off-axis overlap. The useful lesson is controlled material contrast and composition; not copying the disc layout, which the brief explicitly rejects. No Awwwards distinction for this particular project is claimed.
- [Lusion v3 on Awwwards](https://www.awwwards.com/sites/lusion-v3) verifies its October 2, 2023 Site of the Day and documents reactive cursor and scroll-animation highlights. Awwwards also lists it as [2023 Site of the Year](https://www.awwwards.com/websites/%23F0EBE7/?page=14). Its relevant benchmark is interaction carrying identity rather than decoration. The initial live-browser capture remained on the loader, so a full current-site interaction comparison is not claimed from that capture.
- [Unseen Studio's Awwwards profile](https://www.awwwards.com/unseenstudio/?library=true&previewmode=true) verifies its February 2023 Site of the Month. [Its live site](https://unseen.co/) was opened, entered without audio, pointer-tested and scrolled. Settled screenshots (`benchmark-unseen-entered*.png`) show an authored architectural space, water reflections, soft shadows and quiet navigation. The transferable lesson is that depth comes from a coherent world and light relationships—not simply more layers or motion. This is a homepage interaction sample, not a complete current-site audit.

These are a deliberately small, verifiable benchmark set. No critic has inspected “all Awwwards websites,” and past award status does not guarantee a current version's performance or accessibility.

## Preserve these strengths

1. **Artifact-first composition.** Authentic artwork occupies most of the viewport. The supporting UI is not competing with it; mobile is a deliberate single-object stage.
2. **The reversible black disc.** This is emotionally specific to PlayStation and produces a meaningful reveal without unrelated effects. Keep the restrained studio palette and real scan imperfections.
3. **Multiple natural inputs.** Drag, explicit arrows, keyboard, index and dock allow exploration without an onboarding lecture. The archive panel retains spatial context rather than replacing the scene.

## Priority findings and proposed fixes

### P1 — The most cinematic content is behind too many gates

Evidence: `film.png`; `MemoryViewer.tsx` initially defaults to Captures, with Film second; `ArchiveFilm` adds a separate Load film gate. “Enter its world” delivers a still frame first, then asks twice before motion. That is the largest mismatch with the requested media-first spectacle.

**Fix:** Local native video as the default room, video first in both visual and DOM order. Attempt muted inline playback, expose clear unmute/pause/seek/fullscreen controls, preserve aspect ratio, show an honest blocked/loading/error state. Do not claim guaranteed audible autoplay. Captures should be the quieter second act, not removed. Parent is already implementing this.

### P2 — Inspection does not fully isolate its subject

Evidence: `detail.png` and `reverse.png`: a narrow neighboring disc slice remains at the extreme right edge of the otherwise composed desktop close-up. It reads as an accidental crop, not a useful navigational cue. `DiscScene.tsx` pushes nonselected discs sideways but still uses a broad frustum visibility threshold.

**Fix:** Retract or fade nonselected discs, shadows and contour groups as inspection settles. Preserve the movement into inspection but finish on one intentional artifact. Acceptance: no stray edge at 1440 × 900 or intermediate desktop widths.

### P2 — Front-surface materiality is less convincing than the reverse

Evidence: `desktop.png`, `hover.png`, `detail.png` versus `reverse.png`. Printed faces read mostly as matte image planes. Hubs have little tonal separation and the very thin edge only occasionally catches light. The A24 benchmark's stronger layered rim/hub distinction is visibly helpful, even though its artistic treatment need not be copied.

**Fix:** A small increase in metallic hub/rim separation and one broad moving grazing reflection; keep the printed front diffuse enough to retain legibility. Avoid making the whole label glossy or adding more rainbow. This is a material adjustment, not a new post-processing stack.

### P2 — Miniature artwork alone is weak recognition for the dock

Evidence: `desktop.png`, `mobile.png`; `.disc-dock` renders six 31–33px scans with index numbers. ARIA names exist, but sighted visitors cannot reliably identify all six artworks. The game title updates after selection, so finding a known title becomes trial and error.

**Fix:** A restrained title reveal on pointer hover **and keyboard focus**; provide a stable active title on touch or use the existing caption as explicit selection feedback. Keep all six discs—six items are a coherent finite collection, not justification for a filter panel. No extra menu needed.

### P2 — The ending is a loop, not a designed continuation

Evidence: the media room can close or repeat frames; the same treatment recurs for every game. After the first reveal, novelty decays. There is no contextual cue from a completed film or final capture to the next artifact.

**Addition:** One image-led “Next memory” handoff using the next physical disc's thumbnail/title, shown at the end of film and at the last capture. Keep Replay and Return available. This connects cinematic content back to the central object language and gives the exhibition a deliberate rhythm. Do not auto-advance to another game without consent.

## Lower-priority observations

- Several peripheral labels are 5.5–8px; fine as nonessential engraving-like atmosphere, weak for functional labels such as lighting. Enlarge functional labels first, not every annotation.
- The mobile detail intentionally requires scrolling to reach media. A subtle image-led preview/continuation cue could reduce the impression that the detail ends at its metadata, but should not shrink the disc to cram everything above the fold.
- The About layout is clean but more conventional than the stage. That is acceptable as a quiet interlude. Do not add an unnecessary second 3D scene.
- A capture room's giant two-line words can sometimes compete with the imagery. The local film-first room should let motion be the principal spectacle and reserve those words for secondary captures.

## Nielsen usability scores

Scores 0–4. These measure usability, not artistry; 4 means exceptional. Error handling here is source-inspected rather than an exhaustive failure-injection test.

| Heuristic | Score | Evidence / limitation |
|---|---:|---|
| Status visibility | 3 | Active number, dock dot, modes; film's extra gate delays the promised result. |
| Match to real world | 4 | Physical artifact, black reverse and concise familiar labels. |
| Control and freedom | 3 | Explicit back/Escape and modal controls; native-video behavior pending. |
| Consistency | 3 | Coherent studio and panel language; capture and film presentation differ abruptly. |
| Error prevention | 3 | Safe exploration, drag threshold, separate modal input; no destructive workflow. |
| Recognition over recall | 2 | Dock names are hidden to sighted users; multiple tiny functional labels. |
| Flexibility and efficiency | 3 | Drag, wheel, arrows, keyboard, direct index selection. |
| Aesthetic/minimalist design | 3 | Strong focus; accidental neighbor sliver and repeated media formula. |
| Error recovery | 3 | Source provides retry/fallback; not a full injected-network audit. |
| Help/documentation | n/a | Experience surface; task-focused on-screen controls are the relevant help. |
| **Total** | **27/36** | **75%, good usability—not an artistic excellence guarantee.** |

## Cognitive load and emotional journey

Low-to-moderate extraneous load: one central object, two main actions, grouped scene controls. The six-disc dock exceeds four visible options but is one meaningful collection; filtering would worsen it. The failed recognition cue and three-stage film path are more important than its raw item count. The journey is strong arrival → rewarding flip → quieter image room → repetition. Video-first and an artifact-led continuation should turn that into arrival → tactile discovery → cinematic peak → intentional next memory.

Persona risks: first-time visitor cannot name tiny dock images; a mobile visitor can miss media below detail metadata; a portfolio reviewer will notice repeated camera/media choreography even when every button works. Keyboard users have useful routes already—do not remove them to pursue visual novelty.

Questions skipped: the user explicitly requested autonomous fixes after criticism; priorities are already pinned to CDs, media-first playback and coherent non-text spectacle. This Assessment A is sent to the parent for synthesis with the isolated technical assessment and one bounded recheck.
