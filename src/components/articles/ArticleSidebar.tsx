import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import type { IArticleMeta } from '@/lib/articles'

interface IArticleSidebarProps {
  articles: IArticleMeta[]
  activeSlug?: string
}

interface IMonthGroup {
  monthKey: string
  label: string
  articles: IArticleMeta[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  const raw = new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function groupByMonth(articles: IArticleMeta[]): IMonthGroup[] {
  const groups: Record<string, IArticleMeta[]> = {}
  for (const a of articles) {
    const key = a.date.slice(0, 7)
    if (!groups[key]) groups[key] = []
    groups[key].push(a)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthKey, arts]) => ({
      monthKey,
      label: formatMonthLabel(monthKey),
      articles: arts.sort((a, b) => b.date.localeCompare(a.date)),
    }))
}

function getMonthOfSlug(articles: IArticleMeta[], slug?: string): string | null {
  if (!slug) return null
  return articles.find((a) => a.slug === slug)?.date.slice(0, 7) ?? null
}

export default function ArticleSidebar({ articles, activeSlug }: IArticleSidebarProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [openMonth, setOpenMonth] = useState<string | null>(
    () => getMonthOfSlug(articles, activeSlug) ?? new Date().toISOString().slice(0, 7)
  )

  // Sync open month when navigating to an article in a different month
  useEffect(() => {
    const month = getMonthOfSlug(articles, activeSlug)
    if (month) setOpenMonth(month)
  }, [activeSlug, articles])

  const tagCounts = articles.reduce<Record<string, number>>((acc, a) => {
    a.tags.forEach((t) => { acc[t] = (acc[t] ?? 0) + 1 })
    return acc
  }, {})
  const allTags = [...new Set(articles.flatMap((a) => a.tags))]
    .filter((t) => tagCounts[t] >= 2)
    .sort()
  const filtered = selectedTag ? articles.filter((a) => a.tags.includes(selectedTag)) : articles
  const grouped = groupByMonth(filtered)

  function toggleMonth(key: string): void {
    setOpenMonth(openMonth === key ? null : key)
  }

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto border-r border-border bg-background py-8 px-4 gap-6">
      {/* Tag filters */}
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

      {/* Articles grouped by month */}
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Articles ({filtered.length})
        </p>
        {grouped.map(({ monthKey, label, articles: monthArticles }) => (
          <div key={monthKey}>
            <button
              onClick={() => toggleMonth(monthKey)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <span>{label}</span>
              <ChevronDown
                size={13}
                className={`shrink-0 transition-transform duration-200 ${
                  openMonth === monthKey ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openMonth === monthKey && (
              <div className="flex flex-col gap-0.5 pl-1 mt-0.5">
                {monthArticles.map((article) => (
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
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
