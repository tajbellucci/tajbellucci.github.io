/* GitHub-style contribution heatmap — REAL data for tajbellucci.
   Source: github-contributions-api.jogruber.de/v4/tajbellucci (fetched 2026-07-09).
   Update REAL_CONTRIBUTIONS below periodically; no live network call (keeps the
   page working offline / without hitting rate limits on every visitor). */
(function () {
  const graph = document.getElementById("contrib-graph");
  const totalEl = document.getElementById("contrib-total");
  if (!graph) return;

  const REAL_CONTRIBUTIONS = {
    "2026-01-17": 3,
    "2026-06-27": 5,
    "2026-06-28": 1,
    "2026-07-04": 1,
    "2026-07-06": 4,
    "2026-07-07": 1,
    "2026-07-09": 7,
  };
  const REAL_TOTAL = 22;

  function levelFor(count) {
    if (!count) return 0;
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  }

  // build a 53-week grid ending on the most recent Saturday on/after the last data date
  const lastDate = new Date("2026-07-09T00:00:00Z");
  const endDow = lastDate.getUTCDay(); // 0=Sun..6=Sat
  const end = new Date(lastDate);
  end.setUTCDate(end.getUTCDate() + (6 - endDow)); // push to Saturday
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (53 * 7 - 1));

  const frag = document.createDocumentFragment();
  let cellIndex = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    const col = document.createElement("div");
    col.className = "contrib-col";
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      const count = REAL_CONTRIBUTIONS[iso] || 0;
      const lvl = levelFor(count);
      const cell = document.createElement("i");
      cell.className = "cell lv" + lvl;
      cell.style.setProperty("--i", cellIndex++);
      cell.title = `${count} contribution${count === 1 ? "" : "s"} on ${iso}`;
      col.appendChild(cell);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    frag.appendChild(col);
  }
  graph.appendChild(frag);

  if (totalEl) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finalStr = REAL_TOTAL.toLocaleString();
    if (reduced || typeof IntersectionObserver === "undefined") {
      totalEl.textContent = finalStr;
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          const start = performance.now();
          const dur = 900;
          (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            totalEl.textContent = Math.round(REAL_TOTAL * eased).toLocaleString();
            if (p < 1) requestAnimationFrame(tick);
          })(start);
        });
      }, { threshold: 0.3 });
      io.observe(totalEl);
    }
  }
})();
