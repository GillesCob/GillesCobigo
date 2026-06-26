import type { ReactNode } from "react";
import { ExternalLink, FileText, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useArticleCountByTag } from "@/hooks/useArticleCountByTag";

export interface IProjectCard {
  id: string;
  name: string;
  description: ReactNode;
  image?: string;
  status?: string;
  stack?: string[];
  links?: {
    github?: string;
    live?: string;
    demo?: string;
  };
}

interface IProjectCardProps {
  project: IProjectCard;
}

export default function ProjectCard({ project }: IProjectCardProps) {
  const articleCount = useArticleCountByTag(project.id);
  const hasLinks =
    articleCount > 0 ||
    (project.links && (project.links.github || project.links.live || project.links.demo));

  return (
    <div className="rounded-xl border border-border p-6 flex flex-col gap-4 hover:border-border/60 transition-colors bg-card">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base">{project.name}</h3>
          {project.status && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              {project.status}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
      </div>
      {project.stack && project.stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      )}
      {hasLinks && (
        <div className="flex gap-2 mt-auto pt-2">
          {project.links?.github && (
            <Button asChild variant="outline" size="sm">
              <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                <Github size={14} className="mr-1" /> GitHub
              </a>
            </Button>
          )}
          {project.links?.live && (
            <Button asChild variant="outline" size="sm">
              <a href={project.links.live} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} className="mr-1" /> Voir
              </a>
            </Button>
          )}
          {project.links?.demo && (
            <Button asChild variant="outline" size="sm">
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} className="mr-1" /> Démo
              </a>
            </Button>
          )}
          {articleCount > 0 && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/articles?tag=${project.id}`}>
                <FileText size={14} className="mr-1" /> Articles
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
