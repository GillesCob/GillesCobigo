import { previewProjects, type IPreviewProject, type IPreviewTarifTheme } from "@/data/previewProjects";

/** Palette par defaut (secteur « commerce » de l'outil Sites, contraste AA verifie la-bas) : prospect sans identite propre. */
export const DEFAULT_TARIF_THEME: IPreviewTarifTheme = {
  bg: "#f6f1e9",
  surface: "#fffdf8",
  surface2: "#ede0d5",
  border: "#d8bead",
  text: "#24211c",
  muted: "#5a5247",
  accent: "#8a3b12",
  onAccent: "#ffffff",
  ink: "#1d2a2f",
  inkSub: "#b9c4c8",
  fontTitle: '"Fraunces", Georgia, serif',
  fontBody: '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
  fontsUrl:
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap",
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
// Liste de familles : lettres, chiffres, espaces, virgules, guillemets, point et tiret. Jamais « ; { } ( ) < > \ / ».
const FONT_FAMILY = /^[\w\s,"'.-]{1,200}$/;
const FONTS_URL = /^https:\/\/fonts\.googleapis\.com\/css2\?[A-Za-z0-9:@;.,=&+%_-]{1,500}$/;
const TAGLINE_MAX = 120;

const COLOR_KEYS = ["bg", "surface", "surface2", "border", "text", "muted", "accent", "onAccent", "ink", "inkSub"] as const;

/** Variables CSS posees sur le conteneur de la page (jamais interpolees dans du HTML ou du CSS brut). */
export type ITarifCssVars = Record<`--${string}`, string>;

export interface IResolvedTarifTheme {
  cssVars: ITarifCssVars;
  fontsUrl: string | null;
  tagline: string | null;
}

function isSafeTheme(theme: IPreviewTarifTheme): boolean {
  if (!COLOR_KEYS.every((k) => HEX_COLOR.test(theme[k]))) return false;
  if (!FONT_FAMILY.test(theme.fontTitle) || !FONT_FAMILY.test(theme.fontBody)) return false;
  if (theme.fontsUrl !== undefined && !FONTS_URL.test(theme.fontsUrl)) return false;
  if (theme.tagline !== undefined && theme.tagline.length > TAGLINE_MAX) return false;
  return true;
}

/** Theme d'un prospect : ses valeurs si toutes sont valides, sinon la palette par defaut (jamais une valeur partielle). */
export function resolveTarifTheme(theme: IPreviewTarifTheme | undefined): IResolvedTarifTheme {
  const t = theme !== undefined && isSafeTheme(theme) ? theme : DEFAULT_TARIF_THEME;
  return {
    cssVars: {
      "--bg": t.bg,
      "--surface": t.surface,
      "--surface-2": t.surface2,
      "--border": t.border,
      "--text": t.text,
      "--muted": t.muted,
      "--accent": t.accent,
      "--on-accent": t.onAccent,
      "--ink": t.ink,
      "--ink-sub": t.inkSub,
      "--font-title": t.fontTitle,
      "--font-body": t.fontBody,
    },
    fontsUrl: t.fontsUrl ?? null,
    tagline: t.tagline !== undefined && t.tagline.trim() !== "" ? t.tagline : null,
  };
}

/**
 * Prospect a froid designe par l'adresse /preview/<slug>/<secret>/tarif. Le secret doit etre une cle propre de la liste connue
 * (jamais une propriete heritee comme « constructor »), le slug doit etre celui de cette entree, et l'entree doit etre un
 * premier contact a froid publie avec une identite de page de prix (tarifTheme, donc une page d'entree /V1/ a laquelle revenir) :
 * toute autre combinaison renvoie undefined (page 404), sans rien reveler.
 */
export function findTarifProspect(slug: string | undefined, secret: string | undefined): IPreviewProject | undefined {
  if (slug === undefined || secret === undefined) return undefined;
  if (!Object.prototype.hasOwnProperty.call(previewProjects, secret)) return undefined;
  const project = previewProjects[secret];
  if (project === undefined || project.slug !== slug || !project.coldIntro || project.tarifTheme === undefined) return undefined;
  return project;
}
