import { ExternalLink, Github } from 'lucide-react'
import type { IDevProject } from '@/data/devProjects'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface IProjectCardProps {
  project: IDevProject
}

export default function ProjectCard({ project }: IProjectCardProps) {
  return (
    <div className="rounded-xl border border-border p-6 flex flex-col gap-4 hover:border-border/60 transition-colors bg-card">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base">{project.name}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
            {project.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {project.stack.map((tech) => (
          <Badge key={tech} variant="secondary" className="text-xs">
            {tech}
          </Badge>
        ))}
      </div>
      {(project.links.github || project.links.live) && (
        <div className="flex gap-2 mt-auto pt-2">
          {project.links.github && (
            <Button asChild variant="outline" size="sm">
              <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                <Github size={14} className="mr-1" /> GitHub
              </a>
            </Button>
          )}
          {project.links.live && (
            <Button asChild variant="outline" size="sm">
              <a href={project.links.live} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} className="mr-1" /> Voir
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
