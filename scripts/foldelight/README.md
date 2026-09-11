# foldelight render checks

The static experience lives in `public/foldelight/`. Astro copies these modules and assets without bundling them.

## Local verification

1. Run `bun test ./scripts/foldelight` from the website root.
2. Run `bun run build`.
3. Start the Astro preview with `bun run preview`.
4. Open `/foldelight/` on the reported local port.
5. Inspect the closed lid, intermediate poses, and the fully open lid.
6. Repeat with `/foldelight/?renderer=webgl`.

Paste `browser-check.mjs` into the browser console to compare both backends on the same device. The check needs WebGPU and WebGL 2. It creates temporary canvases, reads actual rendered pixels, and removes its resources. The error threshold is an average of 0.5 per RGB channel on the 0–255 scale.

The CPU suite checks the hinge, closed-screen clearance, mesh normals, viewport bounds, and scroll reversal. It also checks the studio camera against landmarks from the supplied reference, camera continuity across 12,006 poses, the front recess, and floor placement. Eleven targeted mutations must fail their behavioral contracts.

## Studio reference

The supplied image shows a nearly frontal space-black laptop in a dark studio. The camera fit uses a 6.24° elevation and a 12.63° vertical field of view. The corresponding lid opening is approximately 32.88°, at scroll progress 0.38374. These values come from fitting the pictured silhouette; they are not measured camera metadata.

The camera retreats as the lid rises and keeps the bottom edge anchored. A smooth transition between width and height constraints prevents an abrupt change in camera speed. The chassis has rounded metal edges, a sculpted front recess, a wider trackpad, subdued keys, filtered speaker perforations, and a soft contact shadow.

The blue lock-screen asset and the `displayColor` and `diffuseGlass` functions remain unchanged. The lid still opens from 0° to 100°. No new runtime dependency or remote asset is required.

## Verification record — 2026-09-11

- The 24 tests passed, including all 11 mutation checks.
- The Astro production build passed.
- The in-app browser rendered the scene with WebGPU and forced WebGL 2 without shader errors.
- Actual pixel comparisons covered 0°, 32.88°, 60°, and 100° at a 640 × 304 buffer.
- The preview was inspected at the reference aspect ratio and at the normal narrow browser size.
- The lock-screen asset matched its previous Git object. Both glass functions matched their previous source.

The reference fit allows small differences in silhouette. This is a procedural reconstruction from one image, not the original product model. Safari, Firefox, and physical mobile devices were not tested in this pass. Pixel agreement between backends does not measure animation latency.
