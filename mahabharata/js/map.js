/* Living map: each chapter flies to its region and draws the journeys made in it. */
(function () {
  const { geo, places: P, chapters: PH } = MB;
  const svg = document.getElementById("map");
  const layers = geo.drawBase(svg);
  const mk = geo.markers(layers.places, id => showPlace(id));
  const cam = geo.camera(svg, u => mk.scale(u));
  const panel = document.getElementById("panel"), list = document.getElementById("phases");
  let cur = 0;
  // Degrees of extra space at the bottom so places clear the legend box
  const legendRoom = () => { const lg = document.querySelector(".mapwrap .legend"); return lg ? 2.2 * (lg.offsetHeight + 16) / Math.max(200, svg.clientHeight) * 6 : 0; };

  PH.forEach((ph, i) => {
    const li = document.createElement("li"), b = document.createElement("button");
    b.innerHTML = `<span class="n">${i + 1}</span><span class="t">${ph.short}</span><span class="d">${ph.span}</span>`;
    b.addEventListener("click", () => { stop(); go(i); });
    li.appendChild(b); list.appendChild(li);
  });

  function go(i, { fly = true } = {}) {
    cur = (i + PH.length) % PH.length;
    const ph = PH[cur];
    MB.setHash("chapter-" + (cur + 1));
    list.querySelectorAll("button").forEach((b, j) => {
      if (j === cur) { b.setAttribute("aria-current", "step"); b.scrollIntoView({ block: "nearest", inline: "nearest", behavior: MB.reduce ? "auto" : "smooth" }); }
      else b.removeAttribute("aria-current");
    });
    mk.sides(id => geo.sideOf(ph, id));
    const { rows, total } = geo.drawLegs(layers.legs, ph.legs);
    const ids = geo.chapterPlaces(ph);
    const short = p => p.name.replace(/ \(.*\)/, "");
    panel.innerHTML = `
      <p class="count">Chapter ${cur + 1} of ${PH.length}</p>
      <h2>${ph.title}</h2>
      <span class="span">${ph.span}</span>
      <p class="story-text">${ph.text}</p>
      <h3>Journeys in this chapter</h3>
      <ul class="legs">${rows.map(r => `<li><span class="sw" style="background:var(--${r.side})"></span><span><b>${short(r.from)} to ${short(r.to)}</b><br>${r.who}</span><span class="km">≈ ${geo.fmt(r.km)} km</span></li>`).join("")}</ul>
      <p class="total">About ${geo.fmt(total)} km in straight lines. Real routes on foot, by chariot or along rivers would have been longer.</p>
      <h3>Places</h3>
      <div class="chips">${ids.map(id => `<button class="chip" data-id="${id}" aria-pressed="false">${P[id].name}</button>`).join("")}</div>
      <div id="placecard"><p class="hint">Select a place, here or on the map, to see where it is today.</p></div>
      <p class="caveat">Where people were is a matter of tradition, not excavation, and versions of the epic differ. <a href="story.html#chapter-${cur + 1}">Read this chapter in the story view</a> · <a href="lifelines.html">See who was alive when</a></p>`;
    panel.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => showPlace(c.dataset.id)));
    panel.scrollTop = 0;
    mk.select(null);
    const box = geo.fitPlaces(svg, ids, 1.3, legendRoom());
    fly ? cam.fly(box) : cam.set(box);
  }

  function showPlace(id) {
    const p = P[id];
    mk.select(id);
    panel.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.id === id ? "true" : "false"));
    const side = geo.sideOf(PH[cur], id) || "dim";
    const card = document.getElementById("placecard");
    if (card) card.innerHTML = `<div class="card-place" style="border-color:var(--${side})"><h4>${p.name}</h4><p class="modern">Today: ${p.modern}</p><p>${p.role}</p></div>`;
  }

  let timer = null;
  const playBtn = document.getElementById("play");
  function stop() { clearInterval(timer); timer = null; playBtn.textContent = "Play the story"; }
  playBtn.addEventListener("click", () => {
    if (timer) { stop(); return; }
    playBtn.textContent = "Pause";
    if (cur === PH.length - 1) go(0);
    timer = setInterval(() => { if (cur === PH.length - 1) { stop(); return; } go(cur + 1); }, 9000);
  });
  document.getElementById("prev").addEventListener("click", () => { stop(); go(cur - 1); });
  document.getElementById("next").addEventListener("click", () => { stop(); go(cur + 1); });
  document.addEventListener("keydown", e => {
    if (e.target.closest && e.target.closest("input,textarea")) return;
    if (e.key === "ArrowRight") { stop(); go(cur + 1); }
    if (e.key === "ArrowLeft") { stop(); go(cur - 1); }
  });
  window.addEventListener("hashchange", () => { const i = MB.chapterFromHash(PH, cur); if (i !== cur) { stop(); go(i); } });
  window.addEventListener("resize", () => cam.set(geo.fitPlaces(svg, geo.chapterPlaces(PH[cur]), 1.3, legendRoom())));

  // Open on the whole subcontinent, then fly to the requested chapter
  requestAnimationFrame(() => { cam.set(cam.full()); setTimeout(() => go(MB.chapterFromHash(PH, 0)), 300); });
})();
