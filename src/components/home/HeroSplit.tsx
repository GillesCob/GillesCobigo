import { useState } from "react";
import HeroSide from "./HeroSide";
import ProjectModal from "./ProjectModal";
import { btpProjects, type IBTPProject } from "@/data/btpProjects";
import { devProjects, type IDevProject } from "@/data/devProjects";

type ActiveModal = { side: "btp"; project: IBTPProject } | { side: "dev"; project: IDevProject } | null;


export default function HeroSplit() {
  const [modal, setModal] = useState<ActiveModal>(null);

  function handleBTPClick(id: string) {
    const project = btpProjects.find((p) => p.id === id);
    if (project) setModal({ side: "btp", project });
  }

  function handleDevClick(id: string) {
    const project = devProjects.find((p) => p.id === id);
    if (project) setModal({ side: "dev", project });
  }

  return (
    // Mobile : min-h-screen (chaque bloc s'adapte à son contenu, rien n'est coupé).
    // Desktop (md:) : h-screen, hauteur FIXE = 100vh pile à l'écran.
    <section className="flex flex-col-reverse md:flex-row w-full min-h-screen md:h-screen">
      <HeroSide
        side="btp"
        dates="2008 — 2022 · BTP"
        title="BIM Manager"
        subtitle="Bouygues Construction"
        tags={["Maquette numérique", "100+ modèles", "2 milliards €"]}
        projectItems={btpProjects.map((p) => ({ id: p.id, name: p.name }))}
        onProjectClick={handleBTPClick}
        bgColor="#2C1810"
      />

      <HeroSide
        side="dev"
        dates="2022 — aujourd'hui · DEV"
        title="Développeur"
        subtitle="TypeScript, Node.js, React, Prisma"
        tags={["Claude Code", "Docker", "Nginx"]}
        projectItems={devProjects.map((p) => ({ id: p.id, name: p.name }))}
        onProjectClick={handleDevClick}
        bgColor="#0A0A0A"
      />

      <ProjectModal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        project={modal?.project ?? null}
        side={modal?.side ?? "btp"}
      />
    </section>
  );
}
