import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getArticles } from '@/lib/articles'
import ArticleSidebar from '@/components/articles/ArticleSidebar'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Articles() {
  const articles = getArticles()

  return (
    <div className="flex min-h-screen pt-16">
      <ArticleSidebar articles={articles} />

      <main className="flex-1 min-w-0 px-6 lg:px-12 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Journal</h1>
          <p className="text-muted-foreground mb-12">
            Notes de parcours, retours d&apos;experience, explorations techniques.
          </p>

          {articles.length === 0 ? (
            <p className="text-muted-foreground">Aucun article pour l&apos;instant.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {articles.map((article) => (
                <article key={article.slug} className="py-8 first:pt-0">
                  <Link to={`/articles/${article.slug}`} className="group block">
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
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {tag}
                          </span>
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
