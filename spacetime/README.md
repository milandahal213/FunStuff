# Beyond the Rubber Sheet

Six interactive 3D views of curved spacetime, each computed from general relativity rather than the usual bowling ball on a rubber sheet. It's one HTML file that loads [Three.js](https://threejs.org/) from a CDN, with no build step.

**Live site:** https://milandahal213.github.io/FunStuff/spacetime/

## Scenes

| Scene | What it shows | Physics |
| --- | --- | --- |
| Black hole lensing | Ray-traced light paths around a black hole with a glowing disk, Doppler beaming and the photon ring | Exact (Schwarzschild null geodesics, traced per pixel on the GPU) |
| Warped grid and clocks | A 3D lattice spaced by true measured distance, plus clocks that tick at the predicted rate, from Earth up to a black hole | Exact (Schwarzschild spatial metric and time dilation) |
| Orbit playground | Launch matter and light by dragging; precessing orbits, zoom-whirls, light capture, with Newton's prediction for comparison | Exact (Schwarzschild geodesics) |
| Light cones | Cones tipping toward the hole and pointing inward inside the horizon, with a falling observer and their light signals | Exact (Eddington–Finkelstein and Schwarzschild coordinates) |
| Tidal stretching | A cloud of free particles stretched along the fall and squeezed across it | Exact (each particle on its own radial geodesic) |
| Gravitational waves | A binary spirals in and merges; strain map and rings of test particles show the + and × polarizations | Quadrupole approximation, with a sketched merger and ringdown |

Each scene's panel says what it shows and what it leaves out.

## Units

G = c = 1 and the Schwarzschild radius r_s = 1, so distances are in Schwarzschild radii and times in r_s/c.

## Run locally

ES modules need a web server, so serve the folder, for example:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/spacetime/.
