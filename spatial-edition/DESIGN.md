---
name: PLAY / BACK — Spatial edition
description: Physical PlayStation discs in a quiet studio, opening into cinematic memories.
colors:
  studio: "#cdd3d1"
  ink: "#263130"
  muted: "#536360"
  after-hours: "#202c30"
  night-ink: "#e8ede5"
  cursor: "#e5ebcf"
  archive: "#e2e5dc"
  memory: "#111a1d"
  memory-ink: "#f0f2e9"
typography:
  title:
    fontFamily: "DM, Arial, sans-serif"
    fontSize: "clamp(28px, 3.2vw, 50px)"
    fontWeight: 450
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "DM, Arial, sans-serif"
    fontSize: "12px"
    lineHeight: 1.85
  label:
    fontFamily: "DM, Arial, sans-serif"
    fontSize: "8px"
    letterSpacing: "0.08em"
  memory-display:
    fontFamily: "Barlow, sans-serif"
    fontSize: "clamp(50px, 7.4vw, 120px)"
    fontWeight: 800
    lineHeight: 0.83
    letterSpacing: "-0.02em"
rounded:
  circle: "50%"
  pill: "30px"
  aperture: "48% 47% 44% 42% / 17% 21% 19% 15%"
spacing:
  control-gap: "10px"
  action-gap: "24px"
  page-gutter: "3.5%"
  compact-gutter: "5%"
components:
  browse-button:
    rounded: "{rounded.circle}"
    width: "45px"
    height: "45px"
    textColor: "{colors.ink}"
  flip-button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.studio}"
    rounded: "{rounded.pill}"
    padding: "12px 17px"
  world-preview:
    rounded: "{rounded.aperture}"
    width: "100%"
    height: "130px"
  archive-panel:
    backgroundColor: "{colors.archive}"
    textColor: "{colors.ink}"
    width: "650px"
    padding: "32px 45px 40px"
---

# Design System: PLAY / BACK — Spatial edition

## Overview

**Creative North Star: "A world you could hold."**

The exhibition begins with physical discs in a cool, softly lit studio. Authentic printed surfaces, perspective, dark polycarbonate reverses and delicate contour graphics carry the identity. Text supports recognition and interaction; the memory room opens the object into original gameplay and cinematic imagery.

**Key Characteristics:**

- Authentic disc artwork and original PlayStation captures.
- Cool studio atmosphere with an after-hours alternate.
- Spatial continuity, soft light and restrained exhibition labels.
- Fluid photographic apertures for memory sequences.

## Colors

Studio gray, graphite and muted green-gray provide a quiet neutral field. The pale cursor accent appears on interaction; the archive uses a slightly lighter mineral surface. After-hours changes the main scene to dark blue-gray with pale ink. The memory room has its own near-black background and warm white text. Color from the selected artwork softly enters the surrounding light.

## Typography

Self-hosted DM Sans (`DM`) carries the interface, titles and short descriptions. Self-hosted Barlow Condensed (`Barlow`) supplies emphatic memory-room phrases. Collection titles stay subordinate to the discs. Small tracked labels identify catalog metadata; they are not a model for paragraph text. The memory display is an intentionally separate cinematic treatment.

## Layout

The main collection is a viewport composition: narrow header, large central scene, lower artifact caption and centered six-disc dock. Desktop gutters are percentage-based. Inspection moves the disc left and places its description and image preview on the right. At (900px) and below, inspection becomes a scrollable vertical composition with the disc above the text. The collection adopts its narrowest layout at (540px), retaining explicit previous/next controls and a compact dock. Auxiliary archive panels enter from the right; the memory room occupies the whole viewport.

## Elevation & Depth

Depth belongs to the objects: perspective, annular geometry, a visible thin edge, metallic hub, printed front and reflective black reverse. Diffuse elliptical shadows and three ground rings establish a shared plane. Pointer motion shifts the disc and light; partial contours and radial ticks intensify on hover. Interface controls use fine borders and tonal inversion rather than card shadows. Memory depth combines image parallax, a moving aperture edge, a fine offset outline and atmospheric blur.

## Shapes

Circles belong to discs, navigation and cursors; the flip control is a capsule. The memory preview has an asymmetric rounded silhouette, expanded into an animated SVG aperture in the viewer. Keep the artwork's center hole and circular boundary physically legible. Fine rules and small dots structure the surrounding metadata.

## Components

- **Disc scene:** cyclic object strip with drag, wheel and keyboard browsing; selection rearranges the existing scene into inspection. A local-image fallback preserves access when WebGL fails.
- **Browse and inspect controls:** outlined circular arrows, an underlined inspect action and a circular play icon. Hover changes tone or moves the icon; keyboard focus uses a visible outline.
- **Disc dock:** six masked artwork thumbnails with numbering and a selection dot. Hover lifts and rotates the thumbnail.
- **Inspection:** concise metadata, reversible disc, capsule flip action and a photographic entry into the memory room.
- **Archive:** native dialog with image-led rows and fine separators; the collection remains mounted behind it.
- **Memory viewer:** native dialog opens on a locally hosted archival trailer, commercial or opening cinematic before captures. The projection has a sculpted outer contour and a quiet custom transport outside the picture; playback starts muted, supports seeking, sound and fullscreen, and has a local poster and retry state. A Film / Captures switch reveals three locally hosted original-resolution captures per game in a fluid frame, with caption, manual navigation and optional five-second autoplay. At a film ending or the final capture, an image-led next-memory prompt returns the visitor to the next physical disc. Switching to captures or closing the room removes the video element.

Motion follows `--ease`; the scene settles when idle and suspends behind modal surfaces. Reduced-motion preferences remove decorative animation and pointer parallax. Sound is optional and initially off.

## Do's and Don'ts

- Do let authentic artwork, lighting and physical geometry lead the first viewport.
- Do keep supporting copy short and preserve explicit keyboard controls.
- Do carry the same selected object through collection, inspection and memory.
- Don't restore the superseded oversized collection wordmark composition.
- Don't replace original captures or scans with invented game artwork.
- Don't treat the memory-room display lettering as the default collection hierarchy.
