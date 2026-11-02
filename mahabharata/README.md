# Picturing the Mahabharata

Three linked views that help readers grasp the Mahabharata's geography and timescale: five or six generations, journeys across the whole subcontinent, and a climax squeezed into eighteen days.

**Live site:** https://milandahal213.github.io/FunStuff/mahabharata/

| Page | What it shows |
| --- | --- |
| `index.html` | Overview and links to the three views |
| `map.html` | The living map: ten chapters, each flying to its region and drawing its journeys with straight-line distances |
| `lifelines.html` | One lane per character from birth to death, with events across all lanes; zooms from six generations to the exile years, the 18 days (split by Kaurava commander) and real-world dating |
| `story.html` | Scrollytelling: the retelling beside a small map, a family tree that greys out the fallen, and battlefield sketches for the war |

## Files

```
mahabharata/
  index.html, map.html, lifelines.html, story.html
  css/style.css    shared tokens (light and dark), fonts and layout
  js/data.js       places, chapters, war steps, characters, events, history: the single source of truth
  js/geo.js        projection, coastline, rivers, mountains, camera, markers, journey legs
  js/common.js     embed mode, reduced motion, story-time wording, deep links
  js/map.js, js/lifelines.js, js/story.js
```

Plain classic scripts, no build step and no dependencies beyond Google Fonts (Yatra One and Hind), so every page also opens straight from disk.

## Time

All times are story-relative years, with **year 0 the game of dice**; war days run 1–18. The epic gives few dates and traditions disagree, so ages and spans are approximate reconstructions, and the pages say so.

## Deep links and embedding

- `map.html#chapter-5`, `story.html#chapter-9`, `lifelines.html#war` (also `#generations`, `#exile`, `#history`, or a character id such as `#karna`).
- Each view fills its container and scrolls internally, so it works inside an `<iframe>`. Inside a frame, or with `?embed` in the URL, the site navigation is hidden.

## Caveats kept on the pages

- Several sites are traditional identifications. Ekachakra is disputed (Chakarnagar near Etawah is shown; Ekchakra in Birbhum is the other main candidate), and Kamyaka's location is traditional.
- The Pandavas' final journey circles east, south and west before turning north; the map simplifies it.
- Versions of the epic differ. All story text is original retelling, not quoted from any translation.
