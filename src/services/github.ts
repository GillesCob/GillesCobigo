import axios from 'axios'

export interface IGitHubStats {
  followers: number
  publicRepos: number
  lastCommitDate: string | null
  lastRepo: string | null
}

interface IGitHubUser {
  followers: number
  public_repos: number
}

interface IGitHubEvent {
  type: string
  created_at: string
  repo: {
    name: string
  }
}

export async function fetchGitHubStats(username: string): Promise<IGitHubStats> {
  const [userRes, eventsRes] = await Promise.all([
    axios.get<IGitHubUser>(`https://api.github.com/users/${username}`),
    axios.get<IGitHubEvent[]>(
      `https://api.github.com/users/${username}/events/public?per_page=10`,
    ),
  ])

  const pushEvent = eventsRes.data.find((e) => e.type === 'PushEvent')

  return {
    followers: userRes.data.followers,
    publicRepos: userRes.data.public_repos,
    lastCommitDate: pushEvent?.created_at ?? null,
    lastRepo: pushEvent?.repo.name.split('/')[1] ?? null,
  }
}
