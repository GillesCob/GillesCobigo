import { useQuery } from '@tanstack/react-query'
import { fetchArticles, type IArticle } from '@/services/wordpress'

export function useArticles(page = 1, perPage = 6) {
  return useQuery<IArticle[]>({
    queryKey: ['articles', page, perPage],
    queryFn: () => fetchArticles(page, perPage),
    staleTime: 10 * 60 * 1000,
  })
}
