import ProjectCard from '@/components/projects/ProjectCard'
import { devProjects } from '@/data/devProjects'

export default function Projects() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-3">Projets</h1>
      <p className="text-muted-foreground mb-12">
        Tout ce qui est en prod, en cours ou qui m&apos;a appris quelque chose.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
