import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { IArticleMeta } from '@/lib/articles'

interface IArticleSidebarProps {
  articles: IArticleMeta[]
  activeSlug?: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ArticleSidebar({ articles, activeSlug }: IArticleSidebarProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = [...new Set(articles.flatMap((a) => a.tags))].sort()
  const filtered = selectedTag ? articles.filter((a) => a.tags.includes(selectedTag)) : articles

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-border py-8 px-4 gap-6">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Filtrer</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedTag(null)}
            className={`text-xs px-2 py-1 rounded-md border transition-colors ${
              selectedTag === null
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            Tous
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                selectedTag === tag
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Articles ({filtered.length})
        </p>
        {filtered.map((article) => (
          <Link
            key={article.slug}
            to={`/articles/${article.slug}`}
            className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 transition-colors ${
              article.slug === activeSlug
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <span className="text-sm font-medium leading-snug line-clamp-2">{article.title}</span>
            <span className="text-xs text-muted-foreground/70">{formatDate(article.date)}</span>
          </Link>
        ))}
      </div>
    </aside>
  )
}
