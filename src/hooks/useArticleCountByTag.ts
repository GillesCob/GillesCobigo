import { getArticles } from "@/lib/articles";

export function useArticleCountByTag(tag: string): number {
  return getArticles().filter((article) =>
    article.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  ).length;
}
