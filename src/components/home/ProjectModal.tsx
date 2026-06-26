import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink, FileText, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IBTPProject } from "@/data/btpProjects";
import type { IDevProject } from "@/data/devProjects";
import { useArticleCountByTag } from "@/hooks/useArticleCountByTag";

interface IProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: IBTPProject | IDevProject | null;
  side: "btp" | "dev";
}

function isDevProject(p: IBTPProject | IDevProject): p is IDevProject {
  return "stack" in p;
}

function getProjectImage(p: IBTPProject | IDevProject): string | undefined {
  return p.image;
}

export default function ProjectModal({ isOpen, onClose, project, side }: IProjectModalProps) {
  const bgColor = side === "btp" ? "#2C1810" : "#111111";
  const overlayColor = side === "btp" ? "44,24,16" : "10,10,10";
  const articleCount = useArticleCountByTag(project?.id ?? "");

  return (
    <AnimatePresence>
      {isOpen && project && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/75 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div
              className="relative w-full max-w-lg rounded-xl overflow-hidden shadow-2xl pointer-events-auto"
              style={{ backgroundColor: bgColor }}
              onClick={(e) => e.stopPropagation()}
            >
              {getProjectImage(project) && (
                <div
                  className="h-48 bg-cover bg-center flex-shrink-0"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(${overlayColor},0.2), rgba(${overlayColor},0.9)), url(${getProjectImage(project)})`,
                    backgroundColor: bgColor,
                  }}
                />
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-white text-xl font-semibold leading-tight">{project.name}</h3>
                  <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white transition-colors ml-4 flex-shrink-0 mt-0.5"
                    aria-label="Fermer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-white/75 text-sm leading-relaxed mb-4">{project.description}</p>

                {isDevProject(project) && (
                  <>
                    {project.stack && project.stack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.stack.map((tech) => (
                          <Badge key={tech} variant="outline" className="border-white/20 text-white/55 text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-white/35 text-xs mb-4">{project.status}</p>
                    {(project.links?.github || project.links?.live || project.links?.demo || articleCount > 0) && (
                      <div className="flex gap-2 flex-wrap">
                        {project.links?.github && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white/70 hover:text-white hover:border-white/50"
                          >
                            <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                              <Github size={14} className="mr-1" /> GitHub
                            </a>
                          </Button>
                        )}
                        {project.links?.live && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white/70 hover:text-white hover:border-white/50"
                          >
                            <a href={project.links.live} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={14} className="mr-1" /> Voir le projet
                            </a>
                          </Button>
                        )}
                        {project.links?.demo && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white/70 hover:text-white hover:border-white/50"
                          >
                            <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={14} className="mr-1" /> Démo
                            </a>
                          </Button>
                        )}
                        {articleCount > 0 && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white/70 hover:text-white hover:border-white/50"
                          >
                            <Link to={`/articles?tag=${project.id}`} onClick={onClose}>
                              <FileText size={14} className="mr-1" /> Articles
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
                {!isDevProject(project) && articleCount > 0 && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white/70 hover:text-white hover:border-white/50"
                    >
                      <Link to={`/articles?tag=${(project as IBTPProject).id}`} onClick={onClose}>
                        <FileText size={14} className="mr-1" /> Articles
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
