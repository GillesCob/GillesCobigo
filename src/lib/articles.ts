export interface IArticleFrontmatter {
  title: string;
  date: string;
  description: string;
  tags: string[];
  post?: string;
}

export interface IHeading {
  level: 2 | 3;
  text: string;
  id: string;
}

export interface IArticleMeta extends IArticleFrontmatter {
  slug: string;
  headings: IHeading[];
}

interface IFrontmatterExport {
  title: string;
  date: string;
  description: string;
  tags: string[];
  headings?: IHeading[];
  post?: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const mdxModules = import.meta.glob("/content/articles/**/*.mdx", {
  eager: true,
}) as Record<string, { frontmatter: IFrontmatterExport }>;

export function isScheduled(dateStr: string): boolean {
  return new Date(dateStr) > new Date();
}

interface IGetArticlesOptions {
  includeScheduled?: boolean;
}

export function getArticles(options?: IGetArticlesOptions): IArticleMeta[] {
  const includeScheduled = options?.includeScheduled ?? false;
  return Object.entries(mdxModules)
    .map(([path, mod]) => {
      const slug = path.replace("/content/articles/", "").replace(".mdx", "");
      const fm = mod.frontmatter;
      return {
        slug,
        title: fm.title,
        date: fm.date,
        description: fm.description,
        tags: fm.tags ?? [],
        headings: fm.headings ?? [],
        post: fm.post,
      };
    })
    .filter((article) => includeScheduled || !isScheduled(article.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticleBySlug(slug: string, options?: IGetArticlesOptions): IArticleMeta | undefined {
  return getArticles(options).find((a) => a.slug === slug);
}
