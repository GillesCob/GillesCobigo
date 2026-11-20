import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import TarifCredit from "@/components/preview/tarif/TarifCredit";
import type { IPreviewProject } from "@/data/previewProjects";
import { usePreviewFavicon } from "@/hooks/usePreviewFavicon";
import { usePreviewTarifHead } from "@/hooks/usePreviewTarifHead";
import { usePreviewTitle } from "@/hooks/usePreviewTitle";
import { resolveTarifTheme } from "@/lib/previewTarif";
import "./PreviewEntree.css";

/**
 * Apercu d'une proposition : l'iframe est rendue a 1280 px (390 px sous 420 px de large) puis mise a l'echelle de son cadre
 * (maquette S-121, meme script que page-entree-deux-propositions.html).
 */
function Apercu({ url, numero }: { url: string; numero: 1 | 2 }) {
  const cadre = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const bloc = cadre.current;
    const frame = bloc?.querySelector("iframe");
    if (!bloc || !frame) return;
    function ajuster() {
      if (!bloc || !frame) return;
      const large = bloc.clientWidth >= 420;
      const w = large ? 1280 : 390;
      const h = large ? 800 : 560;
      const s = bloc.clientWidth / w;
      frame.style.width = `${w}px`;
      frame.style.height = `${h}px`;
      frame.style.transform = `scale(${s})`;
      bloc.style.height = `${Math.round(h * s)}px`;
    }
    ajuster();
    window.addEventListener("resize", ajuster);
    const obs = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(ajuster);
    obs?.observe(bloc);
    return () => {
      window.removeEventListener("resize", ajuster);
      obs?.disconnect();
    };
  }, []);

  return (
    <a ref={cadre} className="apercu" href={url} target="_blank" rel="noopener" tabIndex={-1} aria-hidden="true">
      <iframe src={url} title={`Aperçu de la proposition ${numero}`} tabIndex={-1} loading="lazy" aria-hidden="true" {...{ inert: "" }} />
    </a>
  );
}

/**
 * Page d'entree unique, partagee par tous les prospects (/preview/<slug>/<secret>, maquette S-121) : texte commun, seuls le nom,
 * la ligne de metier, la palette et les deux propositions (V1/P1 et V1/P2 du prospect) lui sont propres. Modifier cette page la
 * change pour tous les prospects, y compris ceux deja contactes.
 */
export default function PreviewEntree({ prospect, secret }: { prospect: IPreviewProject; secret: string }) {
  const theme = useMemo(() => resolveTarifTheme(prospect.tarifTheme), [prospect]);
  const cssVars = theme.cssVars as CSSProperties;
  usePreviewTitle(`${prospect.projectName} | Vos deux propositions`);
  usePreviewFavicon(prospect.logo);
  usePreviewTarifHead(theme.fontsUrl);

  const base = `/preview/${prospect.slug}/${secret}`;
  // Logo propre au prospect (publie sous /preview/) : repris en en-tete ; sinon le logo de repli de l'entree n'est pas affiche.
  const marque = prospect.logo.startsWith("/preview/") ? prospect.logo : null;

  return (
    <div className="pe" style={cssVars}>
      <header className="top">
        <div className="wrap">
          {marque !== null && <img className="brand-mark" src={marque} alt="" width={44} height={44} />}
          <span>
            <span className="brand-name">{prospect.projectName}</span>
            {theme.tagline !== null && <span className="brand-sub">{theme.tagline}</span>}
          </span>
        </div>
      </header>

      <main className="wrap">
        <h1>Deux points de départ pour votre site</h1>
        <p className="principe">
          Voici deux propositions, construites avec le même contenu dans deux designs différents.{" "}
          <span className="ajuste">
            Vous n'avez pas à en valider une telle quelle : on ajuste ensemble jusqu'à la version qui vous ressemble.
          </span>
        </p>

        <ul className="duo">
          {([1, 2] as const).map((n) => {
            const url = `${base}/V1/P${n}/`;
            return (
              <li className="prop" key={n}>
                <h2>Proposition {n}</h2>
                <Apercu url={url} numero={n} />
                <a className="btn" href={url} target="_blank" rel="noopener">
                  Ouvrir la proposition {n}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="tarif-ligne">
          <a className="btn btn-tarif" href={`${base}/tarif`}>
            Voir le tarif
          </a>
        </div>

        <h2 className="etapes-titre">La suite</h2>
        <ol className="etapes">
          <li>
            <span>Vous regardez mes propositions.</span>
          </li>
          <li>
            <span>On échange afin d'obtenir le site qui vous correspond.</span>
          </li>
          <li>
            <span>Je réalise votre site.</span>
          </li>
        </ol>
      </main>

      <TarifCredit />
    </div>
  );
}
