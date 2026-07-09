/* GitHub-style contribution heatmap — decorative "maximum activity" grid.
   53 weeks x 7 days, weighted toward high levels so the board reads full and busy.
   No network calls; purely visual. Swap generateLevel() for real data later. */
(function () {
  const graph = document.getElementById("contrib-graph");
  const totalEl = document.getElementById("contrib-total");
  if (!graph) return;

  const WEEKS = 53;
  const DAYS = 7;

  // Weighted RNG: mostly levels 3–4 ("maximum contributions" look),
  // occasional dips so it feels organic rather than a solid block.
  function generateLevel() {
    const r = Math.random();
    if (r < 0.04) return 0;
    if (r < 0.14) return 1;
    if (r < 0.34) return 2;
    if (r < 0.66) return 3;
    return 4;
  }

  // rough contribution counts per level, for the headline total
  const perLevel = [0, 2, 5, 9, 14];
  let total = 0;
  const frag = document.createDocumentFragment();

  for (let w = 0; w < WEEKS; w++) {
    const col = document.createElement("div");
    col.className = "contrib-col";
    for (let d = 0; d < DAYS; d++) {
      const lvl = generateLevel();
      total += perLevel[lvl] + Math.floor(Math.random() * 4);
      const cell = document.createElement("i");
      cell.className = "cell lv" + lvl;
      cell.style.setProperty("--i", w * DAYS + d);
      col.appendChild(cell);
    }
    frag.appendChild(col);
  }
  graph.appendChild(frag);

  // count up the headline number when it scrolls into view
  if (totalEl) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finalStr = total.toLocaleString() + "+";
    if (reduced || typeof IntersectionObserver === "undefined") {
      totalEl.textContent = finalStr;
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          const start = performance.now();
          const dur = 1400;
          (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            totalEl.textContent = Math.round(total * eased).toLocaleString() + (p === 1 ? "+" : "");
            if (p < 1) requestAnimationFrame(tick);
          })(start);
        });
      }, { threshold: 0.3 });
      io.observe(totalEl);
    }
  }
})();
