import { useState, useEffect, type ComponentType } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { ArrowLeft } from 'lucide-react'
import { getArticles, getArticleBySlug, slugify } from '@/lib/articles'
import ArticleSidebar from '@/components/articles/ArticleSidebar'
import ArticleToc from '@/components/articles/ArticleToc'

const mdxModules = import.meta.glob('/content/articles/[^_]*.mdx')

const mdxComponents = {
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 id={slugify(String(children ?? ''))} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 id={slugify(String(children ?? ''))} {...props}>
      {children}
    </h3>
  ),
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [Content, setContent] = useState<ComponentType | null>(null)

  const articles = getArticles()
  const meta = slug ? getArticleBySlug(slug) : undefined

  useEffect(() => {
    if (!slug) return
    setContent(null)
    const path = `/content/articles/${slug}.mdx`
    const loader = mdxModules[path]
    if (loader) {
      loader().then((mod) => setContent(() => (mod as { default: ComponentType }).default))
    }
  }, [slug])

  if (!meta) return <Navigate to="/articles" replace />

  return (
    <div className="flex min-h-screen pt-16">
      <ArticleSidebar articles={articles} activeSlug={slug} />

      <main className="flex-1 min-w-0 px-6 lg:px-12 py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/articles"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Tous les articles
          </Link>

          <header className="mb-10">
            <h1 className="text-3xl font-bold leading-tight mb-3">{meta.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{formatDate(meta.date)}</span>
              {meta.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {Content ? (
            <MDXProvider components={mdxComponents}>
              <article className="prose prose-neutral dark:prose-invert max-w-none">
                <Content />
              </article>
            </MDXProvider>
          ) : (
            <div className="flex flex-col gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />
              ))}
            </div>
          )}
        </div>
      </main>

      <ArticleToc headings={meta.headings} />
    </div>
  )
}
