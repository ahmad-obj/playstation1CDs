# Disc artwork provenance

The exhibition uses scans of authentic original PlayStation release discs, downloaded from [PlayStation DataCenter](https://psxdatacenter.com/) on 2026-09-24. The scans retain the original printing, marks, and physical imperfections. Game names, artwork, and trademarks belong to their respective owners; availability of these scans is not a license to redistribute them commercially. This is an independent preservation-inspired portfolio exhibition, not an official PlayStation product.

| Local texture | Physical release | Original scan | Source size | Crop (width × height + x + y) |
| --- | --- | --- | --- | --- |
| `public/discs/metal-gear-solid.webp` | Metal Gear Solid, Japanese NTSC-J, disc 1, SLPM-86114 | [JPEG](https://psxdatacenter.com/images/hires/J/M/SLPM-86114/SLPM-86114-D-ALL.jpg) | 650 × 650 | 642 × 646 + 6 + 2 |
| `public/discs/final-fantasy-vii.webp` | Final Fantasy VII, European PAL, disc 1, SCES-00900 | [JPEG](https://psxdatacenter.com/images/hires/P/F/SCES-00900/SCES-00900-D-ALL.jpg) | 1414 × 1417 | 1414 × 1417 + 0 + 0 |
| `public/discs/ridge-racer.webp` | R4: Ridge Racer Type 4, North American NTSC-U/C, SLUS-00797 | [JPEG](https://psxdatacenter.com/images/hires/U/R/SLUS-00797/SLUS-00797-D-ALL.jpg) | 1000 × 1011 | 953 × 966 + 15 + 19 |
| `public/discs/tekken-3.webp` | Tekken 3, North American NTSC-U/C, SLUS-00402 | [JPEG](https://psxdatacenter.com/images/hires/U/T/SLUS-00402/SLUS-00402-D-ALL.jpg) | 1028 × 1019 | 983 × 985 + 19 + 17 |
| `public/discs/wipeout.webp` | Wipeout, North American NTSC-U/C, SCUS-94301 | [JPEG](https://psxdatacenter.com/images/hires/U/W/SCUS-94301/SCUS-94301-D-ALL.jpg) | 709 × 707 | 692 × 698 + 8 + 5 |
| `public/discs/resident-evil-2.webp` | Resident Evil 2, North American NTSC-U/C, Leon disc 1, SLUS-00421 | [JPEG](https://psxdatacenter.com/images/hires/U/R/SLUS-00421/SLUS-00421-D-ALL.jpg) | 1457 × 1487 | 1413 × 1423 + 24 + 50 |

## Texture preparation

ImageMagick mechanically cropped each scan to the physical disc boundary, corrected minor scan aspect-ratio distortion by resizing to 1024 × 1024, stripped metadata, and encoded WebP at quality 90. Lower-resolution source scans were upscaled only to standardize GPU texture dimensions; they do not contain invented detail. No generative image editing was used. The center holes remain untouched in the textures so the scene geometry can supply actual holes. The square corner background is intended to fall outside circular disc geometry.

All six finished textures were visually inspected together. Total compressed texture transfer is approximately 1.02 MiB.
