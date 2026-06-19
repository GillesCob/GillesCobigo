export interface IArticleFrontmatter {
  title: string
  date: string
  description: string
  tags: string[]
}

export interface IHeading {
  level: 2 | 3
  text: string
  id: string
}

export interface IArticleMeta extends IArticleFrontmatter {
  slug: string
  headings: IHeading[]
}

interface IFrontmatterExport {
  title: string
  date: string
  description: string
  tags: string[]
  headings?: IHeading[]
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const mdxModules = import.meta.glob('/content/articles/[^_]*.mdx', {
  eager: true,
}) as Record<string, { frontmatter: IFrontmatterExport }>

export function getArticles(): IArticleMeta[] {
  return Object.entries(mdxModules)
    .map(([path, mod]) => {
      const slug = path.replace('/content/articles/', '').replace('.mdx', '')
      const fm = mod.frontmatter
      return {
        slug,
        title: fm.title,
        date: fm.date,
        description: fm.description,
        tags: fm.tags ?? [],
        headings: fm.headings ?? [],
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getArticleBySlug(slug: string): IArticleMeta | undefined {
  return getArticles().find((a) => a.slug === slug)
}
