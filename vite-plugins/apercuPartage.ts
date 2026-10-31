// Aperçu de partage de /construire-en-numerique (31/10). Le site est une SPA : toutes les adresses renvoient index.html (vercel.json), donc un lien partagé
// sur WhatsApp montrait l'aperçu général du portfolio. Au build, on écrit un second index.html à `construire-en-numerique/index.html` avec les balises de cette page ;
// l'hébergeur sert ce fichier statique pour cette adresse exacte avant la règle de réécriture. Les autres adresses ne changent pas.
import type { Plugin } from "vite";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SITE = "https://www.gillescobigo.com";

export const APERCU_CONSTRUIRE_NUMERIQUE = {
  chemin: "construire-en-numerique",
  titre: "Gilles Cobigo, Développeur et BIM Manager",
  description: "Ouvra, mon démonstrateur BIM : maquette 3D, collisions et IA dans le navigateur. Présentation et démo le 3 novembre.",
  image: `${SITE}/images/og-construire-en-numerique.png`,
  url: `${SITE}/construire-en-numerique`,
};

type Apercu = typeof APERCU_CONSTRUIRE_NUMERIQUE;

// Remplace le contenu d'une balise ; échoue si elle est absente (jamais d'aperçu faux publié en silence).
function remplacer(html: string, motif: RegExp, valeur: string, nom: string): string {
  if (!motif.test(html)) throw new Error(`Aperçu de partage : balise introuvable (${nom})`);
  return html.replace(motif, (_tout, avant: string, _ancien: string, apres: string) => avant + valeur + apres);
}

const meta = (attribut: string, nom: string) => new RegExp(`(<meta\\s+${attribut}="${nom}"\\s+content=")([^"]*)(")`);

export function appliquerApercu(html: string, apercu: Apercu): string {
  let sortie = html;
  sortie = remplacer(sortie, meta("name", "description"), apercu.description, "description");
  sortie = remplacer(sortie, meta("property", "og:title"), apercu.titre, "og:title");
  sortie = remplacer(sortie, meta("property", "og:description"), apercu.description, "og:description");
  sortie = remplacer(sortie, meta("property", "og:image"), apercu.image, "og:image");
  sortie = remplacer(sortie, meta("property", "og:url"), apercu.url, "og:url");
  sortie = remplacer(sortie, meta("name", "twitter:title"), apercu.titre, "twitter:title");
  sortie = remplacer(sortie, meta("name", "twitter:description"), apercu.description, "twitter:description");
  sortie = remplacer(sortie, meta("name", "twitter:image"), apercu.image, "twitter:image");
  sortie = remplacer(sortie, /(<title>)([^<]*)(<\/title>)/, apercu.titre, "title");
  return sortie;
}

export function apercuPartage(): Plugin {
  let sortie = "dist";
  return {
    name: "apercu-partage",
    apply: "build",
    enforce: "post",
    configResolved(config) {
      sortie = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const page = readFileSync(path.join(sortie, "index.html"), "utf8");
      const dossier = path.join(sortie, APERCU_CONSTRUIRE_NUMERIQUE.chemin);
      mkdirSync(dossier, { recursive: true });
      writeFileSync(path.join(dossier, "index.html"), appliquerApercu(page, APERCU_CONSTRUIRE_NUMERIQUE));
    },
  };
}
