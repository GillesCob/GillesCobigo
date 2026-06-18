import { useQuery } from '@tanstack/react-query'
import { fetchGitHubStats, type IGitHubStats } from '@/services/github'

export function useGitHubStats(username = 'gillescobigo') {
  return useQuery<IGitHubStats>({
    queryKey: ['github-stats', username],
    queryFn: () => fetchGitHubStats(username),
    staleTime: 5 * 60 * 1000,
  })
}
