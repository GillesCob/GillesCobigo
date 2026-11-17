/* Cours de guitare Philippe André : thème, navigation mobile, apparition douce, formulaire mailto.
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
      var body = message + "\n\n" + nom + "\n" + email + (tel ? "\n" + tel : "");
      var to = form.getAttribute("data-to");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(sujet) + "&body=" + encodeURIComponent(body);
    });
  }
})();
