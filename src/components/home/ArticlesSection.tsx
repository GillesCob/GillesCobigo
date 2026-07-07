import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getArticles } from '@/lib/articles'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ArticlesSection() {
  const articles = getArticles().slice(0, 3)

  if (articles.length === 0) return null

  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold">Articles</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/articles">
              Voir tout <ArrowRight size={14} className="ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={`/articles/${article.slug}`}
              className="group flex flex-col rounded-xl border border-border overflow-hidden hover:border-border/60 transition-colors bg-card p-5"
            >
              <time className="text-xs font-mono text-muted-foreground/70 uppercase tracking-widest">
                {formatDate(article.date)}
              </time>
              <h3 className="font-medium text-sm leading-snug mt-2 line-clamp-2 group-hover:text-muted-foreground transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-3 mt-2">{article.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
