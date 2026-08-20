// Tracking funnel Boutiques Tier 1 (cf Projets/Boutiques/workflow-cc.md, section "Tracking du
// funnel"). Beacon fire-and-forget, aucun cookie pose, jamais bloquant : une erreur reseau ou un
// service indisponible n'a aucun impact sur le fonctionnement de la page. Reproduit a la lettre
// la fonction trackFunnelBeacon de Projets/V1-Echanges/mockups/preview-prospect.html.
export function trackFunnelBeacon(slug: string, step: string) {
  try {
    const payload = JSON.stringify({ slug, step });
    const url = "https://boutiques-api.gillescobigo.com/track";
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // volontairement silencieux, cf commentaire ci-dessus
  }
}
