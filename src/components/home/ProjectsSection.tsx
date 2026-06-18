import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProjectCard from '@/components/projects/ProjectCard'
import { devProjects } from '@/data/devProjects'

const PREVIEW_IDS = ['cerithe', 'nexio', 'chouxfleurs']

export default function ProjectsSection() {
  const previewProjects = devProjects.filter((p) => PREVIEW_IDS.includes(p.id))

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold">Projets</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/projects">
              Voir tout <ArrowRight size={14} className="ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
