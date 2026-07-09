/* GSAP orchestration: load sequence, scroll reveals, stat counters.
   All motion gated behind prefers-reduced-motion. */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || typeof gsap === "undefined") {
    document.documentElement.classList.add("reduced-motion");
    document.querySelectorAll(".stat-num [data-count]").forEach((el) => {
      el.textContent = el.dataset.count;
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---- hero load sequence ---- */
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".hero-title .line > span", {
      yPercent: 110,
      duration: 1.05,
      stagger: 0.09,
    })
    .from(".hero-kicker", { opacity: 0, x: -18, duration: 0.7 }, "-=0.75")
    .from(".hero-sub, .hero-role", { opacity: 0, y: 16, duration: 0.7, stagger: 0.1 }, "-=0.6")
    .from(".hero-ctas .btn", { opacity: 0, y: 14, duration: 0.55, stagger: 0.08 }, "-=0.45")
    .from(".hero-portrait", { opacity: 0, y: 34, scale: 0.97, duration: 1.1, ease: "power2.out" }, "-=1.0")
    .from(".portrait-badge", { opacity: 0, x: -14, duration: 0.6 }, "-=0.5")
    .from(".scroll-hint", { opacity: 0, duration: 0.8 }, "-=0.3")
    .from(".nav", { yPercent: -100, duration: 0.7 }, 0.15);

  /* ---- portrait parallax ---- */
  gsap.to(".hero-portrait", {
    yPercent: 9,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
  });

  /* ---- generic scroll reveals ---- */
  document.querySelectorAll(".gs-reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      delay: (parseInt(el.dataset.delay || "0", 10)) / 1000,
      scrollTrigger: { trigger: el, start: "top 86%", once: true },
    });
  });

  /* ---- stat counters ---- */
  document.querySelectorAll(".stat-num [data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      onUpdate() { el.textContent = Math.round(obj.v); },
    });
  });

  /* ---- section titles: soft clip reveal ---- */
  document.querySelectorAll(".section-title").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });
})();
