import { useState } from 'react'
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { getArticles } from '@/lib/articles'
import ArticleSidebar from '@/components/articles/ArticleSidebar'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function scrollToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTo(0, 0);
  document.body.scrollTo(0, 0);
}

export default function Articles() {
  const articles = getArticles()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTags = searchParams.getAll('tag')
  const location = useLocation()
  const navigate = useNavigate()
  const [navState] = useState(
    (location.state ?? {}) as { from?: string; skillName?: string; tags?: string[] }
  )
  const { from, skillName, tags: skillTags } = navState
  const filtered = activeTags.length > 0
    ? articles.filter((a) => a.tags.some((t) => activeTags.some((tag) => t.toLowerCase() === tag.toLowerCase())))
    : articles

  const tagCounts = articles.reduce<Record<string, number>>((acc, a) => {
    a.tags.forEach((t) => { acc[t] = (acc[t] ?? 0) + 1 })
    return acc
  }, {})
  const allTags = [...new Set(articles.flatMap((a) => a.tags))]
    .filter((t) => tagCounts[t] >= 2)
    .sort()

  return (
    <div className="flex min-h-screen pt-16">
      <ArticleSidebar articles={articles} />

      <main className="flex-1 min-w-0 px-6 lg:px-12 py-12">
        <div className="max-w-3xl mx-auto">
          {from === 'skills' && (
            <button
              onClick={() => navigate('/', { state: { reopenSkill: { skillName, tags: skillTags } } })}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={14} /> Retour au diagramme
            </button>
          )}

          <h1 className="text-3xl font-bold mb-2">Journal</h1>
          <p className="text-muted-foreground mb-6">
            Notes de parcours, retours d&apos;experience, explorations techniques.
          </p>

          {/* Mobile tag filter — hidden on md+ where the sidebar handles it */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 md:hidden">
            <button
              onClick={() => { setSearchParams({}); scrollToTop() }}
              className={`text-xs px-2.5 py-1.5 rounded-md border whitespace-nowrap flex-shrink-0 transition-colors ${
                activeTags.length === 0
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-muted-foreground border-border'
              }`}
            >
              Tous
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => { setSearchParams({ tag: tag.toLowerCase() }); scrollToTop() }}
                className={`text-xs px-2.5 py-1.5 rounded-md border whitespace-nowrap flex-shrink-0 transition-colors ${
                  activeTags.some((t) => t.toLowerCase() === tag.toLowerCase())
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-muted-foreground border-border'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {activeTags.length > 0 && (
            <div className="flex items-center gap-2 mb-8 flex-wrap">
              <span className="text-sm text-muted-foreground">Filtré par :</span>
              {activeTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    const remaining = activeTags.filter((t) => t !== tag);
                    const params = new URLSearchParams();
                    remaining.forEach((t) => params.append('tag', t));
                    setSearchParams(params);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#E8734A]/10 text-[#E8734A] hover:bg-[#E8734A]/20 transition-colors"
                >
                  {tag} <X size={12} />
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="text-muted-foreground">
              {activeTags.length > 0 ? 'Aucun article pour ce tag.' : "Aucun article pour l'instant."}
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {filtered.map((article) => (
                <article key={article.slug} className="py-8 first:pt-0">
                  <Link
                    to={`/articles/${article.slug}`}
                    state={from === 'skills' ? { from: 'filtered', skillName, tags: skillTags } : undefined}
                    className="group block"
                  >
                    <time className="text-xs font-mono text-muted-foreground/70 uppercase tracking-widest">
                      {formatDate(article.date)}
                    </time>
                    <h2 className="text-xl font-semibold mt-2 mb-2 group-hover:text-muted-foreground transition-colors leading-snug">
                      {article.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-wrap gap-1.5">
                        {article.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSearchParams({ tag: tag.toLowerCase() })
                              scrollToTop()
                            }}
                            className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors ml-auto flex items-center gap-1">
                        Lire <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
