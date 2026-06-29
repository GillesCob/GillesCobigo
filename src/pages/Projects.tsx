import ProjectCard from "@/components/projects/ProjectCard";
import BIMTerm from "@/components/shared/BIMTerm";
import { btpProjects } from "@/data/btpProjects";
import { devProjects } from "@/data/devProjects";

export default function Projects() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 mt-11 space-y-20">
      <div>
        <h1 className="text-3xl font-bold mb-3">Projets</h1>
        <p className="text-muted-foreground">10 ans dans le BTP, puis le dev depuis 2022. Les deux comptent.</p>
      </div>

      <section>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">2022 — Aujourd&apos;hui · Dev</p>
          <h2 className="text-2xl font-bold">Développeur</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {devProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">2008 — 2022 · BTP</p>
          <h2 className="text-2xl font-bold">
            <BIMTerm>BIM</BIMTerm> Manager
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {btpProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
