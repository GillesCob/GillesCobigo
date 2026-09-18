import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { devProjects, type IDevProject } from "@/data/devProjects";
import { btpProjects, type IBTPProject } from "@/data/btpProjects";
import ProjectModalV2 from "@/components/home/ProjectModalV2";
import type { Mode } from "@/store/modeStore";

// Mêmes 4 projets dev mis en avant que sur la Home actuelle (src/components/home/ProjectsSection.tsx).
const PREVIEW_IDS = ["cerithe", "nexio", "chouxfleurs", "ouvra"];

// Décalage droit du logo en filigrane, par projet : chaque asset a sa propre marge transparente
// interne (mesurée sur le fichier source, bbox de contenu réel vs canvas), donc une valeur unique
// de `right` ne donne pas le même espace visuel pour tous les logos. Ouvra en particulier a un
// icône étroit centré dans un canvas large (~58px de marge transparente à droite une fois affiché
// à sa largeur max de 160px) : une valeur négative rapproche sa vraie silhouette du bord, comme
// les autres logos, sans toucher au fichier source (partagé avec la modale/Home).
const WORK_LOGO_RIGHT_OFFSET: Record<string, string> = {
  cerithe: "right-6", // marge interne ~0
  nexio: "right-5", // marge interne ~4px à 160px affiché
  chouxfleurs: "right-4", // marge interne ~8px
  ouvra: "-right-[34px]", // marge interne ~58px à 160px affiché
};

type ActiveModal = { side: "dev"; project: IDevProject } | { side: "btp"; project: IBTPProject } | null;

interface IProjectsSectionV2Props {
  mode: Mode;
}

// Cadre commun "section-block" du mockup (border-top + marge de 130px + hauteur quasi pleine page,
// centrée) + apparition en fondu de la section entière au scroll (mockup .section-block.reveal).
const sectionBlockClassName =
  "mx-auto flex min-h-0 w-full max-w-[880px] flex-col justify-center border-t border-border px-5 pt-12 sm:min-h-[82vh] sm:px-10";
const sectionBlockMotionProps = {
  style: { marginTop: 130 },
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3, margin: "0px 0px -10% 0px" },
  transition: { duration: 0.7, ease: "easeOut" },
} as const;

// Sur mobile, ce fondu + translation se joue pendant le scroll lui-même (la section entre dans le
// viewport en scrollant), donnant une impression de saut/instabilité du contenu (signalé par
// Gilles). Retiré uniquement sous 640px (breakpoint sm), la section apparaît directement dans son
// état final, sans toucher au reveal desktop (pas signalé, largement moins perceptible avec un
// scroll à la souris/trackpad).
function useSectionBlockMotionProps() {
  // Initialisé de façon synchrone (pas useState(false) + correction après coup) : sur mobile, le
  // tout premier rendu appliquait sinon quand même `initial:{opacity:0}` avant que l'effet ne le
  // corrige, et retirer ensuite `whileInView`/`animate` ne remet pas Framer Motion à l'état visible
  // de lui-même (il garde la dernière valeur interpolée, ici opacité 0) : section invisible en
  // permanence sur mobile, jamais révélée. Sur mobile, `animate` est donc fourni explicitement
  // (jamais juste absent) pour forcer le retour à opacité 1.
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile
    ? ({ style: { marginTop: 130 }, initial: false, animate: { opacity: 1, y: 0 } } as const)
    : sectionBlockMotionProps;
}

// Ligne de la liste projets/chantiers : logo/visuel du projet en filigrane très discret derrière
// le texte (mockup .work-logo), jamais un logo dédié séparé de l'illustration déjà utilisée pour
// la modale, faute d'asset de logo distinct pour la plupart des projets (cf rapport d'audit).
function WorkRow({
  index,
  tag,
  title,
  description,
  image,
  invertImage,
  logoRightClassName,
  onClick,
}: {
  index: number;
  tag?: string;
  title: string;
  description: ReactNode;
  image?: string;
  // Logo ChouxFleurs blanc sur fond transparent (pensé pour la carte sombre de la modale) :
  // en filigrane opacity/grayscale sur le fond clair de /new, un blanc pur reste invisible quel
  // que soit le réglage d'opacité (blanc sur quasi-blanc). `invert` le rend visible sans toucher
  // à l'asset lui-même ni aux autres logos, qui sont déjà assez sombres pour ce traitement.
  invertImage?: boolean;
  // cf WORK_LOGO_RIGHT_OFFSET : compense la marge transparente propre à chaque asset.
  logoRightClassName?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="mp-work-row">
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className={cn("mp-work-logo", logoRightClassName ?? "right-6", invertImage && "invert")}
        />
      )}
      <span className="mp-work-index">{String(index + 1).padStart(2, "0")}</span>
      <div className="mp-work-main">
        {tag && <span className="mp-work-tag">{tag}</span>}
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span className="mp-work-arrow">→</span>
    </button>
  );
}

export default function ProjectsSectionV2({ mode }: IProjectsSectionV2Props) {
  const [modal, setModal] = useState<ActiveModal>(null);
  const motionProps = useSectionBlockMotionProps();

  if (mode === "dev") {
    const previewProjects = devProjects.filter((p) => PREVIEW_IDS.includes(p.id));
    return (
      <>
        <section id="projets" className="scroll-mt-[90px]">
          <motion.div className={sectionBlockClassName} {...motionProps}>
            <p className="mp-row-label">Projets</p>
            <div className="mp-work-list">
              {previewProjects.map((project, i) => (
                <WorkRow
                  key={project.id}
                  index={i}
                  tag={project.status}
                  title={project.name}
                  description={project.summary ?? project.description}
                  image={project.image}
                  invertImage={project.id === "chouxfleurs"}
                  logoRightClassName={WORK_LOGO_RIGHT_OFFSET[project.id]}
                  onClick={() => setModal({ side: "dev", project })}
                />
              ))}
            </div>
          </motion.div>
        </section>
        <ProjectModalV2 isOpen={modal !== null} onClose={() => setModal(null)} project={modal?.project ?? null} side={modal?.side ?? "dev"} />
      </>
    );
  }

  return (
    <>
      <section id="chantiers" className="scroll-mt-[90px]">
        <motion.div className={sectionBlockClassName} {...motionProps}>
          <p className="mp-row-label">Chantiers</p>
          <div className="mp-work-list">
            {btpProjects.map((project, i) => {
              // Le nom porte la ville en suffixe ("Mareterra - Monaco") : on la détache pour
              // reproduire le work-tag du mockup (ville en tag accent, nom seul en titre), plutôt
              // que d'omettre ce tag faute de champ dédié dans IBTPProject.
              const [title, city] = project.name.split(" - ");
              return (
                <WorkRow
                  key={project.id}
                  index={i}
                  tag={city}
                  title={title}
                  description={project.summary ?? project.description}
                  // Pas de `image` ici : le mockup ne pose le logo en filigrane (.work-logo) que sur
                  // les lignes #projets (dev), jamais sur #chantiers. `project.image` existe bien sur
                  // IBTPProject (sert à la modale), mais le passer ici affichait le filigrane sur les
                  // chantiers aussi, contrairement au mockup (trouvé au diff pixel).
                  onClick={() => setModal({ side: "btp", project })}
                />
              );
            })}
          </div>
        </motion.div>
      </section>
      <ProjectModalV2 isOpen={modal !== null} onClose={() => setModal(null)} project={modal?.project ?? null} side={modal?.side ?? "btp"} />
    </>
  );
}
