import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { X, ExternalLink, FileText, Github, History } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IBTPProject } from "@/data/btpProjects";
import type { IDevProject } from "@/data/devProjects";
import { useArticleCountByTag } from "@/hooks/useArticleCountByTag";

interface IProjectModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  project: IBTPProject | IDevProject | null;
  side: "btp" | "dev";
}

function isDevProject(p: IBTPProject | IDevProject): p is IDevProject {
  return "stack" in p;
}

// Fond du bandeau .modal-hero : constant quel que soit le mode (mockup, .modal-hero background
// rgba(20,18,16,*) toujours, jamais un ton différent dev/BTP). Seule la couleur DESSOUS ce gradient
// change avec le mode (var(--accent) du mockup, ici hsl(var(--mode-accent)) posé par NewHome.tsx) :
// pas de logique par `side` ici, contrairement à l'implémentation précédente qui teintait toute la
// carte différemment selon dev/BTP (bg-dev-dark/bg-btp-dark), un écart au mockup.
const MODAL_OVERLAY_RGB = "20,18,16";

// Deux styles de lien bien distincts dans le mockup (.modal-links a.gh vs a.live), jamais le même
// style "outline" répété pour tout (écart de l'implémentation précédente) : GitHub/Articles/Versions
// restent transparents et bordés, tandis que le lien principal (Voir le projet/Démo) est un pavé
// blanc plein, sans variante hover définie côté mockup pour celui-ci (aucune n'est donc ajoutée ici).
const MODAL_LINK_GH_CLASS =
  "rounded-lg border-white/25 bg-transparent px-4 py-[9px] text-[13px] font-semibold text-white shadow-none hover:border-white hover:bg-transparent hover:text-white";
const MODAL_LINK_LIVE_CLASS = "rounded-lg bg-white px-4 py-[9px] text-[13px] font-semibold text-[#14120F] shadow-none hover:bg-white";

// Carte : léger fondu + montée + scale, retenu après plusieurs itérations avec Gilles sur le
// mockup de référence (Projets/Portfolio/mockups/refonte-v5-bascule.html, #modalReveal).
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
  exit: { opacity: 0, y: 18, scale: 0.97, transition: { duration: 0.2, ease: "easeOut" } },
};

// Contenu du corps : assemblage en cascade, chaque bloc alterne gauche/droite (nth impair/pair
// dans le mockup), délai croissant de 0.08s. Un seul mécanisme, appliqué identiquement aux
// projets dev et chantiers BTP (pas de variante par projet).
const bodyItemVariants: Variants = {
  hidden: (i: number) => ({ opacity: 0, x: i % 2 === 0 ? -16 : 16, y: 8 }),
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    y: 0,
    // Mockup : nth-child(1..5) → 0.08s/0.16s/.../0.4s (jamais 0s pour le 1er bloc), d'où (i + 1).
    transition: { duration: 0.4, ease: "easeOut", delay: (i + 1) * 0.08 },
  }),
};

