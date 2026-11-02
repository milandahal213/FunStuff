/* Shared helpers: motion preference, embed mode, story-time wording and deep links. */
(function () {
  const MB = window.MB = window.MB || {};
  MB.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Inside an iframe, or with ?embed in the URL, hide the site navigation so the view fills its frame
  MB.embed = window.self !== window.top || /[?&]embed\b/.test(location.search);
  if (MB.embed) document.documentElement.classList.add("embed");

  MB.sideName = { pandava: "Pandavas and allies", kaurava: "Kauravas and allies", kuru: "Kuru house", neutral: "Neither side" };

  // Story time in words. Year 0 is the game of dice; war days are counted from 1.
  MB.whenText = t => {
    if (t >= MB.WAR0 - 0.5 / 365 && t <= MB.W(18.99)) {
      const d = Math.floor((t - MB.WAR0) * 365 + 1e-6) + 1, night = (t - MB.W(d)) * 365 > 0.3;
      return `day ${d} of the war${night ? ", at night" : ""}`;
    }
    const y = Math.round(t);
    if (Math.abs(t) < 0.5) return "the year of the dice game";
    return y < 0 ? `about ${-y} year${y === -1 ? "" : "s"} before the dice game` : `about ${y} year${y === 1 ? "" : "s"} after the dice game`;
  };
  MB.ageAt = (c, t) => c.born <= t && (c.died == null || c.died >= t) ? Math.round(t - c.born) : null;
  MB.alive = (c, t) => c.born <= t && (c.died == null || c.died > t);

  // Deep links like #chapter-5 (1-based) or #lac (by id)
  MB.chapterFromHash = (list, fallback = 0) => {
    const h = decodeURIComponent(location.hash.slice(1));
    const m = h.match(/^chapter-(\d+)$/);
    if (m) return Math.max(0, Math.min(list.length - 1, +m[1] - 1));
    const i = list.findIndex(c => c.id === h);
    return i >= 0 ? i : fallback;
  };
  MB.setHash = h => { try { history.replaceState(null, "", "#" + h); } catch (e) { /* sandboxed frames */ } };
  MB.names = ids => ids.map(id => MB.byChar[id] ? MB.byChar[id].name : id);
  MB.list = arr => arr.length <= 1 ? (arr[0] || "") : arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1];
})();
