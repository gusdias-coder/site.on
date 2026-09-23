/* Site.on: progressive enhancement. Content and contact links work without JS. */
(function () {
  "use strict";
  const root = document.documentElement;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 1041px)");
  const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const header = document.getElementById("siteHeader");
  const menu = document.getElementById("mobileMenu");
  const burger = document.getElementById("burger");
  const closeButton = document.getElementById("menuClose");
  const overlay = document.getElementById("menuOverlay");
  const main = document.querySelector("main");
  const footer = document.querySelector("footer");
  let menuOpen = false;
  let returnFocus = null;

  function setTheme(theme, persist) {
    root.dataset.theme = theme;
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.setAttribute("aria-label", theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro");
    });
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#090a10" : "#f6f7fb";
    if (persist) { try { localStorage.setItem("siteon-theme", theme); } catch (_) { /* Optional storage. */ } }
  }
  setTheme(root.dataset.theme === "light" ? "light" : "dark", false);
  document.querySelectorAll("[data-theme-toggle]").forEach(button => {
    button.hidden = false;
    button.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark", true));
  });

  function setMenu(open, restore = true) {
    if (!menu || !burger || open === menuOpen) return;
    menuOpen = open;
    if (open) returnFocus = document.activeElement;
    menu.hidden = !open;
    menu.inert = !open;
    menu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-open", open);
    [header, main, footer].forEach(element => { if (element) element.inert = open; });
    if (open) closeButton.focus();
    else if (restore && returnFocus instanceof HTMLElement) returnFocus.focus({ preventScroll: true });
  }
  if (burger && menu) {
    burger.hidden = false;
    menu.inert = true;
    burger.addEventListener("click", () => setMenu(!menuOpen));
    closeButton.addEventListener("click", () => setMenu(false));
    overlay.addEventListener("click", () => setMenu(false));
    menu.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      setMenu(false, false);
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    }));
    document.addEventListener("keydown", event => {
      if (!menuOpen) return;
      if (event.key === "Escape") { event.preventDefault(); setMenu(false); return; }
      if (event.key !== "Tab") return;
      const items = [...menu.querySelectorAll('a[href], button:not([disabled])')].filter(el => !el.hidden && el.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    desktop.addEventListener("change", event => {
      if (event.matches && menuOpen) { setMenu(false, false); header.querySelector(".brand").focus(); }
    });
  }

  /* Keep the header available on scroll and when navigating by keyboard. */
  let scrollFrame = 0;
  const spyLinks = [...document.querySelectorAll('.nav-links a, .mm-links a')];
  const sections = [...document.querySelectorAll("main section[id]")];
  function updateScroll() {
    scrollFrame = 0;
    header.classList.toggle("scrolled", window.scrollY > 12);
    let id = "inicio";
    sections.forEach(section => { if (section.getBoundingClientRect().top <= 180) id = section.id; });
    spyLinks.forEach(link => {
      const active = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
    });
  }
  document.addEventListener("scroll", () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
  updateScroll();

  const stack = document.querySelector(".project-stack");
  let stackFrame = 0;
  function resetStack() {
    if (!stack) return;
    stack.style.removeProperty("--stack-rx");
    stack.style.removeProperty("--stack-ry");
  }
  if (stack) {
    if (!motion.matches) {
      stack.classList.add("stack-enter");
      setTimeout(() => stack.classList.remove("stack-enter"), 1250);
    }
    stack.addEventListener("pointermove", event => {
      if (motion.matches || !pointer.matches || !desktop.matches || stackFrame || stack.contains(document.activeElement)) return;
      stackFrame = requestAnimationFrame(() => {
        stackFrame = 0;
        if (motion.matches) return;
        const bounds = stack.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
        stack.style.setProperty("--stack-rx", `${-y * 1.5}deg`);
        stack.style.setProperty("--stack-ry", `${x * 2}deg`);
      });
    });
    stack.addEventListener("pointerleave", resetStack);
    stack.addEventListener("focusin", resetStack);
    motion.addEventListener("change", () => { resetStack(); stack.classList.remove("stack-enter"); });
    desktop.addEventListener("change", resetStack);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!motion.matches) {
          entry.target.classList.add("enter-view");
          entry.target.addEventListener("animationend", () => entry.target.classList.remove("enter-view"), { once: true });
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: .05 });
    document.querySelectorAll(".case-card, .value-grid article, .process-grid li").forEach(element => observer.observe(element));
  }
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
