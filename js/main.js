/* Nav hide-on-scroll-down / show-on-scroll-up. */
(function () {
  document.documentElement.classList.remove("no-js");

  const nav = document.querySelector(".nav");
  if (!nav) return;

  let lastY = window.scrollY;
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y > 120 && y > lastY + 4) nav.classList.add("is-hidden");
      else if (y < lastY - 4) nav.classList.remove("is-hidden");
      lastY = y;
      ticking = false;
    });
  }, { passive: true });
})();
