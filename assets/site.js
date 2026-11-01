/* Lots site: small progressive enhancements. The page is complete without this file. */
(() => {
  const d = document, root = d.documentElement;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("js");
  if (!calm) root.classList.add("motion");
  const $$ = (s, r = d) => [...r.querySelectorAll(s)];

  // Scroll reveal (only when motion is welcome).
  if (!calm && "IntersectionObserver" in window) {
    const sel = ".section-head, .tile, .steps li:not(.keep-still), .panel, details, .gallery figure, .promise li, .article h2, .press-grid > *";
    const skip = (el) => el.closest(".how");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(sel).filter((el) => !skip(el)).forEach((el) => {
      const i = Math.min([...el.parentElement.children].indexOf(el), 6);
      el.style.setProperty("--i", i);
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  // Sticky "how it works": the phone follows the step in view.
  const how = d.querySelector(".how");
  if ("IntersectionObserver" in window && how) {
    const steps = $$(".steps li", how), shots = $$(".how-phone img", how);
    const set = (i) => { steps.forEach((s, j) => s.classList.toggle("active", j === i)); shots.forEach((im, j) => im.classList.toggle("on", j === i)); };
    set(0);
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) set(steps.indexOf(e.target)); }), { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach((s) => io.observe(s));
  }

  // Gentle parallax on the hero art, and pause its loops when out of sight or the tab is hidden.
  const art = d.querySelector(".hero-art");
  if (art) {
    if (!calm) {
      const layers = $$("[data-plx]", art);
      let tick = false;
      const move = () => { tick = false; const y = Math.min(scrollY, 900); layers.forEach((l) => l.style.setProperty("--py", (y * parseFloat(l.dataset.plx)).toFixed(1))); };
      addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(move); } }, { passive: true });
    }
    if ("IntersectionObserver" in window) new IntersectionObserver((es) => art.classList.toggle("off", !es[0].isIntersecting)).observe(art);
  }
  d.addEventListener("visibilitychange", () => root.classList.toggle("paused", d.hidden));
})();
