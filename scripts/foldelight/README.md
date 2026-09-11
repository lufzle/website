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

## Screen light and outer-lid mark

The supplied 6.2-second video shows screen light spreading across the keyboard and a soft reflection across the trackpad and palm rests. The renderer now models both components. Their color comes from the existing blue lock screen, including its glass warp, vignette, rounded boundary, notch, and fade.

Four colored rectangles approximate the display's varying radiance. Each rectangle uses an integrated projected solid angle, clipped at the receiving surface's horizon. This avoids the uneven illumination that sparse point samples produce near the hinge. A separate reflected ray finds the screen image in lid coordinates. Its filtered footprint grows with surface roughness and distance. Material lighting is added in linear color space.

The area-light integration follows the method in the authors' [polygon-light reference implementation](https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_quad.fs). The reflected image has no extra inverse-square falloff, consistent with [radiance along an unobstructed ray](https://pbr-book.org/4ed/Radiometry,_Spectra,_and_Color/Radiometry). The rough reflection is an approximation, not a full microfacet integration. Individual keys do not cast light shadows onto neighboring keys. The floor retains its studio light because screen illumination there would require chassis occlusion.

The Apple silhouette comes from the navigation SVG on [Apple's MacBook Pro page](https://www.apple.com/macbook-pro/). It is a dark, reflective mask on the existing outer-lid material. It follows the rigid lid transform without another mesh, texture, or draw call. The mask occupies the atlas's green channel. Keys read red, so the logo cannot change their filtered legends. `materials.mjs` holds the path and atlas bounds. `scene.mjs` shares the emitting screen dimensions with both shaders.

### Additional verification — 2026-09-11

1. Run `lighting-check.mjs` in the browser console at `/foldelight/`.
2. Run `performance-check.mjs` with the browser tab visible.
3. Inspect the opening and closing motion with both GPU backends.

The lighting check uses the actual renderers and shader functions. It compares red, green, blue, and black screens at ten lid angles. It checks keyboard, palm-rest, trackpad, and floor pixels separately. It also compares the rectangle shader with independent numerical surface integration, checks 26,112 irradiance cases, and requires four altered shaders to fail. Those mutations reverse polygon winding, remove horizon clipping, detach a corner from the hinge, and restore an abrupt reflection cutoff.

All checks passed at a 1920 × 912 buffer. The sampled material pixels agreed between WebGPU and WebGL. Screen light was absent at full fade and on the floor beneath the chassis. All 699,051 key-channel mip bytes matched with and without the logo. The logo changed 2,123 pixels on the closed outer lid. The trackpad changed by at most 4/255 per quarter-degree step through the fade. A separate hinge-bevel sweep around 99.3° changed by at most 2/255 per 0.0005° step. The reflected border and notch share the blur footprint, and the reflection loses energy when that footprint extends beyond the panel.

A 90-sample WebGPU measurement, after ten warmup frames, took 1.8 ms median and 3.1 ms p95 from submission through GPU queue completion. These timings include CPU and fence overhead. They do not measure display refresh rate or input-to-photon latency. Other devices and browsers can differ.

The existing 24 CPU tests and Astro build passed. The lock-screen asset remains Git object `240ebe4d29abb5b5748d1ed071fbb2876929be63`. Both `displayColor` and `diffuseGlass` implementations matched the previous commit byte for byte. Safari, Firefox, and physical mobile devices were not tested.
