import { useQuery } from "@tanstack/react-query";
import { fetchGitHubStats, type IGitHubStats } from "@/services/github";

export function useGitHubStats() {
  return useQuery<IGitHubStats>({
    queryKey: ["github-stats"],
    queryFn: fetchGitHubStats,
    staleTime: 5 * 60 * 1000,
  });
}
