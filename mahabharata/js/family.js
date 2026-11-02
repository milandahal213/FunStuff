/* Everyone: a pannable, zoomable family tree of the whole cast. Click a circle for a one-line
   description; the side panel lists that person's parents, spouses, children and siblings. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a = {}, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const { people, byPerson, peopleGroups: GROUPS, peopleBands: BANDS } = MB;
  const BAND_IDS = new Set(BANDS.map(b => b.id));
  const LABEL = Object.fromEntries([...GROUPS, ...BANDS].map(g => [g.id, g.label]));
  const color = g => ({ kaurava: "var(--kaurava)", pandava: "var(--pandava)", kuru: "var(--kuru)" }[g] || `var(--g-${g})`);
  const zone = p => BAND_IDS.has(p.group) ? "band" : "tree";

  const svg = document.getElementById("fam"), stage = document.getElementById("stage");
  const pop = document.getElementById("pop"), detail = document.getElementById("detail");

  /* ---------- layout: groups side by side, generations as rows, extra groups as bands below ---------- */
  const SP = 76, ROWH = 104, GAP = 80, ROW0 = -3, ROW1 = 6, TOP = 70;
  const rowY = r => TOP + (r - ROW0) * ROWH;
  const pos = {}, boxes = {};
  let x0 = 0;
  for (const g of GROUPS) {
    const members = people.filter(p => p.group === g.id);
    if (!members.length) continue;
    const rows = {};
    members.forEach(p => (rows[p.row] = rows[p.row] || []).push(p));
    const W = Math.max(...Object.values(rows).map(r => r.length)) * SP;
    for (const r in rows) {
      const list = rows[r], off = (W - list.length * SP) / 2;
      list.forEach((p, i) => { pos[p.id] = [x0 + off + i * SP + SP / 2, rowY(+r)]; p._side = i % 2; });
    }
    const minRow = Math.min(...Object.keys(rows).map(Number)), maxRow = Math.max(...Object.keys(rows).map(Number));
    boxes[g.id] = { x: x0, y: rowY(minRow) - 60, w: W, h: rowY(maxRow) - rowY(minRow) + 120 };
    x0 += W + GAP;
  }
  const treeW = x0 - GAP;
  let by = rowY(ROW1) + 170;
  for (const b of BANDS) {
    const members = people.filter(p => p.group === b.id), step = SP * 1.3;
    members.forEach((p, i) => { pos[p.id] = [i * step + step / 2, by]; p._side = i % 2; });
    boxes[b.id] = { x: 0, y: by - 70, w: members.length * step, h: 150 };
    by += ROWH * 1.45;
  }
  const FULL = { x: -170, y: 0, w: Math.max(treeW, ...BANDS.map(b => boxes[b.id].w)) + 220, h: by };

  /* ---------- draw ---------- */
  const gLabels = el("g", {}, svg), gLinks = el("g", {}, svg), gHi = el("g", {}, svg), gNodes = el("g", {}, svg);
  for (let r = ROW0; r <= ROW1; r++) {
    const t = el("text", { class: "rowlabel", x: -24, y: rowY(r) + 4, "text-anchor": "end" }, gLabels);
    t.textContent = r < 0 ? "earlier" : r === 0 ? "Shantanu’s generation" : `generation ${r}`;
  }
  for (const g of GROUPS) if (boxes[g.id]) {
    const b = boxes[g.id], t = el("text", { class: "glabel", x: b.x + b.w / 2, y: b.y - 8, "text-anchor": "middle", fill: color(g.id) }, gLabels);
    t.textContent = g.label;
  }
  for (const b of BANDS) { const t = el("text", { class: "glabel", x: 0, y: boxes[b.id].y + 4, fill: color(b.id) }, gLabels); t.textContent = b.label; }

  // Base links inside the main tree: parent to child, distant ancestry, marriage, rebirth
  const drawn = new Set();
  for (const p of people) {
    if (zone(p) === "band") continue;
    const [cx, cy] = pos[p.id];
    const ps = p.parents.filter(id => byPerson[id] && zone(byPerson[id]) === "tree");
    if (ps.length) {
      const mx = ps.reduce((a, id) => a + pos[id][0], 0) / ps.length, py = Math.max(...ps.map(id => pos[id][1]));
      const ym = py + (cy - py) * 0.55;
      el("path", { class: "flink", d: `M${mx},${py} V${ym} H${cx} V${cy}` }, gLinks);
    }
    for (const d of p.distant || []) if (pos[d]) { const [dx, dy] = pos[d]; el("path", { class: "flink distant", d: `M${dx},${dy} Q${(dx + cx) / 2},${(dy + cy) / 2 + 30} ${cx},${cy}` }, gLinks); }
    for (const s of p.spouses) {
      if (!byPerson[s] || zone(byPerson[s]) !== "tree") continue;
      const key = [p.id, s].sort().join("|"); if (drawn.has(key)) continue; drawn.add(key);
      const [sx, sy] = pos[s];
      el("path", { class: "flink spouse", d: sy === cy ? `M${cx},${cy} Q${(cx + sx) / 2},${cy - 22} ${sx},${sy}` : `M${cx},${cy} L${sx},${sy}` }, gLinks);
    }
    if (p.rebirth && pos[p.rebirth]) { const [rx, ry] = pos[p.rebirth]; el("path", { class: "flink rebirth", d: `M${cx},${cy} Q${(cx + rx) / 2},${(cy + ry) / 2 - 60} ${rx},${ry}` }, gLinks); }
  }

  // Nodes with one- or two-line labels
  const nodes = {};
  for (const p of people) {
    const [x, y] = pos[p.id];
    const g = el("g", { class: "pnode", tabindex: 0, role: "button", "aria-label": `${p.name}: ${p.line}` }, gNodes);
    const c = el("circle", { cx: x, cy: y, r: 7, fill: color(p.group) }, g);
    const words = p.name.split(" "), lines = p.name.length > 13 && words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [p.name];
    const t = el("text", { "text-anchor": "middle", x }, g);
    const spans = lines.map(l => { const s = el("tspan", { x }, t); s.textContent = l; return s; });
    g.addEventListener("click", e => { if (dragMoved) return; e.stopPropagation(); select(p.id, { fly: false }); });
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(p.id, { fly: true }); } });
    nodes[p.id] = { g, c, t, spans, x, y, above: p._side === 1 };
  }

  /* ---------- camera ---------- */
  let vb = fitAspect(FULL), u = 1, anim = 0;
  function fitAspect(b) {
    const ar = (stage.clientWidth || 1) / (stage.clientHeight || 1); b = { ...b };
    if (b.w / b.h < ar) { const nw = b.h * ar; b.x -= (nw - b.w) / 2; b.w = nw; } else { const nh = b.w / ar; b.y -= (nh - b.h) / 2; b.h = nh; }
    return b;
  }
  function apply() {
    svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    u = Math.max(vb.w / (stage.clientWidth || 1), vb.h / (stage.clientHeight || 1));
    svg.style.setProperty("--u", u);
    const r = Math.min(7 * u, SP * 0.3), showAll = u < 1.35;
    for (const id in nodes) {
      const n = nodes[id];
      n.c.setAttribute("r", r);
      const lh = 13 * u, k = n.spans.length;
      n.spans.forEach((s, i) => s.setAttribute("y", n.above ? n.y - r - 6 * u - (k - 1 - i) * lh : n.y + r + 13 * u + i * lh));
      n.g.classList.toggle("lab-off", !showAll);
    }
    placePop();
  }
  function setVB(b) { cancelAnimationFrame(anim); vb = { ...b }; apply(); }
  function fly(b) {
    b = fitAspect(b);
    cancelAnimationFrame(anim);
    if (MB.reduce) return setVB(b);
    const s = { ...vb }, t0 = performance.now(), D = 800, ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const step = now => { const k = Math.min(1, (now - t0) / D), e = ease(k); vb = { x: s.x + (b.x - s.x) * e, y: s.y + (b.y - s.y) * e, w: s.w + (b.w - s.w) * e, h: s.h + (b.h - s.h) * e }; apply(); if (k < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  }
  function zoomAt(px, py, f) {
    const nw = Math.min(FULL.w * 1.6, Math.max(320, vb.w * f)), k = nw / vb.w;
    const mx = vb.x + px * u, my = vb.y + py * u;
    setVB({ x: mx - (mx - vb.x) * k, y: my - (my - vb.y) * k, w: vb.w * k, h: vb.h * k });
  }

  // Pan with a drag, zoom with the wheel or a pinch
  const ptrs = new Map(); let dragMoved = false, pinch = 0;
  const local = e => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  stage.addEventListener("pointerdown", e => {
    if (e.target.closest(".pop")) return;
    ptrs.set(e.pointerId, local(e)); dragMoved = false; pinch = 0;
    stage.setPointerCapture(e.pointerId); stage.classList.add("dragging");
  });
  stage.addEventListener("pointermove", e => {
    if (!ptrs.has(e.pointerId)) return;
    const p = local(e), prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, p);
    if (ptrs.size === 1) {
      const dx = p[0] - prev[0], dy = p[1] - prev[1];
      if (Math.abs(dx) + Math.abs(dy) > 0) { if (!dragMoved && Math.hypot(dx, dy) < 2) return; dragMoved = true; }
      setVB({ ...vb, x: vb.x - dx * u, y: vb.y - dy * u });
    } else if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, pinch / d);
      pinch = d; dragMoved = true;
    }
  });
  const up = e => { ptrs.delete(e.pointerId); pinch = 0; if (!ptrs.size) stage.classList.remove("dragging"); setTimeout(() => { dragMoved = false; }, 0); };
  stage.addEventListener("pointerup", up); stage.addEventListener("pointercancel", up);
  stage.addEventListener("wheel", e => { e.preventDefault(); const p = local(e); zoomAt(p[0], p[1], Math.exp(e.deltaY * 0.0015)); }, { passive: false });
  svg.addEventListener("click", () => { if (!dragMoved) select(null); });
  document.getElementById("zin").addEventListener("click", () => zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1 / 1.5));
  document.getElementById("zout").addEventListener("click", () => zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1.5));
  document.getElementById("fit").addEventListener("click", () => { select(null); fly(FULL); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") select(null); });

  /* ---------- relationships ---------- */
  function relations(id) {
    const p = byPerson[id], known = x => !!byPerson[x];
    const parents = [...p.parents, ...(p.distant || [])].filter(known);
    const divine = (p.divine || []).filter(known);
    const children = people.filter(q => q.parents.includes(id) || (q.distant || []).includes(id) || (q.divine || []).includes(id)).map(q => q.id);
    const spouses = [...new Set([...p.spouses, ...people.filter(q => q.spouses.includes(id)).map(q => q.id)])].filter(known);
    const sib = new Set((p.siblings || []).filter(known));
    people.forEach(q => { if (q.id !== id && p.parents.length && q.parents.some(x => p.parents.includes(x))) sib.add(q.id); if ((q.siblings || []).includes(id)) sib.add(q.id); });
    const rebirth = [p.rebirth, ...people.filter(q => q.rebirth === id).map(q => q.id)].filter(known);
    return { parents, divine, children, spouses, siblings: [...sib], rebirth };
  }

  /* ---------- selection, popover and side panel ---------- */
  let sel = null;
  function select(id, { fly: doFly = false } = {}) {
    sel = id;
    gHi.innerHTML = "";
    for (const k in nodes) nodes[k].g.classList.remove("sel", "rel");
    if (!id) { svg.classList.remove("focus"); pop.hidden = true; intro(); MB.setHash(""); return; }
    const p = byPerson[id], R = relations(id), [sx, sy] = pos[id];
    svg.classList.add("focus");
    nodes[id].g.classList.add("sel");
    const link = (oid, cls) => {
      const [ox, oy] = pos[oid]; nodes[oid].g.classList.add("rel");
      el("path", { class: "hlink " + cls, d: `M${sx},${sy} Q${(sx + ox) / 2 + (oy - sy) * 0.15},${(sy + oy) / 2 - (ox - sx) * 0.08} ${ox},${oy}` }, gHi);
    };
    R.parents.forEach(o => link(o, "")); R.children.forEach(o => link(o, "")); R.siblings.forEach(o => link(o, ""));
    R.spouses.forEach(o => link(o, "spouse")); R.divine.forEach(o => link(o, "divine")); R.rebirth.forEach(o => link(o, "divine"));
    MB.setHash(id);
    showPanel(p, R);
    if (doFly) {
      const ids = [id, ...R.parents, ...R.children, ...R.spouses, ...R.siblings].filter(x => zone(byPerson[x]) === zone(p));
      let a = 1e9, b = -1e9, c = 1e9, d = -1e9; ids.forEach(x => { a = Math.min(a, pos[x][0]); b = Math.max(b, pos[x][0]); c = Math.min(c, pos[x][1]); d = Math.max(d, pos[x][1]); });
      fly({ x: a - 160, y: c - 120, w: Math.max(b - a + 320, 700), h: Math.max(d - c + 240, 420) });
      setTimeout(showPop, MB.reduce ? 0 : 820);
    } else showPop();
  }
  function showPop() {
    if (!sel) return;
    const p = byPerson[sel];
    pop.innerHTML = `<h4 style="color:${color(p.group)}">${p.name}</h4><div class="grp">${LABEL[p.group]}</div><p>${p.line}</p>`;
    pop.hidden = false; placePop();
  }
  function placePop() {
    if (!sel || pop.hidden) return;
    const [x, y] = pos[sel], W = stage.clientWidth, H = stage.clientHeight;
    let px = (x - vb.x) / u + 16, py = (y - vb.y) / u + 16;
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    if (px + pw > W - 8) px = (x - vb.x) / u - pw - 16;
    if (py + ph > H - 8) py = (y - vb.y) / u - ph - 16;
    pop.style.left = Math.max(8, px) + "px"; pop.style.top = Math.max(8, py) + "px";
  }
  const chip = id => `<button class="chip" data-p="${id}"><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${color(byPerson[id].group)};margin-right:.35rem"></i>${byPerson[id].name}</button>`;
  function section(title, ids) { return ids.length ? `<h3>${title}</h3><div class="chips">${ids.map(chip).join("")}</div>` : ""; }
  function wire() { detail.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => select(b.dataset.p, { fly: true }))); }
  function showPanel(p, R) {
    const inLifelines = MB.byChar && MB.byChar[p.id];
    detail.innerHTML = `<p class="count"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color(p.group)};margin-right:.35rem"></span>${LABEL[p.group]}${p.row !== 0 || zone(p) === "tree" ? (zone(p) === "tree" ? ` · ${p.row < 0 ? "an ancestor" : p.row === 0 ? "Shantanu’s generation" : "generation " + p.row}` : "") : ""}</p>
      <h2>${p.name}</h2><p>${p.line}</p>
      ${section("Parents", R.parents.filter(x => !(p.distant || []).includes(x)))}
      ${section("Descended from", (p.distant || []).filter(x => byPerson[x]))}
      ${section(p.group === "gods" ? "Divine children" : "Gods involved", R.divine)}
      ${section("Married to", R.spouses)}
      ${section("Children", R.children)}
      ${section("Siblings", R.siblings)}
      ${section("Rebirth", R.rebirth)}
      <p class="caveat">${inLifelines ? `<a href="lifelines.html#${p.id}">See ${p.name}’s lifeline</a> · ` : ""}<button class="chip" id="clear">Show everyone</button></p>`;
    wire();
    document.getElementById("clear").addEventListener("click", () => { select(null); fly(FULL); });
  }
  function intro() {
    const n = people.length;
    detail.innerHTML = `<p class="count">${n} people</p><h2>Everyone with a part to play</h2>
      <p>The whole cast, from Yayati, ancestor of both the Kurus and the Yadavas, down to Janamejaya, at whose snake sacrifice the story is first told. Each group of families has its own color, generations run down the page, and the gods, sages and characters from the epic’s inner stories sit below.</p>
      <p>Click any circle for a one-line summary, and its relatives light up. Pick a group to fly to it:</p>
      <div class="glegend">${[...GROUPS, ...BANDS].map(g => `<button class="chip" data-g="${g.id}"><i style="background:${color(g.id)}"></i>${g.label}</button>`).join("")}</div>
      <p class="caveat">The epic names thousands of people, many only once in lists of kings and warriors. This tree includes everyone with a part in the story; Gandhari’s hundred sons appear as one circle apart from those with their own roles. Family details differ between versions, and these follow the broad Sanskrit tradition.</p>`;
    detail.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => focusGroup(b.dataset.g)));
  }
  function focusGroup(gid) {
    select(null);
    svg.classList.add("focus");
    for (const p of people) if (p.group === gid) nodes[p.id].g.classList.add("rel");
    const b = boxes[gid]; fly({ x: b.x - 80, y: b.y - 40, w: b.w + 160, h: b.h + 80 });
  }

  /* ---------- search ---------- */
  const find = document.getElementById("find"), names = document.getElementById("names");
  [...people].sort((a, b) => a.name.localeCompare(b.name)).forEach(p => { const o = document.createElement("option"); o.value = p.name; names.appendChild(o); });
  function go() {
    const q = find.value.trim().toLowerCase(); if (!q) return;
    const hit = people.find(p => p.name.toLowerCase() === q) || people.find(p => p.name.toLowerCase().startsWith(q)) || people.find(p => p.name.toLowerCase().includes(q));
    if (hit) { select(hit.id, { fly: true }); find.blur(); }
  }
  find.addEventListener("change", go);
  find.addEventListener("keydown", e => { if (e.key === "Enter") go(); });

  new ResizeObserver(() => { vb = fitAspect(vb); apply(); }).observe(stage);
  window.addEventListener("hashchange", () => { const h = decodeURIComponent(location.hash.slice(1)); if (byPerson[h] && h !== sel) select(h, { fly: true }); });

  // Open on the heart of the story, the Pandavas and the Kuru house above them, zoomed in
  // far enough for names to show; "Show everyone" zooms out to the whole cast.
  const cw = (stage.clientWidth || 800) * 1.2, ch = (stage.clientHeight || 600) * 1.2;
  const coreBox = { x: pos.arjuna[0] - cw * 0.55, y: (rowY(0) + rowY(5)) / 2 - ch / 2, w: cw, h: ch };
  intro();
  setVB(fitAspect(coreBox));
  const h0 = decodeURIComponent(location.hash.slice(1));
  if (byPerson[h0]) select(h0, { fly: true });
})();
