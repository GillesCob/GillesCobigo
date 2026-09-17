import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { devProjects, type IDevProject } from "@/data/devProjects";
import { btpProjects, type IBTPProject } from "@/data/btpProjects";
import ProjectModalV2 from "@/components/home/ProjectModalV2";
import type { Mode } from "@/store/modeStore";

// Mêmes 4 projets dev mis en avant que sur la Home actuelle (src/components/home/ProjectsSection.tsx).
const PREVIEW_IDS = ["cerithe", "nexio", "chouxfleurs", "ouvra"];

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
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-baseline gap-[22px] overflow-hidden border-b border-border py-[26px] pl-1.5 pr-1 text-left transition-[padding-left,background-color] duration-[250ms] ease-in-out hover:bg-foreground/[0.02] hover:pl-4 first:border-t sm:py-[38px]"
    >
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-1 top-1/2 z-0 h-[84px] w-auto max-w-[160px] -translate-y-1/2 object-contain opacity-[0.32] grayscale transition-opacity duration-[250ms] group-hover:opacity-[0.55]",
            invertImage && "invert"
          )}
        />
      )}
      <span className="relative z-[1] w-[30px] flex-shrink-0 font-mono text-sm text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="relative z-[1] min-w-0 flex-1">
        {tag && (
          <span className="mb-2.5 block text-[11px] font-bold uppercase tracking-[0.05em] text-mode-accent">
            {tag}
          </span>
        )}
        <h3 className="mb-3 text-[clamp(22px,3.2vw,32px)] font-extrabold tracking-[-0.01em]">{title}</h3>
        <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight
        size={20}
        className="relative z-[1] hidden flex-shrink-0 text-muted-foreground transition-transform duration-[250ms] group-hover:translate-x-1 group-hover:text-foreground sm:block"
      />
    </button>
  );
}

export default function ProjectsSectionV2({ mode }: IProjectsSectionV2Props) {
  const [modal, setModal] = useState<ActiveModal>(null);

  if (mode === "dev") {
    const previewProjects = devProjects.filter((p) => PREVIEW_IDS.includes(p.id));
    return (
      <>
        <section id="projets" className="scroll-mt-[90px]">
          <motion.div className={sectionBlockClassName} {...sectionBlockMotionProps}>
            <p className="mb-[18px] text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Projets</p>
            <div className="flex flex-col">
              {previewProjects.map((project, i) => (
                <WorkRow
                  key={project.id}
                  index={i}
                  tag={project.status}
                  title={project.name}
                  description={project.description}
                  image={project.image}
                  invertImage={project.id === "chouxfleurs"}
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
        <motion.div className={sectionBlockClassName} {...sectionBlockMotionProps}>
          <p className="mb-[18px] text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Chantiers</p>
          <div className="flex flex-col">
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
                  description={project.description}
                  image={project.image}
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
