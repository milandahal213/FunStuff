/* Shared map drawing: projection, hand-drawn geography, the zoom camera, place markers and
   journey legs. Used by the map view and the story view. Coastlines and rivers are approximate. */
(function () {
  const MB = window.MB = window.MB || {};
  const NS = "http://www.w3.org/2000/svg";
  // Equirectangular with a cosine correction for the latitude of north India
  const K = 20, COS = 0.92, LON0 = 60, LAT0 = 37.5;
  const X = lon => +((lon - LON0) * K * COS).toFixed(2);
  const Y = lat => +((LAT0 - lat) * K).toFixed(2);
  const FULL = { x: 0, y: 0, w: (93 - LON0) * K * COS, h: (LAT0 - 5.5) * K };

  const coast = [[61.0, 25.2], [64.5, 25.2], [66.6, 25.4], [67.0, 24.8], [67.5, 23.9], [68.4, 23.5], [68.9, 22.6], [69.0, 22.25], [69.8, 21.5], [70.6, 20.8], [71.6, 21.1], [72.5, 21.7], [72.7, 21.0], [72.8, 20.1], [72.8, 19.0], [73.1, 17.6], [73.7, 15.9], [74.1, 14.8], [74.7, 13.2], [75.2, 12.0], [75.8, 11.1], [76.2, 9.9], [76.6, 8.9], [77.5, 8.1], [78.1, 8.7], [78.3, 9.2], [79.2, 9.3], [79.3, 10.3], [79.8, 10.4], [79.9, 11.8], [80.3, 13.1], [80.2, 14.6], [80.1, 15.5], [81.0, 15.8], [81.6, 16.4], [82.4, 16.9], [83.3, 17.7], [84.4, 18.6], [85.2, 19.4], [85.8, 19.8], [86.6, 20.3], [87.0, 21.4], [87.9, 21.8], [88.6, 21.6], [89.5, 21.9], [90.3, 22.0], [91.0, 22.6], [91.8, 22.3], [92.2, 21.2], [92.3, 20.7], [93, 19.9], [93, 37.5], [60, 37.5], [60, 25.3]];
  const lanka = [[79.9, 9.8], [80.3, 9.6], [81.2, 8.5], [81.9, 7.3], [81.7, 6.4], [80.6, 5.95], [79.9, 6.8], [79.8, 8.2]];
  const rivers = {
    ganga: { pts: [[78.9, 30.99], [78.6, 30.3], [78.16, 29.95], [78.1, 28.8], [78.7, 28.0], [79.9, 27.05], [80.9, 26.2], [81.85, 25.43], [83.0, 25.3], [84.2, 25.6], [85.1, 25.6], [86.2, 25.4], [87.0, 25.25], [87.9, 24.8], [88.3, 23.6], [88.1, 21.9]], label: "Ganga", at: [82.3, 25.1] },
    yamuna: { pts: [[78.45, 31.0], [77.6, 30.4], [77.3, 29.5], [77.25, 28.6], [77.67, 27.5], [78.0, 27.18], [79.0, 26.78], [80.3, 25.9], [81.85, 25.43]], label: "Yamuna", at: [78.3, 27.05] },
    indus: { pts: [[78.5, 34.6], [76.5, 35.0], [74.6, 35.7], [73.0, 34.4], [72.24, 33.9], [71.6, 32.6], [71.0, 30.6], [70.1, 28.6], [68.9, 27.7], [68.3, 26.0], [68.2, 25.0], [67.5, 24.0]], label: "Indus", at: [69.6, 27.7] },
    narmada: { pts: [[81.7, 22.7], [79.9, 23.1], [78.4, 22.8], [77.0, 22.5], [75.5, 22.2], [73.6, 21.8], [72.9, 21.6]], label: "Narmada", at: [77.2, 22.25] },
    sarasvati: { pts: [[77.1, 30.7], [76.4, 29.95], [75.4, 29.6], [74.0, 29.1], [72.6, 28.3], [71.2, 27.2], [70.3, 26.2]], label: "Sarasvati", at: [73.7, 28.75], lost: true },
  };
  const range = [[71.2, 36.3], [73.6, 35.6], [75.6, 34.6], [77.3, 33.6], [78.6, 32.1], [79.6, 30.9], [81.2, 29.9], [83.5, 28.9], [85.8, 28.2], [88.2, 27.9], [90.5, 27.9], [92.4, 27.8]];

  const el = (n, a = {}, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const poly = pts => "M" + pts.map(([lo, la]) => X(lo) + "," + Y(la)).join(" L") + " Z";
  const line = pts => "M" + pts.map(([lo, la]) => X(lo) + "," + Y(la)).join(" L");
  function km(a, b) { const R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lon - a.lon) * r; const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
  const roundKm = d => d < 100 ? Math.round(d / 5) * 5 : Math.round(d / 10) * 10;
  const fmt = n => n.toLocaleString("en");

  // Draws sea, land, mountains, rivers and labels. Returns layers for journeys and places.
  function drawBase(svg) {
    svg.classList.add("mapsvg");
    el("rect", { x: -400, y: -400, width: FULL.w + 800, height: FULL.h + 800, fill: "var(--sea)" }, svg);
    el("path", { d: poly(coast), class: "land" }, svg);
    el("path", { d: poly(lanka), class: "land" }, svg);
    const gM = el("g", { "aria-hidden": "true" }, svg);
    const guide = el("path", { d: line(range), fill: "none", stroke: "none" }, gM);
    const gl = guide.getTotalLength();
    for (let s = 0; s <= gl; s += 7.5) { const p = guide.getPointAtLength(s), off = ((s * 7) % 5) - 2.5, z = 3.2 + ((s * 3) % 2); el("path", { d: `M${p.x - z},${p.y + off + z} L${p.x},${p.y + off - z} L${p.x + z},${p.y + off + z} Z`, class: "mount" }, gM); }
    const gR = el("g", { "aria-hidden": "true" }, svg);
    for (const k in rivers) { const r = rivers[k]; el("path", { d: line(r.pts), class: "river" + (r.lost ? " lost" : "") }, gR); el("text", { x: X(r.at[0]), y: Y(r.at[1]), class: "rlabel" }, gR).textContent = r.label; }
    [["Arabian Sea", 64.2, 16.5], ["Bay of Bengal", 86.0, 15.5], ["Himalaya", 81.4, 31.6]].forEach(([t, lo, la]) => { el("text", { x: X(lo), y: Y(la), class: "sealabel", "aria-hidden": "true" }, svg).textContent = t; });
    return { legs: el("g", {}, svg), places: el("g", {}, svg) };
  }

  // Expand a box to match the SVG's aspect ratio
  function fitAspect(svg, box) {
    const ar = (svg.clientWidth || 1) / (svg.clientHeight || 1);
    box = { ...box };
    if (box.w / box.h < ar) { const nw = box.h * ar; box.x -= (nw - box.w) / 2; box.w = nw; } else { const nh = box.w / ar; box.y -= (nh - box.h) / 2; box.h = nh; }
    return box;
  }
  // Fit a set of place ids with padding and a minimum span of 6° × 4.5°
  // extraBottom (degrees) leaves room for an overlay such as the legend
  function fitPlaces(svg, ids, pad = 1.3, extraBottom = 0) {
    const P = MB.places;
    let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    ids.forEach(i => { const p = P[i]; a = Math.min(a, p.lon); b = Math.max(b, p.lon); c = Math.min(c, p.lat); d = Math.max(d, p.lat); });
    a -= pad; b += pad; c -= pad + extraBottom; d += pad;
    if (b - a < 6) { const m = (a + b) / 2; a = m - 3; b = m + 3; }
    if (d - c < 4.5) { const m = (c + d) / 2; c = m - 2.25; d = m + 2.25; }
    return fitAspect(svg, { x: X(a), y: Y(d), w: X(b) - X(a), h: Y(c) - Y(d) });
  }

  // Camera: tweens the viewBox and keeps on-screen sizes constant through --u
  function camera(svg, onScale) {
    const cam = { vb: fitAspect(svg, FULL), anim: 0 };
    cam.apply = () => {
      svg.setAttribute("viewBox", `${cam.vb.x} ${cam.vb.y} ${cam.vb.w} ${cam.vb.h}`);
      const u = Math.max(cam.vb.w / (svg.clientWidth || 1), cam.vb.h / (svg.clientHeight || 1));
      svg.style.setProperty("--u", u);
      onScale && onScale(u);
    };
    cam.set = box => { cancelAnimationFrame(cam.anim); cam.vb = { ...box }; cam.apply(); };
    cam.fly = box => {
      cancelAnimationFrame(cam.anim);
      if (MB.reduce) return cam.set(box);
      const s = { ...cam.vb }, t0 = performance.now(), D = 950;
      const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      const step = now => {
        const k = Math.min(1, (now - t0) / D), e = ease(k);
        cam.vb = { x: s.x + (box.x - s.x) * e, y: s.y + (box.y - s.y) * e, w: s.w + (box.w - s.w) * e, h: s.h + (box.h - s.h) * e };
        cam.apply();
        if (k < 1) cam.anim = requestAnimationFrame(step);
      };
      cam.anim = requestAnimationFrame(step);
    };
    cam.full = () => fitAspect(svg, FULL);
    cam.apply();
    return cam;
  }

  // Place markers: focusable, with labels that keep a constant screen size
  function markers(layer, onClick) {
    const P = MB.places, m = {};
    for (const id in P) {
      const p = P[id];
      const g = el("g", { class: "marker", tabindex: "0", role: "button", "aria-label": p.name }, layer);
      const c = el("circle", { cx: X(p.lon), cy: Y(p.lat), r: 4 }, g);
      const t = el("text", {}, g); t.textContent = p.name;
      if (onClick) {
        g.addEventListener("click", () => onClick(id));
        g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(id); } });
      } else { g.removeAttribute("tabindex"); g.removeAttribute("role"); }
      m[id] = { g, c, t };
    }
    return {
      scale(u) {
        for (const id in m) {
          const { g, c, t } = m[id], p = P[id], on = g.classList.contains("on");
          c.setAttribute("r", (on ? 6.5 : 4) * u);
          const x = X(p.lon), y = Y(p.lat), o = 10 * u;
          let tx = x + o, ty = y + 4 * u, anchor = "start";
          if (p.lab === "l") { tx = x - o; anchor = "end"; }
          if (p.lab === "b") { tx = x; ty = y + 18 * u; anchor = "middle"; }
          t.setAttribute("x", tx); t.setAttribute("y", ty); t.setAttribute("text-anchor", anchor);
        }
      },
      sides(fn) { for (const id in m) { const s = fn(id); m[id].g.setAttribute("class", "marker" + (s ? " on " + s : "")); } },
      select(id) { for (const k in m) m[k].g.classList.toggle("sel", k === id); },
    };
  }

  // Journey legs as gently curved paths with distance labels. Returns rows for a list.
  function drawLegs(layer, legs) {
    const P = MB.places;
    layer.innerHTML = "";
    let total = 0;
    const rows = legs.map(([f, t, side, who]) => {
      const A = P[f], B = P[t], ax = X(A.lon), ay = Y(A.lat), bx = X(B.lon), by = Y(B.lat);
      const dx = bx - ax, dy = by - ay, bend = .16, cx = (ax + bx) / 2 - dy * bend, cy = (ay + by) / 2 + dx * bend;
      const path = el("path", { d: `M${ax},${ay} Q${cx},${cy} ${bx},${by}`, class: "leg " + side }, layer);
      const d = roundKm(km(A, B)); total += d;
      const txt = el("text", { x: .25 * ax + .5 * cx + .25 * bx, y: .25 * ay + .5 * cy + .25 * by, class: "dist", "text-anchor": "middle" }, layer);
      txt.textContent = `≈ ${fmt(d)} km`;
      if (!MB.reduce) {
        const L = path.getTotalLength();
        path.style.strokeDasharray = `${L} ${L}`; path.style.strokeDashoffset = L; txt.style.opacity = 0;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          path.style.transition = "stroke-dashoffset 1.3s ease .5s"; path.style.strokeDashoffset = 0;
          txt.style.transition = "opacity .4s ease 1.6s"; txt.style.opacity = 1;
        }));
      }
      return { from: A, to: B, side, who, km: d };
    });
    return { rows, total };
  }

  // Which side a place is on in a chapter: explicit factions first, then any leg touching it
  function sideOf(ch, id) {
    if (ch.factions && ch.factions[id]) return ch.factions[id];
    let s = null; (ch.legs || []).forEach(l => { if (l[0] === id || l[1] === id) s = l[2]; }); return s;
  }
  function chapterPlaces(ch) {
    const ids = [];
    (ch.legs || []).forEach(l => [l[0], l[1]].forEach(x => { if (!ids.includes(x)) ids.push(x); }));
    if (ch.factions) Object.keys(ch.factions).forEach(x => { if (!ids.includes(x)) ids.push(x); });
    return ids;
  }

  MB.geo = { NS, X, Y, FULL, el, km, roundKm, fmt, drawBase, fitAspect, fitPlaces, camera, markers, drawLegs, sideOf, chapterPlaces };
})();
