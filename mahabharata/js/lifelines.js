/* Generational lifelines: one lane per character from birth to death, with events cutting
   across all lanes. Zooms from six generations, to the exile years, to the eighteen days. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const { W, characters, events, commanders, byChar, byEvent } = MB;
  const el = (n, a = {}, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const axis = document.getElementById("axis"), lanes = document.getElementById("lanes"), hist = document.getElementById("history");
  const wrap = document.getElementById("laneswrap"), detail = document.getElementById("detail");

  const ZOOMS = [
    { id: "generations", label: "Six generations", domain: [-140, 86] },
    { id: "exile", label: "Exile and war years", domain: [-1.6, 14.4] },
    { id: "war", label: "The 18 days", domain: [W(1) - 0.7 / 365, W(18) + 1.7 / 365] },
    { id: "history", label: "In real history" },
  ];
  const ROW = 24, GEN_ROW = 22, AXIS_H = 64;
  let zoom = ZOOMS[0], dom = [...zoom.domain], sel = null, anim = 0;

  // Lane order: by generation, then birth
  const order = [...characters].sort((a, b) => a.gen - b.gen || a.born - b.born);
  const nameW = () => (wrap.clientWidth < 560 ? 104 : 142);
  const width = () => wrap.clientWidth || 600;
  const x = t => nameW() + (t - dom[0]) / (dom[1] - dom[0]) * (width() - nameW() - 18);
  const inDom = t => t >= dom[0] && t <= dom[1];

  /* ---------- build lanes once; layout() only moves things ---------- */
  const defs = el("defs", {}, lanes);
  for (const s of ["pandava", "kaurava", "kuru", "neutral"]) {
    const g = el("linearGradient", { id: "fade-" + s, x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
    el("stop", { offset: "0.55", "stop-color": `var(--${s})`, "stop-opacity": 1 }, g);
    el("stop", { offset: "1", "stop-color": `var(--${s})`, "stop-opacity": 0 }, g);
  }
  const evLayer = el("g", {}, lanes), rowLayer = el("g", {}, lanes), dotLayer = el("g", {}, lanes);
  const rows = {}, genLabels = [];
  let y = 6, lastGen = -1;
  for (const c of order) {
    if (c.gen !== lastGen) {
      lastGen = c.gen;
      const t = el("text", { class: "gen-label", x: 8, y: y + 15 }, rowLayer);
      t.textContent = c.gen === 0 ? "Generation 0, Shantanu’s" : `Generation ${c.gen}`;
      genLabels.push(t); y += GEN_ROW;
    }
    const g = el("g", { class: "lane-row", tabindex: 0, role: "button", "aria-label": `${c.name}: ${c.death}` }, rowLayer);
    const bg = el("rect", { class: "lane-bg", x: 0, y, height: ROW, fill: "transparent" }, g);
    const name = el("text", { class: "lane-name", x: 8, y: y + 16 }, g); name.textContent = c.name;
    const bar = el("rect", { class: "lane-bar", y: y + 7, height: 10, rx: 5, fill: c.unknownEnd ? `url(#fade-${c.side})` : `var(--${c.side})` }, g);
    let end = null;
    if (c.chiranjivi) { end = el("text", { y: y + 16, "font-size": 12, fill: `var(--${c.side})` }, g); end.textContent = "▸ lives on"; }
    else if (c.died != null) { end = el("text", { y: y + 16.5, "font-size": 13, "font-weight": 600, fill: "var(--ink)" }, g); end.textContent = "✕"; }
    g.addEventListener("click", () => select({ char: c.id }));
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select({ char: c.id }); } });
    rows[c.id] = { c, g, bg, name, bar, end, y };
    y += ROW;
  }
  const lanesH = y + 10;
  lanes.setAttribute("height", lanesH);

  // Event lines across the lanes, and a dot on each involved lane
  const evEls = events.map(ev => {
    const line = el("line", { class: "ev-line", y1: 0, y2: lanesH }, evLayer);
    const dots = ev.chars.filter(id => rows[id]).map(id => el("circle", { r: 3.2, cy: rows[id].y + 12, fill: "var(--ink)", opacity: .7 }, dotLayer));
    return { ev, line, dots };
  });

  /* ---------- axis ---------- */
  function niceStep(span) {
    const steps = [0.25, 0.5, 1, 2, 5, 10, 20, 25, 50];
    const target = span / Math.max(4, (width() - nameW()) / 90);
    return steps.find(s => s >= target) || 50;
  }
  function drawAxis() {
    axis.innerHTML = ""; axis.setAttribute("height", AXIS_H);
    const w = width();
    axis.setAttribute("width", w);
    const isWar = zoom.id === "war" || (dom[1] - dom[0]) < 0.2;
    // commander bands when zoomed into the war
    if (dom[1] - dom[0] < 1.2) for (const cmd of commanders) {
      const x0 = x(W(cmd.from)), x1 = x(W(cmd.to + 1));
      if (x1 < nameW() || x0 > w) continue;
      el("rect", { class: "cmd-band", x: Math.max(nameW(), x0), y: 2, width: Math.max(0, Math.min(w, x1) - Math.max(nameW(), x0)), height: 18, fill: "var(--kaurava)" }, axis);
      const t = el("text", { class: "cmd-label", x: Math.max(nameW(), x0) + 4, y: 15, fill: "var(--kaurava)" }, axis); t.textContent = x1 - x0 > 70 ? cmd.label : cmd.label.split(",")[0];
    }
    if (isWar) {
      for (let d = 1; d <= 18; d++) {
        const xd = x(W(d)); if (xd < nameW() - 1 || xd > w) continue;
        el("line", { class: "tick", x1: xd, x2: xd, y1: 22, y2: AXIS_H }, axis);
        const t = el("text", { class: "tick-label", x: xd + 3, y: 34 }, axis); t.textContent = d === 1 ? "Day 1" : d;
      }
    } else {
      const step = niceStep(dom[1] - dom[0]);
      for (let t = Math.ceil(dom[0] / step) * step; t <= dom[1]; t += step) {
        const xt = x(t); if (xt < nameW() - 1) continue;
        el("line", { class: "tick", x1: xt, x2: xt, y1: 22, y2: AXIS_H }, axis);
        const lab = el("text", { class: "tick-label", x: xt + 3, y: 34 }, axis);
        lab.textContent = Math.abs(t) < 1e-9 ? "dice game" : (t > 0 ? "+" : "−") + Math.abs(+t.toFixed(2));
      }
    }
    const cap = el("text", { class: "tick-label", x: 8, y: 34 }, axis);
    cap.textContent = isWar ? "war days" : "years from the dice";
    // event markers along the bottom of the axis
    for (const { ev } of evEls) {
      if (!inDom(ev.t)) continue;
      const c = el("circle", { class: "ev-dot" + (sel && sel.event === ev.id ? " sel" : ""), cx: x(ev.t), cy: 50, r: 5.5, tabindex: 0, role: "button", "aria-label": ev.title }, axis);
      const ti = el("title", {}, c); ti.textContent = `${ev.title} · ${MB.whenText(ev.t)}`;
      c.addEventListener("click", () => select({ event: ev.id }));
      c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select({ event: ev.id }); } });
    }
    axis.style.pointerEvents = "auto";
  }

  /* ---------- layout ---------- */
  function layout() {
    const w = width();
    lanes.setAttribute("width", w);
    const t0 = dom[0], t1 = dom[1];
    for (const id in rows) {
      const r = rows[id], c = r.c;
      r.bg.setAttribute("width", w);
      const end = c.chiranjivi ? t1 + 10 : c.died != null ? c.died : c.born + 60;
      const a = Math.max(x(c.born), nameW()), b = Math.min(x(end), w - 6);
      const visible = b > nameW() && a < w - 6 && b > a;
      r.bar.setAttribute("x", a); r.bar.setAttribute("width", visible ? Math.max(2, b - a) : 0);
      const alive = c.born <= t1 && (c.chiranjivi || c.died == null || end >= t0);
      r.name.classList.toggle("dim", !alive);
      if (r.end) {
        const xe = c.chiranjivi ? w - 70 : x(c.died) + 4;
        const show = c.chiranjivi ? c.born < t1 : inDom(c.died);
        r.end.setAttribute("x", xe); r.end.setAttribute("opacity", show ? 1 : 0);
      }
      r.g.classList.toggle("sel", !!sel && (sel.char === id || (sel.event && byEvent[sel.event].chars.includes(id))));
    }
    for (const { ev, line, dots } of evEls) {
      const xe = x(ev.t), show = inDom(ev.t);
      line.setAttribute("x1", xe); line.setAttribute("x2", xe); line.setAttribute("opacity", show ? 1 : 0);
      line.style.strokeOpacity = sel && sel.event === ev.id ? .7 : "";
      for (const d of dots) { d.setAttribute("cx", xe); d.setAttribute("opacity", show ? .75 : 0); }
    }
    drawAxis();
  }

  /* ---------- real-history view ---------- */
  function drawHistory() {
    hist.innerHTML = "";
    const w = width(), H = 300, d0 = -3600, d1 = 2200, L = 24, R = 24;
    hist.setAttribute("width", w); hist.setAttribute("height", H);
    const hx = yr => L + (yr - d0) / (d1 - d0) * (w - L - R);
    axis.innerHTML = ""; axis.setAttribute("height", AXIS_H); axis.setAttribute("width", w);
    for (let yr = -3500; yr <= 2000; yr += 500) {
      el("line", { class: "tick", x1: hx(yr), x2: hx(yr), y1: 22, y2: AXIS_H }, axis);
      el("line", { class: "tick", x1: hx(yr), x2: hx(yr), y1: 0, y2: H, opacity: .5 }, hist);
      const t = el("text", { class: "tick-label", x: hx(yr) + 3, y: 34 }, axis); t.textContent = yr < 0 ? `${-yr} BCE` : yr === 0 ? "1 CE" : `${yr} CE`;
    }
    const colors = { trad: "var(--kuru)", hist: "var(--pandava)", text: "var(--neutral)", now: "var(--muted)" };
    MB.history.items.forEach((it, i) => {
      const yy = 30 + i * 52, c = colors[it.kind];
      if (it.from === it.to) {
        el("line", { x1: hx(it.from), x2: hx(it.from), y1: yy - 14, y2: yy + 14, stroke: c, "stroke-width": 3 }, hist);
        el("circle", { cx: hx(it.from), cy: yy, r: 6, fill: c }, hist);
      } else el("rect", { x: hx(it.from), y: yy - 8, width: hx(it.to) - hx(it.from), height: 16, rx: 8, fill: c, opacity: .85 }, hist);
      const right = hx(it.to) > w - 260;
      const t = el("text", { x: right ? hx(it.from) - 10 : hx(it.to) + 12, y: yy + 5, "text-anchor": right ? "end" : "start", "font-size": 14 }, hist);
      t.textContent = it.label + (it.from === it.to ? ` (${it.from < 0 ? -it.from + " BCE" : it.from + " CE"})` : ` (${Math.abs(it.from)} BCE – ${it.to < 0 ? -it.to + " BCE" : it.to + " CE"})`);
    });
  }

  /* ---------- detail panel ---------- */
  const sw = s => `<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:var(--${s});vertical-align:-1px;margin-right:.35rem"></span>`;
  const charLink = id => byChar[id] ? `<button class="chip" data-char="${id}">${byChar[id].name}</button>` : "";
  function intro() {
    if (zoom.id === "history") {
      detail.innerHTML = `<p class="count">Outermost zoom</p><h2>Where it sits in history</h2>
        <p>${MB.history.note}</p><p>${MB.history.yugas}</p>
        <p class="caveat">Nothing in the story itself fixes a calendar date, so every lifeline on this page is measured from the game of dice instead.</p>`;
      return;
    }
    detail.innerHTML = `<p class="count">How to read this</p><h2>Six generations, eighteen days</h2>
      <p>Each bar is one life, from birth to death. Click a name for their story, or a dot along the top for an event; the people it involved are highlighted below.</p>
      <div class="legend" style="margin:.8rem 0">${["pandava", "kaurava", "kuru", "neutral"].map(s => `<span><i style="background:var(--${s})"></i>${MB.sideName[s]}</span>`).join("")}
        <span><b style="width:18px;text-align:center">✕</b>dies here</span><span><b style="width:18px;text-align:center;color:var(--muted)">▸</b>one of the long-lived, who never die</span></div>
      <p>Try <b>The 18 days</b> to see the war split by Kaurava commander, and watch how many lanes end inside it.</p>
      <p class="caveat">${MB.caveats[3]} Births are placed to match the ages the text implies; traditions disagree, sometimes by decades.</p>`;
  }
  function wire() {
    detail.querySelectorAll("[data-char]").forEach(b => b.addEventListener("click", () => select({ char: b.dataset.char })));
    detail.querySelectorAll("[data-event]").forEach(b => b.addEventListener("click", () => select({ event: b.dataset.event })));
  }
  function showChar(id) {
    const c = byChar[id];
    const atDice = MB.ageAt(c, 0), atWar = MB.ageAt(c, W(1));
    const evs = events.filter(e => e.chars.includes(id));
    detail.innerHTML = `<p class="count">${sw(c.side)}${MB.sideName[c.side]} · ${c.lineage} · generation ${c.gen}</p>
      <h2>${c.name}</h2>
      ${c.note ? `<p>${c.note}</p>` : ""}
      <dl class="facts">
        ${c.parents.length ? `<dt>Parents</dt><dd>${c.parents.map(charLink).join(" ")}</dd>` : ""}
        ${c.spouses.length ? `<dt>Married to</dt><dd>${c.spouses.map(charLink).join(" ")}</dd>` : ""}
        <dt>Born</dt><dd>${c.bornNote || MB.whenText(c.born)}</dd>
        ${atDice != null ? `<dt>At the dice game</dt><dd>about ${atDice}</dd>` : ""}
        ${atWar != null ? `<dt>When war begins</dt><dd>about ${atWar}</dd>` : ""}
        <dt>${c.chiranjivi ? "Fate" : "Death"}</dt><dd>${c.death}${c.died != null && !c.unknownEnd ? ` <span class="hint">(${MB.whenText(c.died)})</span>` : ""}</dd>
      </dl>
      ${evs.length ? `<h3 style="font-size:1rem;margin:1rem 0 .4rem">Appears in</h3><div class="chips">${evs.map(e => `<button class="chip" data-event="${e.id}">${e.title}</button>`).join("")}</div>` : ""}
      <p class="caveat">Ages are approximate reconstructions. <button class="chip" id="back">Back to the overview</button></p>`;
    wire(); document.getElementById("back").addEventListener("click", () => select(null));
  }
  function showEvent(id) {
    const e = byEvent[id], p = e.place ? MB.places[e.place] : null;
    detail.innerHTML = `<p class="count">${MB.whenText(e.t)}${p ? ` · ${p.name}` : ""}</p>
      <h2>${e.title}</h2>
      <p>${e.text}</p>
      <h3 style="font-size:1rem;margin:1rem 0 .4rem">People involved</h3>
      <div class="chips">${e.chars.map(charLink).join("")}</div>
      <p class="caveat"><a href="map.html#chapter-${e.chapter}">See chapter ${e.chapter} on the map</a> · <a href="story.html#chapter-${e.chapter}">Read it in the story</a> · <button class="chip" id="back">Back to the overview</button></p>`;
    wire(); document.getElementById("back").addEventListener("click", () => select(null));
  }
  function select(s) {
    sel = s;
    if (!s) intro(); else if (s.char) showChar(s.char); else showEvent(s.event);
    if (s && s.char) rows[s.char].g.scrollIntoView({ block: "nearest", behavior: MB.reduce ? "auto" : "smooth" });
    layout();
  }

  /* ---------- zoom controls ---------- */
  const zoomBox = document.getElementById("zooms");
  ZOOMS.forEach(z => {
    const b = document.createElement("button"); b.className = "chip"; b.textContent = z.label; b.dataset.z = z.id;
    b.addEventListener("click", () => setZoom(z.id)); zoomBox.appendChild(b);
  });
  function setZoom(id, instant = false) {
    zoom = ZOOMS.find(z => z.id === id) || ZOOMS[0];
    zoomBox.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.z === zoom.id ? "true" : "false"));
    MB.setHash(zoom.id);
    const isHist = zoom.id === "history";
    // SVG elements have no .hidden property, so toggle the attribute itself
    lanes.toggleAttribute("hidden", isHist); hist.toggleAttribute("hidden", !isHist);
    if (isHist) { cancelAnimationFrame(anim); sel = null; drawHistory(); intro(); return; }
    if (!sel) intro();
    const from = [...dom], to = zoom.domain;
    // Tween in log-ish space so zooming into the war doesn't race past
    if (instant || MB.reduce) { dom = [...to]; layout(); return; }
    const t0 = performance.now(), D = 900, ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const s0 = Math.log(from[1] - from[0]), s1 = Math.log(to[1] - to[0]);
    const c0 = (from[0] + from[1]) / 2, c1 = (to[0] + to[1]) / 2;
    cancelAnimationFrame(anim);
    const step = now => {
      const k = Math.min(1, (now - t0) / D), e = ease(k), span = Math.exp(s0 + (s1 - s0) * e), c = c0 + (c1 - c0) * e;
      dom = [c - span / 2, c + span / 2]; layout();
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }
  new ResizeObserver(() => { if (zoom.id === "history") drawHistory(); else layout(); }).observe(wrap);
  window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (ZOOMS.some(z => z.id === h) && h !== zoom.id) setZoom(h); });

  const h0 = location.hash.slice(1);
  intro();
  setZoom(ZOOMS.some(z => z.id === h0) ? h0 : "generations", true);
  if (byChar[h0]) select({ char: h0 });
})();