// `side` ne pilote plus la couleur du modal (cf commentaire sur MODAL_OVERLAY_RGB plus bas) : gardé
// dans les props pour la compat d'appel (ProjectsSectionV2 le passe toujours).
export default function ProjectModalV2({ isOpen, onClose, project }: IProjectModalV2Props) {
  const articleCount = useArticleCountByTag(project?.id ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Bloque le scroll de la page tant que la modale est ouverte : ce composant ne passe pas par le
  // Dialog Radix (src/components/ui/dialog.tsx), qui gère ça nativement. ProjectModal.tsx
  // (l'existant, Home actuelle) est lui aussi custom et n'a PAS ce verrou : on l'ajoute ici car
  // demandé explicitement (point 9 du brief /new). Déverrouillé à la fermeture quel que soit le
  // déclencheur (croix, fond, Échap), via le cleanup de cet effet.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Échap ferme la modale (le <dialog> natif du mockup le fait nativement, ici c'est manuel).
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus initial sur le conteneur de la modale, jamais sur la croix (sinon cerclage de focus
  // visible juste après ouverture, cf point 10 du brief /new).
  useEffect(() => {
    if (isOpen) containerRef.current?.focus();
  }, [isOpen, project]);

  if (!project) return null;

  const bodyBlocks: ReactNode[] = [
    <h3 key="title" className="text-[26px] font-bold leading-tight text-white">
      {project.name}
    </h3>,
    <p key="desc" className="mb-5 max-w-[520px] text-[15px] leading-[1.6] text-white/75">
      {project.description}
    </p>,
  ];

  if (isDevProject(project)) {
    if (project.stack && project.stack.length > 0) {
      bodyBlocks.push(
        <div key="stack" className="mb-[22px] flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <Badge key={tech} variant="outline" className="rounded-full border-white/20 bg-transparent px-3 py-[5px] text-xs text-white/60 shadow-none">
              {tech}
            </Badge>
          ))}
        </div>
      );
    }
    bodyBlocks.push(
      <p key="status" className="mb-[18px] text-xs text-white/35">
        {project.status}
      </p>
    );

    const hasLinks =
      project.links?.github ||
      project.links?.live ||
      project.links?.demo ||
      project.comingSoon ||
      project.id === "cocotte-eclair" ||
      articleCount > 0;

    if (hasLinks) {
      bodyBlocks.push(
        <div key="links" className="flex flex-wrap gap-2.5">
          {project.links?.github && (
            <Button asChild variant="outline" size="sm" className={cn(MODAL_LINK_GH_CLASS)}>
              <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                <Github size={14} className="mr-1" /> GitHub
              </a>
            </Button>
          )}
          {project.links?.live && (
            <Button asChild size="sm" className={cn(MODAL_LINK_LIVE_CLASS)}>
              <a href={project.links.live} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} className="mr-1" /> Voir le projet
              </a>
            </Button>
          )}
          {project.links?.demo && (
            <Button asChild size="sm" className={cn(MODAL_LINK_LIVE_CLASS)}>
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} className="mr-1" /> Démo
              </a>
            </Button>
          )}
          {!project.links?.live && !project.links?.demo && project.comingSoon && (
            <span className="inline-flex items-center px-2 py-1.5 text-xs italic text-white/40">Lien à venir</span>
          )}
          {articleCount > 0 && (
            <Button asChild variant="outline" size="sm" className={cn(MODAL_LINK_GH_CLASS)}>
              <Link to={`/articles?tag=${project.id}`} onClick={onClose}>
                <FileText size={14} className="mr-1" /> Articles
              </Link>
            </Button>
          )}
          {project.id === "cocotte-eclair" && (
            <Button asChild variant="outline" size="sm" className={cn(MODAL_LINK_GH_CLASS)}>
              <Link to="/projects/cocotte-eclair/versions" onClick={onClose}>
                <History size={14} className="mr-1" /> Versions
              </Link>
            </Button>
          )}
        </div>
      );
    }
  } else if (articleCount > 0) {
    bodyBlocks.push(
      <div key="articles">
        <Button asChild variant="outline" size="sm" className={cn(MODAL_LINK_GH_CLASS)}>
          <Link to={`/articles?tag=${(project as IBTPProject).id}`} onClick={onClose}>
            <FileText size={14} className="mr-1" /> Articles
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="modal"
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              ref={containerRef}
              tabIndex={-1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#14120F] shadow-2xl outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative flex h-[260px] items-center justify-center bg-cover bg-center"
                style={{
                  background: `linear-gradient(to bottom, rgba(${MODAL_OVERLAY_RGB},0.15), rgba(${MODAL_OVERLAY_RGB},0.93)), hsl(var(--mode-accent))`,
                }}
              >
                {/* Image contenue (pas en fond cover) : le mockup affiche le visuel du projet en
                    médaillon centré sur le fond teinté accent, jamais en plein cadre recadré. */}
                {project.image && <img src={project.image} alt="" className="max-h-full max-w-full object-contain" />}
                <button
                  onClick={onClose}
                  aria-label="Fermer"
                  className="absolute right-4 top-4 z-10 text-white/60 hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="flex flex-col px-10 pb-9 pt-8">
                {bodyBlocks.map((block, i) => (
                  <motion.div key={i} custom={i} variants={bodyItemVariants} initial="hidden" animate="visible">
                    {block}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
