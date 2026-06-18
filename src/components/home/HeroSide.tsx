import { Badge } from '@/components/ui/badge'

interface IProjectItem {
  id: string
  name: string
}

interface IHeroSideProps {
  side: 'btp' | 'dev'
  dates: string
  title: string
  tags: string[]
  bgColor: string
  projectItems: IProjectItem[]
  onProjectClick: (id: string) => void
}

export default function HeroSide({
  dates,
  title,
  tags,
  bgColor,
  projectItems,
  onProjectClick,
}: IHeroSideProps) {
  return (
    <div
      className="relative flex flex-col justify-between w-full md:w-1/2 min-h-[60vh] md:min-h-screen px-8 py-12 md:px-14 md:py-16"
      style={{ backgroundColor: bgColor }}
    >
      <p className="text-white/40 text-xs font-mono tracking-widest uppercase">{dates}</p>

      <div className="flex flex-col gap-8">
        <h2 className="text-white text-5xl md:text-6xl font-bold tracking-tight">{title}</h2>
        <ul className="flex flex-col gap-4">
          {projectItems.map((project) => (
            <li key={project.id}>
              <button
                onClick={() => onProjectClick(project.id)}
                className="text-white/75 hover:text-white text-xl md:text-2xl font-medium hover:underline underline-offset-4 transition-colors text-left"
              >
                {project.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className="border-white/25 text-white/50 text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}
