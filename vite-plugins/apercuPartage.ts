// Aperçu de partage de /construire-en-numerique (31/10). Le site est une SPA : toutes les adresses renvoient index.html (vercel.json), donc un lien partagé
// sur WhatsApp montrait l'aperçu général du portfolio. Au build, on écrit un second index.html à `construire-en-numerique/index.html` avec les balises de cette page ;
// l'hébergeur sert ce fichier statique pour cette adresse exacte avant la règle de réécriture. Les autres adresses ne changent pas.
import type { Plugin } from "vite";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { previewProjects } from "../src/data/previewProjects";

const SITE = "https://www.gillescobigo.com";

export const APERCU_CONSTRUIRE_NUMERIQUE = {
  chemin: "construire-en-numerique",
  titre: "Gilles Cobigo, Développeur et BIM Manager",
  description: "Le BIM accessible pour tous",
  image: `${SITE}/images/og-construire-en-numerique.png`,
  url: `${SITE}/construire-en-numerique`,
};

export interface Apercu {
  chemin: string;
  titre: string;
  description: string;
  image: string;
  url: string;
  /** Si présent : og:type et og:site_name sont posés (og:site_name est ajouté, absent de index.html). */
  nomSite?: string;
}

// Aperçus des pages d'échanges (/preview/<slug>/<secret>) : seuls les projets qui renseignent shareTitle, shareDescription et shareImage
// (previewProjects.ts) en ont un. Deux chemins par projet : l'accueil et /v1 (le lien partagé peut être l'un ou l'autre).
export function apercusPreview(projets: typeof previewProjects = previewProjects): Apercu[] {
  const sortie: Apercu[] = [];
  for (const [secret, p] of Object.entries(projets)) {
    if (!p.shareTitle || !p.shareDescription || !p.shareImage) continue;
    const base = `preview/${p.slug}/${secret}`;
    for (const chemin of [base, `${base}/v1`]) {
      sortie.push({ chemin, titre: p.shareTitle, description: p.shareDescription, image: p.shareImage, url: `${SITE}/${chemin}`, nomSite: p.projectName });
    }
  }
  return sortie;
}

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
  if (apercu.nomSite) {
    sortie = remplacer(sortie, meta("property", "og:type"), "website", "og:type");
    sortie = sortie.replace(meta("property", "og:type"), (tout) => `${tout} />\n    <meta property="og:site_name" content="${apercu.nomSite}"`);
  }
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
      for (const apercu of [APERCU_CONSTRUIRE_NUMERIQUE, ...apercusPreview()]) {
        const dossier = path.join(sortie, apercu.chemin);
        // Une page statique déposée dans public/<chemin>/index.html (ex. page de retour guidée de Philippe) porte déjà ses propres balises : elle prime.
        if (existsSync(path.join(dossier, "index.html"))) continue;
        mkdirSync(dossier, { recursive: true });
        writeFileSync(path.join(dossier, "index.html"), appliquerApercu(page, apercu));
      }
    },
  };
}
