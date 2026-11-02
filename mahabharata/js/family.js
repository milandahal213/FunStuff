/* Everyone: a pannable, zoomable family tree of the whole cast. Couples sit side by side with
   their children directly beneath, and every branch gets its own span so lines never cross.
   Ties to a birth family elsewhere (Draupadi to Drupada, say) appear when you select someone.
   Click a circle for a one-line description; the side panel lists that person's relatives. */
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

  /* ---------- family units ----------
     A unit is one person plus the spouses who sit beside them. ATTACH puts a spouse beside a
     partner (with a marriage line); BESIDE seats someone in a unit just for placement. */
  const ATTACH = {
    devayani: "yayati", sharmishtha: "yayati", shakuntala: "dushyanta",
    ganga: "santanu", satyavati: "santanu", parashara: "satyavati",
    ambika: "vichitravirya", ambalika: "vichitravirya",
    gandhari: "dhritarashtra", kunti: "pandu", madri: "pandu", radha: "adhiratha",
    bhanumati: "duryodhana", jayadratha: "dushala",
    devika: "yudhishthira", draupadi: "yudhishthira", hidimbi: "bhima", valandhara: "bhima",
    subhadra: "arjuna", ulupi: "arjuna", chitrangada_m: "arjuna", karenumati: "nakula", vijaya: "sahadeva",
    uttara: "abhimanyu", madravati: "parikshit", kripi: "drona", sudeshna: "virata",
    devaki: "vasudeva", rohini: "vasudeva", yashoda: "nanda",
    rukmini: "krishna", satyabhama: "krishna", jambavati: "krishna",
  };
  const BESIDE = { amba: "bhishma", dasharaja: "satyavati", adhiratha: "pandu", kichaka: "sudeshna", kuntibhoja: "shurasena", akrura: "vasudeva", rukmi: "rukmini" };
  const ORDER = {
    yayati: ["devayani", "yayati", "sharmishtha"],
    santanu: ["ganga", "santanu", "satyavati", "parashara", "dasharaja"],
    vichitravirya: ["ambika", "vichitravirya", "ambalika"],
    dhritarashtra: ["gandhari", "dhritarashtra"],
    pandu: ["adhiratha", "radha", "kunti", "pandu", "madri"],
    yudhishthira: ["devika", "yudhishthira", "draupadi"],
    arjuna: ["subhadra", "arjuna", "ulupi", "chitrangada_m"],
    vasudeva: ["akrura", "rohini", "vasudeva", "devaki"],
    krishna: ["rukmi", "rukmini", "krishna", "satyabhama", "jambavati"],
    shurasena: ["kuntibhoja", "shurasena"],
  };
  // Vidura was raised as Dhritarashtra and Pandu's brother, so he sits with them
  const PRIMARY = { vidura: "vichitravirya" };
  const ROOT_ORDER = ["subala", "yayati", "ugrasena", "nanda", "shishupala", "satyaki", "kritavarma", "uddhava", "daruka",
    "prishata", "uttamaujas", "yudhamanyu", "virata", "bharadwaja", "sharadvan", "parashurama", "ekalavya",
    "jarasandha", "shalya", "bhagadatta", "susharma", "shalva", "vriddhakshatra",
    "kauravya", "hidimba", "baka", "kirmira", "jatasura", "alambusha", "takshaka", "jaratkaru"];

  const tree = people.filter(p => zone(p) === "tree");
  const ownerOf = id => { let x = id, n = 0; while ((ATTACH[x] || BESIDE[x]) && n++ < 6) x = ATTACH[x] || BESIDE[x]; return x; };
  const owners = tree.filter(p => !ATTACH[p.id] && !BESIDE[p.id]).map(p => p.id);
  const members = {};
  for (const o of owners) {
    const rest = tree.filter(p => p.id !== o && ownerOf(p.id) === o).map(p => p.id);
    const listed = ORDER[o] || [o];
    members[o] = [...listed, ...rest.filter(id => !listed.includes(id))];
    if (!members[o].includes(o)) members[o].unshift(o);
  }
  const primaryParent = p => PRIMARY[p.id] || [...p.parents, ...(p.distant || [])].find(id => byPerson[id] && zone(byPerson[id]) === "tree");
  const children = Object.fromEntries(owners.map(o => [o, []]));
  const roots = [];
  for (const o of owners) {
    const pp = primaryParent(byPerson[o]);
    if (pp) children[ownerOf(pp)].push(o); else roots.push(o);
  }
  roots.sort((a, b) => (ROOT_ORDER.indexOf(a) + 1 || 999) - (ROOT_ORDER.indexOf(b) + 1 || 999));
  // Sibling order where it matters: Puru's Kuru line on the left and Yadu's Yadavas on the right,
  // so Dhritarashtra sits near Gandhara and Pandu's family sits next to Kunti's Yadava kin.
  const CHILD_ORDER = { yayati: ["puru", "yadu"], santanu: ["vyasa", "bhishma", "chitrangada", "vichitravirya"], vichitravirya: ["dhritarashtra", "vidura", "pandu"] };
  for (const o in CHILD_ORDER) children[o].sort((a, b) => (CHILD_ORDER[o].indexOf(a) + 1 || 99) - (CHILD_ORDER[o].indexOf(b) + 1 || 99));

  /* ---------- tidy layout: each unit gets the width of its whole branch ---------- */
  const SP = 112, KGAP = 24, RGAP = 170, ROWH = 120, ROW0 = -7, ROW1 = 6, TOP = 60;
  const rowY = r => TOP + (r - ROW0) * ROWH;
  const pos = {}, W = {};
  const width = o => W[o] != null ? W[o] : (W[o] = Math.max(members[o].length * SP, children[o].reduce((a, k) => a + width(k), 0) + Math.max(0, children[o].length - 1) * KGAP));
  function place(o, x0, yOf = rowY) {
    const w = width(o), kids = children[o];
    const kw = kids.reduce((a, k) => a + width(k), 0) + Math.max(0, kids.length - 1) * KGAP;
    let kx = x0 + (w - kw) / 2;
    for (const k of kids) { place(k, kx, yOf); kx += width(k) + KGAP; }
    const m = members[o], cx = x0 + w / 2;
    // spouses sit on their partner's row; people seated BESIDE keep their own generation
    m.forEach((id, i) => { pos[id] = [cx - (m.length - 1) * SP / 2 + i * SP, yOf(ATTACH[id] ? byPerson[ownerOf(id)].row : byPerson[id].row)]; });
  }
  // The great family tree (Yayati's line, with Gandhara beside Dhritarashtra) sits on the generation rows
  const MAIN = ["subala", "yayati"];
  let x = 0;
  for (const r of roots.filter(r => MAIN.includes(r))) { place(r, x); x += width(r) + RGAP; }
  const treeW = x - RGAP;

  // Smaller, separate families are packed into labelled blocks below it
  const allIn = o => [...members[o], ...children[o].flatMap(allIn)];
  const clusterBoxes = {};
  const wrapW = Math.max(treeW, 3000), CGAP = 150;
  let cx0 = 0, cy0 = rowY(ROW1) + 260, lineH = 0;
  for (const g of GROUPS) {
    const rs = roots.filter(r => !MAIN.includes(r) && byPerson[r].group === g.id);
    if (!rs.length) continue;
    const ids = rs.flatMap(allIn), minRow = Math.min(...ids.map(i => byPerson[i].row)), maxRow = Math.max(...ids.map(i => byPerson[i].row));
    const cw = rs.reduce((a, r) => a + width(r), 0) + (rs.length - 1) * 50, chh = (maxRow - minRow) * ROWH + 150;
    if (cx0 > 0 && cx0 + cw > wrapW) { cx0 = 0; cy0 += lineH + 120; lineH = 0; }
    const top = cy0 + 70, yOf = r => top + (r - minRow) * ROWH;
    let rx = cx0;
    for (const r of rs) { place(r, rx, yOf); rx += width(r) + 50; }
    clusterBoxes[g.id] = { x: cx0, y: cy0, w: cw, h: chh };
    cx0 += cw + CGAP; lineH = Math.max(lineH, chh);
  }

  // Gods, sages and the inner stories as labelled rows below everything
  const bandTop = cy0 + lineH + 230, PER = 14, BSP = 120, bandBoxes = {};
  let by = bandTop;
  for (const b of BANDS) {
    const list = people.filter(p => p.group === b.id);
    list.forEach((p, i) => { pos[p.id] = [(i % PER) * BSP + BSP / 2, by + Math.floor(i / PER) * ROWH]; });
    bandBoxes[b.id] = { x: 0, y: by - 80, w: Math.min(list.length, PER) * BSP, h: Math.ceil(list.length / PER) * ROWH + 60 };
    by += Math.ceil(list.length / PER) * ROWH + 110;
  }
  const FULL = { x: -220, y: 0, w: Math.max(treeW, wrapW, PER * BSP) + 280, h: by };

  /* ---------- draw ---------- */
  const gLabels = el("g", {}, svg), gLinks = el("g", {}, svg), gHi = el("g", {}, svg), gNodes = el("g", {}, svg);
  for (let r = ROW0; r <= ROW1; r++) {
    if (r < -1 && r !== ROW0) continue;
    const t = el("text", { class: "rowlabel", x: -36, y: rowY(r) + 4, "text-anchor": "end" }, gLabels);
    t.textContent = r < 0 ? "ancestors" : r === 0 ? "Shantanu’s generation" : `generation ${r}`;
  }
  for (const b of BANDS) { const t = el("text", { class: "glabel", x: 0, y: bandBoxes[b.id].y + 20, fill: color(b.id) }, gLabels); t.textContent = b.label; }
  for (const gid in clusterBoxes) { const b = clusterBoxes[gid], t = el("text", { class: "glabel", x: b.x, y: b.y + 20, fill: color(gid) }, gLabels); t.textContent = LABEL[gid] + (gid === "yadava" ? ", beyond Krishna’s own line" : ""); }

  const isSpouse = (a, b) => byPerson[a].spouses.includes(b) || byPerson[b].spouses.includes(a);
  for (const o of owners) {
    const m = members[o];
    // marriage lines inside the unit: straight between neighbours, a low arc when someone sits between
    for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) {
      if (!isSpouse(m[i], m[j])) continue;
      const [x1, y1] = pos[m[i]], [x2, y2] = pos[m[j]];
      const d = j - i === 1 && y1 === y2 ? `M${x1},${y1} L${x2},${y2}` : `M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 26 * (j - i - 1) - 14} ${x2},${y2}`;
      el("path", { class: "flink marriage", d }, gLinks);
    }
    // each child hangs from the midpoint of its parents within the unit
    for (const k of children[o]) {
      const kp = byPerson[k], ps = [...kp.parents, ...(kp.distant || [])].filter(id => m.includes(id));
      const xs = ps.length ? ps.map(id => pos[id][0]) : [pos[o][0]];
      const ax = xs.reduce((a, b) => a + b, 0) / xs.length, ay = ps.length ? Math.max(...ps.map(id => pos[id][1])) : pos[o][1];
      const [cx, cy] = pos[k], bus = cy - ROWH * 0.42;
      const distant = (kp.distant || []).some(id => m.includes(id));
      el("path", { class: "flink" + (distant ? " distant" : ""), d: `M${ax},${ay} V${bus} H${cx} V${cy}` }, gLinks);
    }
  }
  if (pos.amba && pos.shikhandi) { /* Amba's rebirth shows on selection, not as a base line */ }

  // Nodes with one- or two-line labels beneath
  const nodes = {};
  for (const p of people) {
    const [nx, ny] = pos[p.id];
    const g = el("g", { class: "pnode", tabindex: 0, role: "button", "aria-label": `${p.name}: ${p.line}` }, gNodes);
    const c = el("circle", { cx: nx, cy: ny, r: 8, fill: color(p.group) }, g);
    const words = p.name.split(" "), cut = Math.ceil(words.length / 2);
    const lines = p.name.length > 12 && words.length > 1 ? [words.slice(0, cut).join(" "), words.slice(cut).join(" ")] : [p.name];
    const t = el("text", { "text-anchor": "middle", x: nx }, g);
    const spans = lines.map(l => { const s = el("tspan", { x: nx }, t); s.textContent = l; return s; });
    g.addEventListener("click", e => { if (dragMoved) return; e.stopPropagation(); select(p.id, { fly: false }); });
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(p.id, { fly: true }); } });
    nodes[p.id] = { g, c, spans, x: nx, y: ny };
  }

  /* ---------- camera ---------- */
  let vb = { ...FULL }, u = 1, anim = 0;
  function fitAspect(b) {
    const ar = (stage.clientWidth || 1) / (stage.clientHeight || 1); b = { ...b };
    if (b.w / b.h < ar) { const nw = b.h * ar; b.x -= (nw - b.w) / 2; b.w = nw; } else { const nh = b.w / ar; b.y -= (nh - b.h) / 2; b.h = nh; }
    return b;
  }
  function apply() {
    svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    u = Math.max(vb.w / (stage.clientWidth || 1), vb.h / (stage.clientHeight || 1));
    svg.style.setProperty("--u", u);
    const r = Math.min(8 * u, SP * 0.28), showAll = u < 1.4;
    for (const id in nodes) {
      const n = nodes[id];
      n.c.setAttribute("r", r);
      n.spans.forEach((s, i) => s.setAttribute("y", n.y + r + 14 * u + i * 13.5 * u));
      n.g.classList.toggle("lab-off", !showAll);
    }
    placePop();
  }
  function setVB(b) { cancelAnimationFrame(anim); vb = { ...b }; apply(); }
  function fly(b) {
    b = fitAspect(b);
    cancelAnimationFrame(anim);
    if (MB.reduce) return setVB(b);
    const s = { ...vb }, t0 = performance.now(), D = 800, ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const step = now => { const k = Math.min(1, (now - t0) / D), e = ease(k); vb = { x: s.x + (b.x - s.x) * e, y: s.y + (b.y - s.y) * e, w: s.w + (b.w - s.w) * e, h: s.h + (b.h - s.h) * e }; apply(); if (k < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  }
  function zoomAt(px, py, f) {
    const nw = Math.min(FULL.w * 1.5, Math.max(360, vb.w * f)), k = nw / vb.w;
    const mx = vb.x + px * u, my = vb.y + py * u;
    setVB({ x: mx - (mx - vb.x) * k, y: my - (my - vb.y) * k, w: vb.w * k, h: vb.h * k });
  }
  const boxAround = (ids, padX = 150, padY = 110, minW = 760, minH = 460) => {
    let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    ids.forEach(i => { a = Math.min(a, pos[i][0]); b = Math.max(b, pos[i][0]); c = Math.min(c, pos[i][1]); d = Math.max(d, pos[i][1]); });
    const w = Math.max(b - a + padX * 2, minW), h = Math.max(d - c + padY * 2, minH);
    return { x: (a + b) / 2 - w / 2, y: (c + d) / 2 - h / 2, w, h };
  };

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
      if (!dragMoved && Math.hypot(dx, dy) < 2) return;
      dragMoved = true;
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
    const p = byPerson[id], known = q => !!byPerson[q];
    const parents = [...p.parents, ...(p.distant || [])].filter(known);
    const divine = (p.divine || []).filter(known);
    const kids = people.filter(q => q.parents.includes(id) || (q.distant || []).includes(id) || (q.divine || []).includes(id)).map(q => q.id);
    const spouses = [...new Set([...p.spouses, ...people.filter(q => q.spouses.includes(id)).map(q => q.id)])].filter(known);
    const sib = new Set((p.siblings || []).filter(known));
    people.forEach(q => { if (q.id !== id && p.parents.length && q.parents.some(z => p.parents.includes(z))) sib.add(q.id); if ((q.siblings || []).includes(id)) sib.add(q.id); });
    const rebirth = [p.rebirth, ...people.filter(q => q.rebirth === id).map(q => q.id)].filter(known);
    return { parents, divine, children: kids, spouses, siblings: [...sib], rebirth };
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
      const bend = Math.min(160, Math.abs(ox - sx) * 0.12 + 30);
      el("path", { class: "hlink " + cls, d: `M${sx},${sy} Q${(sx + ox) / 2},${Math.min(sy, oy) - bend} ${ox},${oy}` }, gHi);
    };
    R.parents.forEach(o => link(o, "")); R.children.forEach(o => link(o, "")); R.siblings.forEach(o => link(o, ""));
    R.spouses.forEach(o => link(o, "spouse")); R.divine.forEach(o => link(o, "divine")); R.rebirth.forEach(o => link(o, "divine"));
    MB.setHash(id);
    showPanel(p, R);
    if (doFly) {
      const ids = [id, ...R.parents, ...R.children, ...R.spouses, ...R.siblings].filter(q => zone(byPerson[q]) === zone(p));
      fly(boxAround(ids));
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
    const [px0, py0] = pos[sel], Wd = stage.clientWidth, Hd = stage.clientHeight;
    let px = (px0 - vb.x) / u + 18, py = (py0 - vb.y) / u - 20;
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    if (px + pw > Wd - 8) px = (px0 - vb.x) / u - pw - 18;
    if (py + ph > Hd - 8) py = Hd - ph - 8;
    pop.style.left = Math.max(8, px) + "px"; pop.style.top = Math.max(8, py) + "px";
  }
  const chip = id => `<button class="chip" data-p="${id}"><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${color(byPerson[id].group)};margin-right:.35rem"></i>${byPerson[id].name}</button>`;
  const section = (title, ids) => ids.length ? `<h3>${title}</h3><div class="chips">${ids.map(chip).join("")}</div>` : "";
  function wire() { detail.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => select(b.dataset.p, { fly: true }))); }
  function showPanel(p, R) {
    const inLifelines = MB.byChar && MB.byChar[p.id];
    const gen = zone(p) === "tree" ? ` · ${p.row < 0 ? "an ancestor" : p.row === 0 ? "Shantanu’s generation" : "generation " + p.row}` : "";
    detail.innerHTML = `<p class="count"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color(p.group)};margin-right:.35rem"></span>${LABEL[p.group]}${gen}</p>
      <h2>${p.name}</h2><p>${p.line}</p>
      ${section("Parents", R.parents.filter(q => !(p.distant || []).includes(q)))}
      ${section("Descended from", (p.distant || []).filter(q => byPerson[q]))}
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
    detail.innerHTML = `<p class="count">${people.length} people</p><h2>Everyone with a part to play</h2>
      <p>The whole cast, from Yayati, ancestor of both the Kurus and the Yadavas, down to Janamejaya, at whose snake sacrifice the story is first told. Couples sit side by side with their children beneath; colors mark each family, and generations run down the page. Gods, sages and the characters of the epic’s inner stories sit below the tree.</p>
      <p>Click any circle for a one-line summary; their relatives light up, including family on other branches. Pick a group to fly to it:</p>
      <div class="glegend">${[...GROUPS, ...BANDS].map(g => `<button class="chip" data-g="${g.id}"><i style="background:${color(g.id)}"></i>${g.label}</button>`).join("")}</div>
      <p class="caveat">The epic names thousands of people, many only once in lists of kings and warriors. This tree includes everyone with a part in the story; Gandhari’s hundred sons appear as one circle apart from those with their own roles. Dotted lines skip unnamed generations. Family details differ between versions; these follow the broad Sanskrit tradition.</p>`;
    detail.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => focusGroup(b.dataset.g)));
  }
  function focusGroup(gid) {
    select(null);
    svg.classList.add("focus");
    const ids = people.filter(p => p.group === gid).map(p => p.id);
    ids.forEach(i => nodes[i].g.classList.add("rel"));
    fly(boxAround(ids, 120, 90));
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

  // Open on Pandu's family, zoomed in far enough for names to show
  intro();
  {
    const cx = (pos.yudhishthira[0] + pos.sahadeva[0]) / 2, cy = (pos.pandu[1] + pos.parikshit[1]) / 2 + 20;
    const w = (stage.clientWidth || 800) * 1.15, hgt = (stage.clientHeight || 600) * 1.15;
    setVB(fitAspect({ x: cx - w / 2, y: cy - hgt / 2, w, h: hgt }));
  }
  const h0 = decodeURIComponent(location.hash.slice(1));
  if (byPerson[h0]) select(h0, { fly: true });
})();
