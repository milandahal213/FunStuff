# Fractal Atlas

An interactive explorer for 21 classic fractals that runs entirely in the browser. It's one HTML file with no build step and no dependencies beyond Google Fonts.

**Live site:** https://milandahal213.github.io/FunStuff/fractal-atlas/

## What's inside

| Family | Fractals |
| --- | --- |
| Escape-time (GPU) | Mandelbrot set, Julia set, Burning Ship, Tricorn, Multibrot, Newton fractal |
| Iterated function systems | Barnsley fern (three species), chaos game |
| L-systems | Koch snowflake, dragon curve, Hilbert curve, Sierpinski arrowhead, Gosper curve, Lévy C curve, fractal plant, plus a lab for your own rules |
| Recursive geometry | Fractal tree, Pythagoras tree, Sierpinski carpet, Vicsek fractal, Cantor dust |

Each fractal comes with its origin, fractal dimension, rule, a short explanation and something to try.

## Mandelbrot deep zoom

- **Click to glide.** Click any point and the view zooms toward it continuously until you click again. Glide speed can be adjusted.
- **About 10³⁰× magnification.** The page uses perturbation theory: one reference orbit is computed exactly with `BigInt` fixed-point math (192 fractional bits), and the GPU iterates only each pixel's tiny offset from it in single precision. When an offset grows too large, it is rebased onto the start of the orbit (Zhuoran's method).
- **Smooth on any hardware.** While gliding, keyframes 1.25× apart are rendered off screen, one or two ahead, and the last finished keyframe is magnified with a CSS transform. The glide speed adapts to how long keyframes take, so a slow computer glides more slowly instead of stuttering.
- Automatic iteration count, copy and paste of exact locations, and a hover preview of the Julia set for any point.

## Performance and limits

- The graphics chip does most of the work. Apple Silicon Macs and computers with a dedicated graphics card draw most deep views in under a second. Older laptops, Chromebooks and phones can take several seconds per frame.
- Deep zoom needs **WebGL2**, which current versions of Chrome, Edge, Safari and Firefox all support. Without it the Mandelbrot set stops at about 100,000×.
- Deep zoom ends at about 10³⁰×, where single-precision offsets run out of exponent range. The other escape-time fractals stop at about 100,000×.
- Views full of dark interior are the slowest, because every interior pixel runs every iteration.
- Battery saver and low-power modes slow the graphics chip down.

The site also shows these notes, along with the graphics chip it detected, under **Performance & limits**.

## Run locally

Open `index.html` in a browser. No server is needed.
