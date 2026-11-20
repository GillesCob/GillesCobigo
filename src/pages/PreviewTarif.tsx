import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import TarifAsideCards from "@/components/preview/tarif/TarifAsideCards";
import TarifContactDialog from "@/components/preview/tarif/TarifContactDialog";
import TarifCredit from "@/components/preview/tarif/TarifCredit";
import TarifOfferCard from "@/components/preview/tarif/TarifOfferCard";
import type { IPreviewProject } from "@/data/previewProjects";
import { usePreviewFavicon } from "@/hooks/usePreviewFavicon";
import { usePreviewTarifHead } from "@/hooks/usePreviewTarifHead";
import { usePreviewTitle } from "@/hooks/usePreviewTitle";
import { useTarifOptions } from "@/hooks/useTarifOptions";
import { trackFunnelBeacon } from "@/lib/funnelTracking";
import { findTarifProspect, resolveTarifTheme } from "@/lib/previewTarif";
import NotFound from "@/pages/NotFound";
import "./PreviewTarif.css";

function TarifPage({ prospect, secret }: { prospect: IPreviewProject; secret: string }) {
  const theme = useMemo(() => resolveTarifTheme(prospect.tarifTheme), [prospect]);
  const cssVars = theme.cssVars as CSSProperties;
  const options = useTarifOptions();
  const [openSignal, setOpenSignal] = useState(0);
  usePreviewTitle(`${prospect.projectName} | Tarif`);
  usePreviewFavicon(prospect.logo);
  usePreviewTarifHead(theme.fontsUrl);

  // Arrivee sur la page de prix = etape « page-finale » du suivi (meme etape que la page d'accueil d'un prospect a froid).
  useEffect(() => {
    trackFunnelBeacon(prospect.slug, "page-finale");
  }, [prospect.slug]);

  function openDialog() {
    trackFunnelBeacon(prospect.slug, "modale-numero");
    setOpenSignal((n) => n + 1);
  }

  return (
    <div className="pt" style={cssVars}>
      <header className="top">
        <div className="wrap">
          <span>
            <span className="brand-name">{prospect.projectName}</span>
            {theme.tagline !== null && <span className="brand-sub">{theme.tagline}</span>}
          </span>
        </div>
      </header>

      <main className="wrap" id="tarif">
        <div className="nav-haut">
          <a className="btn btn-sec" href={`/preview/${prospect.slug}/${secret}/V1/`}>
            <span aria-hidden="true">←</span> Retour à vos deux propositions
          </a>
        </div>

        <h1>Le tarif</h1>

        <div className="grille">
          <TarifOfferCard options={options} onInterested={openDialog} />
          <TarifAsideCards />
        </div>
      </main>

      <TarifCredit />

      <TarifContactDialog projectName={prospect.projectName} options={options} openSignal={openSignal} cssVars={cssVars} />
    </div>
  );
}

/**
 * Page de prix unique, partagee par tous les prospects (/preview/<slug>/<secret>/tarif, maquette S-203) : texte et montants
 * communs, seuls le nom, le logo (favicon) et la palette viennent de l'entree previewProjects du prospect. Modifier cette page
 * ou lib/boutiquesPricing.ts la change pour tous, y compris les prospects deja contactes qui y renvoient.
 */
export default function PreviewTarif() {
  const { project: slug, secret } = useParams<{ project: string; secret: string }>();
  const prospect = findTarifProspect(slug, secret);
  if (prospect === undefined || secret === undefined) return <NotFound />;
  return <TarifPage prospect={prospect} secret={secret} />;
}
