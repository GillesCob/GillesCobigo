/* Cours de guitare Philippe André : thème, sélecteur de palette, navigation mobile, apparition douce, formulaire mailto.
   Aucun cookie, aucun script tiers. Le stockage local est enveloppé dans try/catch. */
(function () {
  "use strict";

  var root = document.documentElement;

  // Thème : bascule manuelle persistée, prioritaire sur la préférence système
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) { return t === "dark"; }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncToggle(btn) {
    btn.setAttribute("aria-pressed", isDark() ? "true" : "false");
  }
  var themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) {
    syncToggle(themeBtn);
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("pa-theme", next); } catch (e) { /* stockage indisponible */ }
      syncToggle(themeBtn);
    });
  }

  // Navigation mobile
  var header = document.querySelector(".site-header");
  var navBtn = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function setNav(open) {
    if (!header || !navBtn) { return; }
    header.classList.toggle("is-open", open);
    navBtn.setAttribute("aria-expanded", open ? "true" : "false");
    navBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  }
  if (navBtn && nav) {
    navBtn.addEventListener("click", function () {
      setNav(navBtn.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navBtn.getAttribute("aria-expanded") === "true") {
        setNav(false);
        navBtn.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (navBtn.getAttribute("aria-expanded") === "true" && header && !header.contains(e.target)) {
        setNav(false);
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) { setNav(false); }
    });
  }

  // Un seul <details> ouvert à la fois sur la page (repli du attribut name)
  var details = Array.prototype.slice.call(document.querySelectorAll("details.disclosure"));
  details.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) { return; }
      details.forEach(function (o) { if (o !== d) { o.open = false; } });
    });
  });

  // ===== Sélecteur de palette =====
  // Six palettes à identifiants fixes, partagées avec l'autre proposition via la clé "pa-palette".
  var PALETTES = [
    { id: "origine", name: "Origine", ink: "#10262f" },
    { id: "ocean", name: "Océan", ink: "#11283b" },
    { id: "sauge", name: "Sauge", ink: "#192e20" },
    { id: "prune", name: "Prune", ink: "#2e1736" },
    { id: "ambre", name: "Ambre", ink: "#2d2416" },
    { id: "graphite", name: "Graphite", ink: "#212327" }
  ];
  function palById(id) {
    for (var i = 0; i < PALETTES.length; i++) { if (PALETTES[i].id === id) { return PALETTES[i]; } }
    return PALETTES[0];
  }
  var palBtn = document.querySelector(".palette-toggle");
  var palPop = document.getElementById("palette-pop");
  var palOpts = palPop ? Array.prototype.slice.call(palPop.querySelectorAll(".pal-opt")) : [];
  var palReset = palPop ? palPop.querySelector(".palette-reset") : null;
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function currentPalette() { return palById(root.getAttribute("data-palette")); }
  function paintPalette() {
    var cur = currentPalette();
    if (themeMeta) { themeMeta.setAttribute("content", cur.ink); }
    palOpts.forEach(function (o) {
      var on = o.getAttribute("data-pal") === cur.id;
      o.setAttribute("aria-checked", on ? "true" : "false");
      o.tabIndex = on ? 0 : -1;
    });
    if (palReset) { palReset.disabled = cur.id === "origine"; }
  }
  function setPalette(id) {
    root.setAttribute("data-palette", palById(id).id);
    try {
      if (palById(id).id === "origine") { localStorage.removeItem("pa-palette"); }
      else { localStorage.setItem("pa-palette", palById(id).id); }
    } catch (e) { /* stockage indisponible */ }
    paintPalette();
  }
  function setPop(open, returnFocus) {
    if (!palBtn || !palPop) { return; }
    palPop.hidden = !open;
    palBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      setNav(false);
      details.forEach(function (d) { d.open = false; });
      var chk = palPop.querySelector('.pal-opt[aria-checked="true"]');
      if (chk) { chk.focus(); }
    } else if (returnFocus) { palBtn.focus(); }
  }
  if (palBtn && palPop) {
    paintPalette();
    palBtn.addEventListener("click", function () { setPop(palPop.hidden, false); });
    palOpts.forEach(function (o, i) {
      o.addEventListener("click", function () { setPalette(o.getAttribute("data-pal")); });
      o.addEventListener("keydown", function (e) {
        var k = e.key, n = -1;
        if (k === "ArrowRight" || k === "ArrowDown") { n = (i + 1) % palOpts.length; }
        else if (k === "ArrowLeft" || k === "ArrowUp") { n = (i + palOpts.length - 1) % palOpts.length; }
        if (n > -1) { e.preventDefault(); setPalette(palOpts[n].getAttribute("data-pal")); palOpts[n].focus(); }
      });
    });
    if (palReset) {
      palReset.addEventListener("click", function () { setPalette("origine"); palOpts[0].focus(); });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !palPop.hidden) { setPop(false, true); }
    });
    document.addEventListener("click", function (e) {
      if (!palPop.hidden && !palPop.contains(e.target) && !palBtn.contains(e.target)) { setPop(false, false); }
    });
    if (navBtn) {
      navBtn.addEventListener("click", function () { if (navBtn.getAttribute("aria-expanded") === "true") { setPop(false, false); } });
    }
    details.forEach(function (d) {
      d.addEventListener("toggle", function () { if (d.open) { setPop(false, false); } });
    });
  }

  // Apparition douce au défilement
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");
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
      var body = message + "\n\n" + nom + "\n" + email + (tel ? "\n" + tel : "") + "\n\nPalette choisie : " + currentPalette().name;
      var to = form.getAttribute("data-to");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(sujet) + "&body=" + encodeURIComponent(body);
    });
  }
})();
