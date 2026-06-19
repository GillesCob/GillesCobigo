import type { IHeading } from '@/lib/articles'

interface IArticleTocProps {
  headings: IHeading[]
}

export default function ArticleToc({ headings }: IArticleTocProps) {
  if (headings.length === 0) return null

  return (
    <aside className="hidden xl:flex flex-col w-56 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-8 px-4 gap-3">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
        Dans cet article
      </p>
      <nav className="flex flex-col gap-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`text-sm text-muted-foreground hover:text-foreground transition-colors leading-snug ${
              heading.level === 3 ? 'pl-4' : ''
            }`}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </aside>
  )
}
