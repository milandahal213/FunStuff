# Through the Looking Glass

Browser-based AR/VR experiments. No install, no backend — just static pages served over HTTPS (GitHub Pages works). Every mode needs camera or motion permission and will ask when you start it.

[Live](https://milandahal213.github.io/FunStuff/ar/)

## Modes

| Page | What it does | Android (Chrome) | iPhone | Laptop + webcam |
| --- | --- | --- | --- | --- |
| `place.html` | Place a 3D model on the floor at real scale | WebXR / Scene Viewer | AR Quick Look (`.usdz`) | 3D preview only (no world AR) |
| `draw.html` | Tap surfaces to place coloured shapes | World-anchored (WebXR hit-test) | Camera-window fallback | Camera-window fallback |
| `vr.html` | Stereo scene you steer by head/phone | Native WebXR VR, else stereo | Stereo + device-orientation | Stereo, drag to look |
| `stereo.html` | Shoot a left/right pair → 3D photo | ✅ | ✅ | ✅ (webcam) |

## Notes & limits

- **iPhone has no WebXR.** Every iOS browser (incl. Chrome/Firefox) runs on Safari/WebKit, so `draw.html` uses the camera-window fallback and `place.html` uses Apple's AR Quick Look. That's why importing a `.usdz` matters for iPhone AR.
- **"Camera window"** is not world-tracked: shapes float in a 3D space you look *around* (rotation), but walking doesn't move you (no SLAM). True markerless world AR in-browser on iPhone needs a paid SDK (e.g. 8th Wall).
- **3D photo booth** uses the "cha-cha" method — one camera, two shots a few cm apart. Best on still subjects ≥ ~1 m away. Outputs: red/cyan anaglyph PNG, side-by-side PNG (for `vr.html` / any Cardboard viewer), and a wiggle GIF.

## Tech

- [`<model-viewer>`](https://modelviewer.dev/) 3.5.0 for `place.html`.
- [three.js](https://threejs.org/) 0.160.0 (WebXR + `StereoCamera`) for `draw.html` and `vr.html`.
- [gif.js](https://github.com/jnordberg/gif.js) 0.2.0 for the wiggle GIF (worker loaded as a same-origin blob to avoid CORS).

## Possible next steps

- Bundle a few more sample models (with `.usdz` companions) in `place.html`.
- Marker / image-tracking mode (AR.js or MindAR) for a world-locked experience that also works on iPhone and laptops.
- Auto-align the right frame in the photo booth (feature matching) instead of the manual ghost overlay.
