(() => {
  "use strict";

  const root = document.documentElement;
  const themeButton = document.querySelector(".theme-toggle");
  const themeIcon = themeButton ? themeButton.querySelector("span") : null;
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    const selected = theme === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", selected);
    if (themeButton) {
      const nextTheme = selected === "light" ? "dark" : "light";
      themeButton.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
      themeButton.setAttribute("title", `Switch to ${nextTheme} theme`);
    }
    if (themeIcon) themeIcon.textContent = selected === "light" ? "☾" : "☼";
    if (themeMeta) themeMeta.setAttribute("content", selected === "light" ? "#eee8dc" : "#0b1115");
  }

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("jaman-portfolio-theme"); } catch (_) {}
  applyTheme(savedTheme || root.getAttribute("data-theme") || "light");

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem("jaman-portfolio-theme", next); } catch (_) {}
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const header = document.querySelector("header");
  let ticking = false;
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-floating", window.scrollY > 44);
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
  updateHeader();

  // Subtle animated network background in the hero.
  const canvas = document.getElementById("network");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0, height = 0, points = [], raf = 0;
    const spacing = 125;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      points = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          points.push({
            x: x * spacing + (Math.random() - .5) * 55,
            y: y * spacing + (Math.random() - .5) * 55,
            vx: (Math.random() - .5) * .12,
            vy: (Math.random() - .5) * .12
          });
        }
      }
      draw(0);
    }

    function draw(time) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const light = root.getAttribute("data-theme") === "light";
      const lineColor = light ? "139,106,66" : "105,223,195";
      const dotColor = light ? "139,106,66" : "105,223,195";
      const maxDist = 175;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (!reducedMotion) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -30 || p.x > width + 30) p.vx *= -1;
          if (p.y < -30 || p.y > height + 30) p.vy *= -1;
        }
        for (let j = i + 1; j < points.length; j++) {
          const q = points[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.strokeStyle = `rgba(${lineColor},${(1 - dist / maxDist) * (light ? .12 : .17)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${dotColor},${light ? .22 : .34})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      if (!reducedMotion) raf = window.requestAnimationFrame(draw);
    }

    resizeCanvas();
    window.addEventListener("resize", () => {
      window.cancelAnimationFrame(raf);
      resizeCanvas();
      if (!reducedMotion) raf = window.requestAnimationFrame(draw);
    }, { passive: true });
    if (!reducedMotion) raf = window.requestAnimationFrame(draw);
  }

  // Custom cursor ring, enabled only for fine-pointer devices by CSS.
  const cursor = document.querySelector(".cursor-ring");
  if (cursor) {
    window.addEventListener("pointermove", event => {
      cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      cursor.classList.add("is-visible");
    }, { passive: true });
    window.addEventListener("pointerdown", () => cursor.classList.add("is-pressed"));
    window.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));
    document.querySelectorAll("a, button, summary").forEach(el => {
      el.addEventListener("pointerenter", () => cursor.classList.add("is-hovering"));
      el.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering"));
    });
    document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
  }
})();