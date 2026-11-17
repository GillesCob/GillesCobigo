/* Cours de guitare Philippe André, maquette P2 : thème, menu plein écran, dépliants exclusifs,
   apparition au défilement, mur de témoignages, formulaire mailto.
   Aucun cookie, aucun script tiers. Le stockage local est enveloppé dans try/catch. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Thème : bascule manuelle persistée, prioritaire sur la préférence système
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) { return t === "dark"; }
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
  var themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) {
    themeBtn.setAttribute("aria-pressed", isDark() ? "true" : "false");
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("pa2-theme", next); } catch (e) { /* stockage indisponible */ }
      themeBtn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
    });
  }

  // Menu plein écran
  var header = document.querySelector(".site-header");
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  function setMenu(open) {
    if (!header || !menuBtn) { return; }
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") !== "true";
      if (open) { closePalette(false); }
      setMenu(open);
      if (open) { var f = nav.querySelector("a"); if (f) { f.focus(); } }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuBtn.focus();
      }
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) { setMenu(false); }
    });
  }

  // ===== SÉLECTEUR DE PALETTE =====
  // Clé commune pa-palette (partagée avec la proposition P1). Le script inline du <head> applique la palette avant le premier rendu.
  var PALETTES = {
    origine: { name: "Couleurs d'origine", theme: "#9e253f" },
    ocean: { name: "Océan", theme: "#1f60bd" },
    sauge: { name: "Sauge", theme: "#317247" },
    prune: { name: "Prune", theme: "#9139a2" },
    ambre: { name: "Ambre", theme: "#ab4907" },
    graphite: { name: "Graphite", theme: "#566171" }
  };
  var palBtn = document.querySelector(".palette-btn");
  var palPop = document.getElementById("palette-pop");
  var palOpts = palPop ? Array.prototype.slice.call(palPop.querySelectorAll(".pal-opt")) : [];
  var palReset = palPop ? palPop.querySelector(".pal-reset") : null;
  function currentPalette() {
    var p = root.getAttribute("data-palette");
    return PALETTES[p] ? p : "origine";
  }
  function paintPalette() {
    var cur = currentPalette();
    palOpts.forEach(function (o) {
      var on = o.getAttribute("data-palette-id") === cur;
      o.setAttribute("aria-checked", on ? "true" : "false");
      o.tabIndex = on ? 0 : -1;
    });
    if (palReset) { palReset.disabled = cur === "origine"; }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute("content", PALETTES[cur].theme); }
  }
  function setPalette(id) {
    if (!PALETTES[id]) { id = "origine"; }
    root.setAttribute("data-palette", id);
    try {
      if (id === "origine") { localStorage.removeItem("pa-palette"); } else { localStorage.setItem("pa-palette", id); }
    } catch (e) { /* stockage indisponible */ }
    paintPalette();
  }
  function closePalette(focusBack) {
    if (!palBtn || !palPop || palPop.hidden) { return; }
    palPop.hidden = true;
    palBtn.setAttribute("aria-expanded", "false");
    if (focusBack) { palBtn.focus(); }
  }
  function openPalette() {
    setMenu(false);
    palPop.hidden = false;
    palBtn.setAttribute("aria-expanded", "true");
    var sel = palPop.querySelector('.pal-opt[aria-checked="true"]') || palOpts[0];
    if (sel) { sel.focus(); }
  }
  if (palBtn && palPop) {
    paintPalette();
    palBtn.addEventListener("click", function () {
      if (palPop.hidden) { openPalette(); } else { closePalette(false); }
    });
    palOpts.forEach(function (o, i) {
      o.addEventListener("click", function () { setPalette(o.getAttribute("data-palette-id")); });
      o.addEventListener("keydown", function (e) {
        var step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : (e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0);
        if (!step) { return; }
        e.preventDefault();
        var n = palOpts[(i + step + palOpts.length) % palOpts.length];
        n.focus();
        setPalette(n.getAttribute("data-palette-id"));
      });
    });
    if (palReset) { palReset.addEventListener("click", function () { setPalette("origine"); var s = palPop.querySelector('.pal-opt[aria-checked="true"]'); if (s) { s.focus(); } }); }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !palPop.hidden) { closePalette(true); }
    });
    document.addEventListener("click", function (e) {
      if (palPop.hidden) { return; }
      if (palPop.contains(e.target) || palBtn.contains(e.target)) { return; }
      closePalette(false);
    });
  }

  // Un seul dépliant ouvert à la fois sur la page (repli de l'attribut name)
  var details = Array.prototype.slice.call(document.querySelectorAll("details.disclosure"));
  details.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) { return; }
      details.forEach(function (o) { if (o !== d) { o.open = false; } });
    });
  });

  // Apparition au défilement
  var items = document.querySelectorAll(".reveal, .wipe");
  if (reduce || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(items, function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  // Sous-navigation de la page Apprendre : lien courant
  var sub = document.querySelectorAll(".subnav a");
  if (sub.length && "IntersectionObserver" in window) {
    var map = {};
    Array.prototype.forEach.call(sub, function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          Array.prototype.forEach.call(sub, function (a) { a.classList.remove("is-current"); a.removeAttribute("aria-current"); });
          map[en.target.id].classList.add("is-current");
          map[en.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) { so.observe(s); } });
  }

  // Mur de témoignages : boutons précédent / suivant et compteur
  Array.prototype.forEach.call(document.querySelectorAll("[data-wall]"), function (block) {
    var wall = block.querySelector(".wall");
    var prev = block.querySelector("[data-prev]");
    var next = block.querySelector("[data-next]");
    var count = block.querySelector(".wall-count");
    var cards = wall.children;
    function index() {
      var x = wall.scrollLeft, best = 0, d = Infinity;
      for (var i = 0; i < cards.length; i++) {
        var diff = Math.abs(cards[i].offsetLeft - wall.offsetLeft - x - parseFloat(getComputedStyle(wall).paddingLeft));
        if (diff < d) { d = diff; best = i; }
      }
      return best;
    }
    function update() {
      var i = index();
      if (count) { count.textContent = (i + 1) + " / " + cards.length; }
      if (prev) { prev.disabled = i === 0; }
      if (next) { next.disabled = wall.scrollLeft + wall.clientWidth >= wall.scrollWidth - 4; }
    }
    function go(step) {
      var i = Math.max(0, Math.min(cards.length - 1, index() + step));
      var pl = parseFloat(getComputedStyle(wall).paddingLeft);
      wall.scrollTo({ left: cards[i].offsetLeft - wall.offsetLeft - pl, behavior: reduce ? "auto" : "smooth" });
    }
    if (prev) { prev.addEventListener("click", function () { go(-1); }); }
    if (next) { next.addEventListener("click", function () { go(1); }); }
    wall.addEventListener("scroll", function () { window.requestAnimationFrame(update); });
    window.addEventListener("resize", update);
    update();
  });

  // Année courante dans le pied de page
  var yr = document.getElementById("year");
  if (yr) { yr.textContent = String(new Date().getFullYear()); }

  // Formulaire : ouverture de la messagerie avec le message prêt à envoyer
  var form = document.getElementById("contact-form");
  if (form) {
    var err = document.getElementById("form-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nom = form.elements["nom"].value.trim();
      var email = form.elements["email"].value.trim();
      var sujet = form.elements["sujet"].value;
      var message = form.elements["message"].value.trim();
      if (!nom || !email || !message || !form.elements["email"].validity.valid) {
        err.textContent = "Merci de renseigner votre nom, une adresse e-mail valide et votre message.";
        var first = !nom ? "nom" : (!email || !form.elements["email"].validity.valid ? "email" : "message");
        form.elements[first].focus();
        return;
      }
      err.textContent = "";
      var tel = form.elements["tel"].value.trim();
      var body = message + "\n\n" + nom + "\n" + email + (tel ? "\n" + tel : "") + "\n\nPalette choisie : " + PALETTES[currentPalette()].name;
      var to = form.getAttribute("data-to");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(sujet) + "&body=" + encodeURIComponent(body);
    });
  }
})();
