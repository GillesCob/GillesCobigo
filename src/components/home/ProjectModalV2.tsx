import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { History } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { IBTPProject } from "@/data/btpProjects";
import type { IDevProject } from "@/data/devProjects";

interface IProjectModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  project: IBTPProject | IDevProject | null;
  side: "btp" | "dev";
}

function isDevProject(p: IBTPProject | IDevProject): p is IDevProject {
  return "stack" in p;
}

// Fond du bandeau .modal-hero ET du backdrop plein écran : constant quel que soit le mode (mockup,
// .modal-hero background rgba(20,18,16,*) et .modal-card::backdrop rgba(20,18,16,.6) toujours,
// jamais un noir pur ni un ton différent dev/BTP). Seule la couleur DESSOUS le gradient du bandeau
// change avec le mode (var(--accent) du mockup, ici hsl(var(--mode-accent)) posé par NewHome.tsx).
const MODAL_OVERLAY_RGB = "20,18,16";

// Croix de fermeture foncée sur les visuels de fond clairs (photos chantier, pas les
// logos/illustrations sombres des projets dev), sinon illisible en blanc (mockup, LIGHT_BG_PROJECTS).
const LIGHT_BG_PROJECTS = ["Mareterra", "MRS3"];

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Bloque le scroll de la page tant que la modale est ouverte : ce composant ne passe pas par le
  // Dialog Radix (src/components/ui/dialog.tsx), qui gère ça nativement. ProjectModal.tsx
  // (l'existant, Home actuelle) est lui aussi custom et n'a PAS ce verrou : on l'ajoute ici car
  // demandé explicitement (point 9 du brief /new). Déverrouillé à la fermeture quel que soit le
  // déclencheur (croix, fond, Échap), via le cleanup de cet effet.
  useEffect(() => {
    if (!isOpen) return;
    // `html` (pas seulement `body`) : même cause que la navbar (cf NewHome.tsx) — overflow-x:hidden
    // sur les deux (globals.css) force overflow-y:auto sur les deux, et le scroll réel de la page
    // se fait sur `html`. Verrouiller `body` seul ne bloquait donc rien.
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
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
    <div key="title" className="top">
      <h3>{project.name}</h3>
    </div>,
    <p key="desc" className="desc">
      {project.description}
    </p>,
  ];

  if (isDevProject(project)) {
    if (project.stack && project.stack.length > 0) {
      bodyBlocks.push(
        <div key="stack" className="mp-modal-stack">
          {project.stack.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
      );
    }
    bodyBlocks.push(
      <p key="status" className="status">
        {project.status}
      </p>
    );

    const hasLinks =
      project.links?.github ||
      project.links?.live ||
      project.links?.demo ||
      project.comingSoon ||
      project.id === "cocotte-eclair";

    if (hasLinks) {
      bodyBlocks.push(
        <div key="links" className="mp-modal-links">
          {/* Texte seul, sans icone : le mockup (#modalGithub/#modalLive) n'a jamais d'icone sur
              ces deux liens, contrairement a la modale precedente (ProjectModal.tsx). */}
          {project.links?.github && (
            <a className="gh" href={project.links.github} target="_blank" rel="noopener noreferrer">
              Code sur GitHub
            </a>
          )}
          {project.links?.live && (
            <a className="live" href={project.links.live} target="_blank" rel="noopener noreferrer">
              Voir en ligne
            </a>
          )}
          {project.links?.demo && (
            <a className="live" href={project.links.demo} target="_blank" rel="noopener noreferrer">
              Démo
            </a>
          )}
          {!project.links?.live && !project.links?.demo && project.comingSoon && (
            <span className="inline-flex items-center px-2 py-1.5 text-xs italic text-white/40">Lien à venir</span>
          )}
          {project.id === "cocotte-eclair" && (
            <Link className="gh" to="/projects/cocotte-eclair/versions" onClick={onClose}>
              <History size={14} /> Versions
            </Link>
          )}
        </div>
      );
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40"
            style={{ background: `rgba(${MODAL_OVERLAY_RGB},0.6)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div key="modal" className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={containerRef}
              tabIndex={-1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn("mp-modal-card", "pointer-events-auto outline-none")}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={cn("mp-modal-hero", LIGHT_BG_PROJECTS.includes(project.name) && "light-bg")}
                style={{
                  background: `linear-gradient(to bottom, rgba(${MODAL_OVERLAY_RGB},0.15), rgba(${MODAL_OVERLAY_RGB},0.93)), hsl(var(--mode-accent))`,
                }}
              >
                {/* Image contenue (pas en fond cover) : le mockup affiche le visuel du projet en
                    médaillon centré sur le fond teinté accent, jamais en plein cadre recadré. */}
                {project.image && <img src={project.image} alt="" />}
                <button type="button" onClick={onClose} aria-label="Fermer" className="mp-modal-close">
                  ✕
                </button>
              </div>

              <div className="mp-modal-body">
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
