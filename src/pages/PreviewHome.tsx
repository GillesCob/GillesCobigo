import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Sun, Moon } from "lucide-react";
import { previewProjects } from "@/data/previewProjects";
import { useThemeStore } from "@/store/themeStore";
import { Button } from "@/components/ui/button";
import PreviewCredit from "@/components/preview/PreviewCredit";
import PricingCard from "@/components/preview/PricingCard";
import PreviewDropdown from "@/components/preview/PreviewDropdown";
import { usePreviewFavicon } from "@/hooks/usePreviewFavicon";
import { usePreviewTitle } from "@/hooks/usePreviewTitle";
import { trackFunnelBeacon } from "@/lib/funnelTracking";
import NotFound from "@/pages/NotFound";

export default function PreviewHome() {
  const { secret } = useParams<{ project: string; secret: string }>();
  const project = secret ? previewProjects[secret] : undefined;
  const { theme, toggleTheme } = useThemeStore();
  usePreviewFavicon(project?.logo);
  usePreviewTitle(project?.projectName);

  // Tracking funnel Boutiques Tier 1 (cf Projets/V1-Echanges/mockups/preview-prospect.html,
  // trackFunnelBeacon("page-finale")) : uniquement pour un prospect a froid (coldIntro), jamais
  // pour Mylene (relation deja etablie, page hors perimetre du funnel de prospection).
  useEffect(() => {
    if (project?.coldIntro) trackFunnelBeacon(project.slug, "page-finale");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.slug]);

  if (!project) return <NotFound />;

  // Premier contact a froid (coldIntro present) : fond creme en clair (headline-bg, deja defini
  // dans tailwind.config.ts, jusque-la inutilise) plutot que le blanc austere du reste du
  // portfolio. En sombre, "btp-dark" (#2C1810, brun) essaye puis retire le 14/08 (percu comme
  // rougeatre a l'ecran, jugé pas pro) : fond standard du theme conserve en sombre. Page d'un
  // client deja engage (Mylene) : fond inchange dans les deux modes.
  const isColdProspect = Boolean(project.coldIntro);
  // Passe le chemin de retour vers /cas-client/* en query param plutot que de dupliquer cette page
  // par prospect : la page cas client est commune a tous (donnees figees sur Mylene), seul le lien
  // de retour change. Achemine par CaseStudyVersionsNav sur toute la navigation V1->V6.
  const caseStudyFrom = secret ? `${project.slug}/${secret}` : "";

  return (
    <div
      className={`min-h-dvh flex flex-col relative ${
        isColdProspect ? "bg-headline-bg" : "bg-background"
      }`}
    >
      {/* Logo en filigrane (19/08, mockup preview-prospect.html) : grand, noir, semi-transparent
          en fond de page, jamais au-dessus du contenu. Taille fixe unique sur tous les ecrans
          (retire le 20/08 a la demande de Gilles : plus de variante mobile plus petite). */}
      {isColdProspect && (
        <img
          src="/images/logo-gc-black.png"
          alt=""
          aria-hidden="true"
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-auto opacity-[0.12] pointer-events-none select-none z-0"
        />
      )}

      {/* Toggle clair/sombre retire pour les pages cold-intro Boutiques (19/08, item 26) : cette
          page reste toujours claire, alignee sur preview-prospect.html ("plus de bouton de
          bascule ni de logique data-theme"). Conserve pour les autres clients (Mylene). */}
      {!isColdProspect && (
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Basculer le thème"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}

      <div
        className={`relative z-10 ${
          project.coldIntro
            ? "flex-1 flex items-start justify-center px-6 py-8"
            : "flex-1 flex items-center justify-center px-6 py-16"
        }`}
      >
        <div className="w-full max-w-2xl text-center">
          {project.coldIntro ? (
            // Premier contact a froid, atterrissage direct sur #tarif (18/08, funnel a 2
            // propositions statiques : le prospect a deja vu son site via v1.html/proposition-2.html
            // avant d'arriver ici, cette page n'est plus qu'un point d'atterrissage sur le prix,
            // aligne a la lettre sur Projets/V1-Echanges/mockups/preview-prospect.html. Fond plus
            // chaleureux que le reste du portfolio (cf fond de page ci-dessus), accents restes
            // sobres/pro (couleurs neutres du systeme, pas de teinte vive) a la demande de Gilles
            // le 14/08.
            <div id="tarif" className="mb-6 text-left scroll-mt-8">
              {/* Bandeau identite + retour (19/08, item 17 : logo agrandi 28px->64px, nom en
                  dessous au lieu d'a cote, lien repositionne) : rappelle que ce site est bien le
                  sien et permet de revoir les 2 propositions sans repasser par l'historique du
                  navigateur. Logo reel du prospect (pas une initiale generique, contrairement au
                  placeholder du mockup vault) : les 5 vrais prospects ont tous un logo scrape en
                  prospection. Aligne sur preview-prospect.html (.tarif-context). */}
              <div className="flex flex-col items-center text-center gap-2 max-w-[420px] mx-auto mb-5">
                <span className="h-16 w-16 rounded-full overflow-hidden shrink-0 bg-foreground/10">
                  <img src={project.logo} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="text-[17px] font-semibold">{project.projectName}</span>
                {/* 2 boutons "Proposition 1"/"Proposition 2" (20/08, demande de Gilles), remplacent
                    l'ancien lien unique "Revoir les 2 propositions →" (menait seulement vers la P1,
                    jamais explicitement les 2). flex-1 partage la largeur a parts egales, jamais de
                    debordement hors des 420px de la card tarif juste en dessous (meme max-width).
                    Nouvel onglet : ce sont des pages du site propose, pas la navigation du parcours
                    de prospection lui-meme. Aligne a la lettre sur preview-prospect.html
                    (.tarif-context-props/.tarif-context-prop-btn). */}
                {project.rounds[0]?.proposals[0]?.htmlPath && secret && (
                  <div className="flex gap-2 w-full">
                    <a
                      href={project.rounds[0].proposals[0].htmlPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center text-[12.5px] font-semibold text-foreground no-underline border border-muted-foreground rounded-full px-2.5 py-2 whitespace-nowrap hover:border-foreground hover:bg-foreground/[0.04]"
                    >
                      Proposition 1
                    </a>
                    <a
                      href={`/preview/${project.slug}/${secret}/V1/P2`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center text-[12.5px] font-semibold text-foreground no-underline border border-muted-foreground rounded-full px-2.5 py-2 whitespace-nowrap hover:border-foreground hover:bg-foreground/[0.04]"
                    >
                      Proposition 2
                    </a>
                  </div>
                )}
              </div>

              <PricingCard
                projectName={project.projectName}
                phone={project.phone}
                slug={project.coldIntro ? project.slug : undefined}
              />

              {/* "Les plus" (20/08, aligne a la lettre sur preview-prospect.html, variante A5/4) :
                  toujours ouvert, non interactif, chaque item precede d'une coche verte. */}
              <PreviewDropdown title="Les plus" locked>
                <ul className="flex flex-col gap-2.5 text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0 leading-relaxed">✓</span>
                    <span>Vous bénéficiez d'un interlocuteur unique qui vous accompagne personnellement sur votre projet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0 leading-relaxed">✓</span>
                    <span>
                      Vous vous focalisez sur le contenu et le design de votre site, l'aspect technique et la
                      sécurisation sont inclus dans mes services.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0 leading-relaxed">✓</span>
                    <span>Vous êtes propriétaire de votre site, l'export du code vous sera fourni dès sa mise en ligne.</span>
                  </li>
                </ul>
              </PreviewDropdown>

              {/* "Besoin de plus d'infos ?" (20/08) : accordeon ferme par defaut, meme accroche que
                  preview-prospect.html. Lien "Suivre la visite guidee" en pill plein (retour de
                  Gilles : rendu plus visible qu'un simple bouton outline). */}
              <PreviewDropdown title="Besoin de plus d'infos ?">
                <p className="text-muted-foreground mb-3">
                  Suivez la création du site du Dressing de Maïlys, de la 1ère version à la version finale ! Je vous
                  propose de parcourir les échanges que j'ai eus avec Mylène, gérante du Dressing de Maïlys, afin de
                  mieux comprendre comment nous travaillerons ensemble à la réalisation de votre nouveau site.
                </p>
                <Button asChild size="sm" className="rounded-full">
                  <Link to={`/cas-client/v1?from=${caseStudyFrom}`}>
                    Suivre le parcours de création d'un site <ArrowRight size={14} />
                  </Link>
                </Button>
              </PreviewDropdown>
            </div>
          ) : (
            <>
              <img
                src={project.logo}
                alt=""
                className={project.logoMaxWidth ? "mx-auto mb-8 drop-shadow-lg" : "h-56 md:h-80 w-auto mx-auto mb-8 drop-shadow-lg"}
                // h-56/md:h-80 forcent une hauteur fixe : combines a un max-width seul (1ere tentative,
                // insuffisante), le navigateur etirait l'image au lieu de la reduire proportionnellement
                // (retour de Gilles le 16/08). width/height "auto" ici reprennent la main entierement.
                style={project.logoMaxWidth ? { maxWidth: project.logoMaxWidth, maxHeight: project.logoMaxWidth, width: "auto", height: "auto" } : undefined}
              />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{project.projectName}</h1>
              <p className="text-muted-foreground text-lg mb-1">Suivi du projet avec {project.contactName}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Version en cours de discussion : <span className="font-mono font-semibold">{project.currentRound}</span>
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 mb-14">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-sm text-foreground">{project.nextAction}</span>
              </div>

              <div className="flex flex-col gap-3 text-left">
                {project.rounds.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">Aucune version disponible pour l'instant.</p>
                )}
                {/* Uniquement le round le plus recent (rounds[0], deja trie du plus recent au plus ancien) :
                    l'historique complet reste accessible via le drawer de versions sur la page de detail. */}
                {project.rounds.slice(0, 1).map((r) => (
                  <Link
                    key={r.round}
                    to={`/preview/${project.slug}/${secret}/${r.round.toLowerCase()}`}
                    className="group flex items-center justify-between rounded-xl border border-border bg-card px-6 py-5 hover:border-foreground/30 hover:shadow-sm transition-all"
                  >
                    <div>
                      <span className="font-mono text-base font-semibold">{r.round}</span>
                      <span className="text-sm text-muted-foreground ml-3">{r.date}</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {r.proposals.length} proposition{r.proposals.length > 1 ? "s" : ""} à consulter
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative z-10">
        <PreviewCredit />
      </div>
    </div>
  );
}
