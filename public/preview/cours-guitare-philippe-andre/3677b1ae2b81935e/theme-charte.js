/* Bascule clair/sombre : clé partagée, repli sur prefers-color-scheme. À charger dans le head, sans defer. */
(function () {
  "use strict";
  var KEY = "charte-theme", root = document.documentElement;
  function lire() {
    try { var s = localStorage.getItem(KEY); if (s === "dark" || s === "light") { return s; } } catch (e) {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function appliquer(t) {
    root.setAttribute("data-theme", t);
    var b = document.getElementById("theme-toggle");
    if (b) { b.setAttribute("aria-pressed", t === "dark" ? "true" : "false"); b.setAttribute("aria-label", t === "dark" ? "Passer en mode clair" : "Passer en mode sombre"); }
    Array.prototype.forEach.call(document.querySelectorAll(".credit-gc img"), function (i) {
      i.src = i.getAttribute("src").replace(/logo-gc-(black|white)\.png/, "logo-gc-" + (t === "dark" ? "white" : "black") + ".png");
    });
  }
  appliquer(lire());
  document.addEventListener("DOMContentLoaded", function () {
    var wrap = document.querySelector("header.top .wrap");
    if (!wrap) { return; }
    var b = document.createElement("button");
    b.type = "button"; b.id = "theme-toggle"; b.className = "theme-toggle";
    b.innerHTML = '<svg class="i-lune" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><svg class="i-soleil" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    b.addEventListener("click", function () {
      var n = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, n); } catch (e) {}
      appliquer(n);
    });
    wrap.appendChild(b);
    appliquer(root.getAttribute("data-theme"));
  });
})();
