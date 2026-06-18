import { useState } from 'react'
import HeroSide from './HeroSide'
import ProjectModal from './ProjectModal'
import { btpProjects, type IBTPProject } from '@/data/btpProjects'
import { devProjects, type IDevProject } from '@/data/devProjects'

type ActiveModal =
  | { side: 'btp'; project: IBTPProject }
  | { side: 'dev'; project: IDevProject }
  | null

const BTP_TAGS = ['Maquette numérique', '100+ modèles', 'Bouygues']
const DEV_TAGS = ['TypeScript', 'Node.js', 'React', 'Claude Code', 'Docker', 'Nginx']

export default function HeroSplit() {
  const [modal, setModal] = useState<ActiveModal>(null)

  function handleBTPClick(id: string) {
    const project = btpProjects.find((p) => p.id === id)
    if (project) setModal({ side: 'btp', project })
  }

  function handleDevClick(id: string) {
    const project = devProjects.find((p) => p.id === id)
    if (project) setModal({ side: 'dev', project })
  }

  return (
    <section className="flex flex-col md:flex-row w-full min-h-screen">
      <HeroSide
        side="btp"
        dates="2011 — 2022"
        title="BIM Manager"
        tags={BTP_TAGS}
        bgColor="#2C1810"
        projectItems={btpProjects.map((p) => ({ id: p.id, name: p.name }))}
        onProjectClick={handleBTPClick}
      />
      <HeroSide
        side="dev"
        dates="2022 — aujourd'hui"
        title="Développeur"
        tags={DEV_TAGS}
        bgColor="#0A0A0A"
        projectItems={devProjects.map((p) => ({ id: p.id, name: p.name }))}
        onProjectClick={handleDevClick}
      />
      <ProjectModal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        project={modal?.project ?? null}
        side={modal?.side ?? 'btp'}
      />
    </section>
  )
}
