import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ArticleCard from '@/components/articles/ArticleCard'
import { useArticles } from '@/hooks/useArticles'

export default function ArticlesSection() {
  const { data: articles, isLoading, isError } = useArticles(1, 3)

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
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        )}
        {isError && (
          <p className="text-muted-foreground text-sm text-center py-8">
            Les articles ne sont pas disponibles pour l&apos;instant.
          </p>
        )}
        {articles && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
