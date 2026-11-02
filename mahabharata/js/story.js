/* Scroll-through story: the retelling on one side; a small map, the family tree and, during
   the war, battlefield sketches on the other. */
(function () {
  const { geo, byChar, chapters, warSteps } = MB;
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a = {}, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };

  // Chapters 1–8, the war in four parts, then the aftermath
  const STEPS = [
    ...chapters.slice(0, 8).map((c, i) => ({ ...c, num: i + 1, label: `Chapter ${i + 1} of 10` })),
    ...warSteps.map((w, i) => ({ ...w, num: 9, legs: chapters[8].legs, label: `Chapter 9 of 10 · part ${i + 1} of 4` })),
    { ...chapters[9], num: 10, label: "Chapter 10 of 10" },
  ];

  /* ---------- narrative ---------- */
  const stepsBox = document.getElementById("steps");
  STEPS.forEach((s, i) => {
    const sec = document.createElement("section");
    sec.className = "step"; sec.id = i === STEPS.findIndex(q => q.num === s.num) ? `chapter-${s.num}` : s.id; sec.dataset.i = i;
    const people = MB.list(MB.names(s.chars.filter(id => byChar[id])));
    sec.innerHTML = `<p class="count">${s.label}</p><h2>${s.title}</h2><span class="span">${s.span}</span><p>${s.text}</p>
      <p class="hint">In this part: ${people}.</p>`;
    stepsBox.appendChild(sec);
  });
  document.getElementById("outro").innerHTML = `<h2 class="display" style="font-size:1.5rem;margin:0 0 .5rem">About these pages</h2>
    <ul>${MB.caveats.map(c => `<li>${c}</li>`).join("")}</ul>
    <p><a href="map.html">Explore the map</a> · <a href="lifelines.html">See the lifelines</a></p>`;

  /* ---------- map ---------- */
  const svg = document.getElementById("map");
  const layers = geo.drawBase(svg);
  const mk = geo.markers(layers.places, null);
  const cam = geo.camera(svg, u => mk.scale(u));

  /* ---------- family tree ---------- */
  // [column, generation row]; spouses sit beside each other, children below.
  const POS = {
    santanu: [6, 0], satyavati: [7.6, 0],
    bhishma: [3.6, 1], chitrangada: [5.1, 1], vichitravirya: [6.5, 1], ambika: [7.8, 1], ambalika: [9.1, 1], vyasa: [10.6, 1], amba: [12.8, 1],
    shakuni: [0.3, 2], gandhari: [1.5, 2], dhritarashtra: [2.7, 2], vidura: [4.1, 2], pandu: [5.6, 2], kunti: [6.8, 2], madri: [8.0, 2], shalya: [9.2, 2], drona: [10.6, 2], drupada: [12.4, 2], virata: [14, 2],
    duryodhana: [0.8, 3], dushasana: [2.0, 3], karna: [3.4, 3], yudhishthira: [4.6, 3], bhima: [5.6, 3], arjuna: [6.6, 3], nakula: [7.6, 3], sahadeva: [8.6, 3], subhadra: [9.6, 3], ashwatthama: [10.6, 3], draupadi: [11.7, 3], dhrishtadyumna: [12.8, 3], shikhandi: [13.9, 3], krishna: [15, 3],
    ghatotkacha: [5.6, 4], abhimanyu: [8.1, 4], uttara: [9.4, 4], upapandavas: [11.7, 4],
    parikshit: [8.7, 5], janamejaya: [8.7, 6],
  };
  const SHORT = { dhrishtadyumna: "Dhrishta­dyumna", yudhishthira: "Yudhishthira", upapandavas: "Draupadi’s sons", vichitravirya: "Vichitra­virya" };
  const tree = document.getElementById("tree");
  let treeNodes = {};
  function buildTree() {
    tree.innerHTML = "";
    const W = tree.clientWidth || 600, H = tree.clientHeight || 300;
    tree.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const cx = c => 26 + c / 15 * (W - 52), cy = r => 34 + r / 6 * (H - 56);
    const links = el("g", {}, tree), nodes = el("g", {}, tree);
    for (const id in POS) {
      const c = byChar[id];
      // parent links: from the parents' midpoint to the child
      const ps = c.parents.filter(p => POS[p]);
      if (ps.length) {
        const mx = ps.reduce((a, p) => a + cx(POS[p][0]), 0) / ps.length, my = cy(POS[ps[0]][1]);
        const x2 = cx(POS[id][0]), y2 = cy(POS[id][1]), ym = (my + y2) / 2;
        el("path", { class: "tlink", d: `M${mx},${my} V${ym} H${x2} V${y2}` }, links);
      }
      for (const s of c.spouses) if (POS[s] && s > id) el("path", { class: "tlink marriage", d: `M${cx(POS[id][0])},${cy(POS[id][1])} L${cx(POS[s][0])},${cy(POS[s][1])}` }, links);
      if (c.rebirth && POS[c.rebirth]) el("path", { class: "tlink rebirth", d: `M${cx(POS[id][0])},${cy(POS[id][1])} Q${cx(POS[id][0]) + 30},${(cy(POS[id][1]) + cy(POS[c.rebirth][1])) / 2} ${cx(POS[c.rebirth][0])},${cy(POS[c.rebirth][1])}` }, links);
    }
    const nth = {};
    for (const id in POS) {
      const c = byChar[id], [col, row] = POS[id];
      const g = el("g", { class: "tnode" }, nodes);
      el("circle", { cx: cx(col), cy: cy(row), r: 5.5, fill: `var(--${c.side})` }, g);
      // Alternate labels above and below in the crowded rows
      nth[row] = (nth[row] || 0) + 1;
      const below = row >= 1 && row <= 3 ? nth[row] % 2 === 1 : true;
      const t = el("text", { x: cx(col), y: cy(row) + (below ? 17 : -9), "text-anchor": "middle" }, g);
      t.textContent = SHORT[id] || c.name;
      const ti = el("title", {}, g); ti.textContent = `${c.name}: ${c.death}`;
      treeNodes[id] = g;
    }
  }
  function updateTree(step) {
    const t = step.t, active = new Set(step.chars);
    let dead = 0;
    for (const id in treeNodes) {
      const c = byChar[id], g = treeNodes[id];
      const unborn = c.born > t, isDead = c.died != null && !c.unknownEnd && c.died <= t;
      if (isDead) dead++;
      g.setAttribute("class", "tnode" + (unborn ? " unborn" : isDead ? " dead" : active.has(id) ? " active" : " idle"));
    }
    document.getElementById("treetitle").textContent = `Family tree · ${MB.whenText(t)} · ${dead} of ${Object.keys(treeNodes).length} shown have died`;
  }

  /* ---------- battlefield sketches ---------- */
  const bsvg = document.getElementById("battlesvg");
  let spin = 0, spinner = null;
  function army(g, pts, side, r = 3.2) { for (const [x, y] of pts) el("circle", { cx: x, cy: y, r, fill: `var(--${side})` }, g); }
  function grid(x0, y0, cols, rows, gap) { const p = []; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) p.push([x0 + i * gap, y0 + j * gap]); return p; }
  function label(g, x, y, text, side, anchor = "middle", size = 13) { const t = el("text", { x, y, "text-anchor": anchor, "font-size": size, "font-weight": 600, fill: side ? `var(--${side})` : "var(--ink)" }, g); t.textContent = text; }
  const BATTLES = {
    krauncha(g) {
      army(g, grid(110, 30, 19, 4, 10), "kaurava");
      label(g, 200, 22, "Kaurava army", "kaurava");
      // Pandava army as a heron: beak and neck toward the enemy, wings spread, body behind
      const pts = [];
      for (let i = 0; i < 6; i++) pts.push([200, 92 + i * 9]);                 // neck and beak
      for (let a = 0; a < Math.PI * 2; a += 0.35) pts.push([200 + 26 * Math.cos(a), 168 + 18 * Math.sin(a)]);  // body
      for (let i = 1; i <= 9; i++) { pts.push([200 - 14 - i * 12, 160 - i * 5 + (i % 2) * 3]); pts.push([200 + 14 + i * 12, 160 - i * 5 + (i % 2) * 3]); }  // wings
      for (let i = 1; i <= 4; i++) pts.push([200 + (i % 2 ? -6 : 6), 186 + i * 9]);   // tail
      army(g, pts, "pandava");
      label(g, 200, 250, "Pandava army as a heron (Krauncha)", "pandava");
      return "Day 2: the Pandavas arrange their army as a heron, the Krauncha formation. Each day both sides pick a named shape: birds, a crocodile, a crescent, a wheel.";
    },
    chakravyuha(g) {
      const rings = el("g", {}, g);
      for (let r = 1; r <= 6; r++) {
        const R = 18 + r * 19, n = Math.round(R / 5), gap = 0.55;
        for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if (a > Math.PI * 1.5 - gap / 2 && a < Math.PI * 1.5 + gap / 2 + (r % 2) * 0.3) continue; el("circle", { cx: 200 + R * Math.cos(a + r * 0.5), cy: 150 + R * Math.sin(a + r * 0.5), r: 2.8, fill: "var(--kaurava)" }, rings); }
      }
      // Abhimanyu's path spiraling inward
      let d = "M200,292"; for (let k = 0; k <= 120; k++) { const R = 140 - k * 1.05, a = Math.PI / 2 + k * 0.11; d += ` L${200 + R * Math.cos(a)},${150 + R * Math.sin(a)}`; }
      const path = el("path", { d, fill: "none", stroke: "var(--pandava)", "stroke-width": 2.5, "stroke-linecap": "round" }, g);
      if (!MB.reduce) { const L = path.getTotalLength(); path.style.strokeDasharray = `${L} ${L}`; path.style.strokeDashoffset = L; requestAnimationFrame(() => requestAnimationFrame(() => { path.style.transition = "stroke-dashoffset 4s ease"; path.style.strokeDashoffset = 0; })); }
      el("circle", { cx: 200, cy: 150, r: 6, fill: "var(--pandava)" }, g);
      label(g, 200, 18, "Drona’s wheel formation (Chakravyuha)", "kaurava");
      spinner = rings;
      return "Day 13: rings of Kaurava warriors turn like a wheel. Abhimanyu (blue) fights his way in; Jayadratha closes the gap behind him, and he cannot get out.";
    },
    duel(g) {
      const chariot = (x, side, tilt) => {
        const c = el("g", { transform: `translate(${x},150) rotate(${tilt})` }, g);
        el("rect", { x: -34, y: -22, width: 68, height: 30, rx: 5, fill: `var(--${side})`, opacity: .85 }, c);
        el("circle", { cx: -22, cy: 14, r: 13, fill: "none", stroke: `var(--${side})`, "stroke-width": 3 }, c);
        el("circle", { cx: 22, cy: 14, r: 13, fill: "none", stroke: `var(--${side})`, "stroke-width": 3 }, c);
      };
      el("path", { d: "M60,190 Q200,206 340,190 L340,230 L60,230 Z", fill: "var(--mount)", opacity: .35 }, g);
      chariot(110, "pandava", 0); chariot(290, "kaurava", 9);
      el("path", { d: "M150,128 Q200,92 252,130", fill: "none", stroke: "var(--pandava)", "stroke-width": 2, "stroke-dasharray": "5 4" }, g);
      label(g, 110, 102, "Arjuna, Krishna driving", "pandava");
      label(g, 290, 102, "Karna, Shalya driving", "kaurava");
      label(g, 290, 214, "wheel sunk in the earth", "", "middle", 12);
      return "Day 17: Karna’s chariot wheel sinks into the ground. While he struggles to lift it, Arjuna shoots.";
    },
    lake(g) {
      el("ellipse", { cx: 140, cy: 170, rx: 95, ry: 52, fill: "var(--sea)", stroke: "var(--river)", "stroke-width": 2 }, g);
      label(g, 140, 178, "Duryodhana’s lake", "", "middle", 12);
      el("circle", { cx: 250, cy: 120, r: 9, fill: "var(--pandava)" }, g); el("circle", { cx: 290, cy: 120, r: 9, fill: "var(--kaurava)" }, g);
      el("path", { d: "M258,112 L274,96 M282,112 L268,96", stroke: "var(--ink)", "stroke-width": 3, "stroke-linecap": "round" }, g);
      label(g, 250, 146, "Bhima", "pandava", "end", 12); label(g, 296, 146, "Duryodhana", "kaurava", "start", 12);
      for (let i = 0; i < 6; i++) el("path", { d: `M${300 + (i % 3) * 26},${215 + Math.floor(i / 3) * 26} l10,-14 l10,14 Z`, fill: "var(--panel)", stroke: "var(--pandava)", "stroke-width": 1.5 }, g);
      label(g, 326, 280, "Pandava camp, raided at night", "pandava", "middle", 12);
      return "Day 18: Duryodhana hides in a lake, then fights Bhima with maces and falls. That night Ashwatthama raids the sleeping Pandava camp.";
    },
  };
  function showBattle(kind) {
    bsvg.innerHTML = ""; spinner = null;
    const g = el("g", {}, bsvg);
    return BATTLES[kind](g);
  }
  function spinLoop() { if (spinner && !MB.reduce) { spin += 0.12; spinner.setAttribute("transform", `rotate(${spin} 200 150)`); } requestAnimationFrame(spinLoop); }
  requestAnimationFrame(spinLoop);

  /* ---------- activation ---------- */
  let cur = -1;
  const battleBox = document.getElementById("battle"), caption = document.getElementById("caption");
  function activate(i) {
    if (i === cur) return;
    cur = i;
    const s = STEPS[i];
    document.querySelectorAll(".step").forEach(sec => sec.classList.toggle("active", +sec.dataset.i === i));
    MB.setHash(document.querySelector(`.step[data-i="${i}"]`).id);
    if (s.battle) {
      battleBox.hidden = false;
      caption.textContent = showBattle(s.battle);
    } else {
      battleBox.hidden = true; spinner = null;
      mk.sides(id => geo.sideOf(s, id));
      const { total } = geo.drawLegs(layers.legs, s.legs || []);
      cam.fly(geo.fitPlaces(svg, geo.chapterPlaces(s)));
      caption.textContent = `${s.short || s.title}: about ${geo.fmt(total)} km of journeys, in straight lines.`;
    }
    updateTree(s);
  }

  const narrative = document.getElementById("narrative");
  // The active step is whichever one crosses a reading line just above the middle of the
  // scrolling area (the narrative column on wide screens, the page on phones).
  const sections = [...document.querySelectorAll(".step")];
  function pick() {
    const own = getComputedStyle(narrative).overflowY === "auto";
    const box = own ? narrative.getBoundingClientRect() : { top: 0, height: window.innerHeight };
    const line = box.top + box.height * 0.45;
    let best = null, bestD = Infinity;
    for (const sec of sections) {
      const r = sec.getBoundingClientRect();
      const d = r.top <= line && r.bottom >= line ? 0 : Math.min(Math.abs(r.top - line), Math.abs(r.bottom - line));
      if (d < bestD) { bestD = d; best = sec; }
    }
    if (best) activate(+best.dataset.i);
  }
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; pick(); }); } };
  function observe() { narrative.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("scroll", onScroll, { passive: true }); }
  document.addEventListener("keydown", e => {
    if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(e.key)) return;
    const n = cur + (e.key === "ArrowDown" || e.key === "PageDown" ? 1 : -1);
    if (n < 0 || n >= STEPS.length) return;
    e.preventDefault();
    document.querySelector(`.step[data-i="${n}"]`).scrollIntoView({ block: "center", behavior: MB.reduce ? "auto" : "smooth" });
  });

  let resizeT = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      buildTree(); if (cur >= 0) updateTree(STEPS[cur]);
      const s = STEPS[Math.max(cur, 0)]; if (!s.battle) cam.set(geo.fitPlaces(svg, geo.chapterPlaces(s)));
    }, 80);
  }).observe(document.querySelector(".visuals"));

  // Start: build visuals, jump to a linked chapter if there is one, then follow the scroll
  buildTree();
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  const startI = target && target.classList.contains("step") ? +target.dataset.i : 0;
  cam.set(cam.full());
  activate(startI);
  if (startI > 0) target.scrollIntoView({ block: "center" });
  observe();
})();
