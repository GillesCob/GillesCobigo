import { ExternalLink } from 'lucide-react'
import type { IArticle } from '@/services/wordpress'

interface IArticleCardProps {
  article: IArticle
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ArticleCard({ article }: IArticleCardProps) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-border overflow-hidden hover:border-border/60 transition-colors bg-card"
    >
      {article.featuredImage && (
        <div className="h-40 overflow-hidden">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-medium text-sm leading-snug line-clamp-2"
            dangerouslySetInnerHTML={{ __html: article.title }}
          />
          <ExternalLink size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-3">{article.excerpt}</p>
        <p className="text-xs text-muted-foreground mt-auto pt-2 border-t border-border">
          {formatDate(article.date)}
        </p>
      </div>
    </a>
  )
}
