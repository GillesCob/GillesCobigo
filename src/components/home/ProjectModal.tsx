import { AnimatePresence, motion } from 'framer-motion'
import { X, ExternalLink, Github } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { IBTPProject } from '@/data/btpProjects'
import type { IDevProject } from '@/data/devProjects'

interface IProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: IBTPProject | IDevProject | null
  side: 'btp' | 'dev'
}

function isBTPProject(p: IBTPProject | IDevProject): p is IBTPProject {
  return 'imagePlaceholder' in p
}

export default function ProjectModal({ isOpen, onClose, project, side }: IProjectModalProps) {
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
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div
              className="relative w-full max-w-lg rounded-xl overflow-hidden shadow-2xl pointer-events-auto"
              style={{ backgroundColor: side === 'btp' ? '#2C1810' : '#111111' }}
              onClick={(e) => e.stopPropagation()}
            >
              {isBTPProject(project) && (
                <div
                  className="h-48 bg-cover bg-center flex-shrink-0"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(44,24,16,0.2), rgba(44,24,16,0.9)), url(${project.imagePlaceholder})`,
                    backgroundColor: '#3d2415',
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

                {!isBTPProject(project) && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.stack.map((tech) => (
                        <Badge
                          key={tech}
                          variant="outline"
                          className="border-white/20 text-white/55 text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-white/35 text-xs mb-4">{project.status}</p>
                    {(project.links.github || project.links.live) && (
                      <div className="flex gap-2">
                        {project.links.github && (
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
                        {project.links.live && (
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
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
