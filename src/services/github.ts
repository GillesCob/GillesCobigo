import axios from "axios";

export interface IGitHubStats {
  followers: number;
  publicRepos: number;
  lastCommitDate: string | null;
  lastRepo: string | null;
}

interface IGitHubUser {
  followers: number;
  public_repos: number;
}

interface IGitHubEvent {
  type: string;
  created_at: string;
  repo: {
    name: string;
  };
}

const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME ?? "GillesCob";
const GITHUB_HEADERS = import.meta.env.VITE_GITHUB_TOKEN
  ? { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` }
  : {};

export async function fetchGitHubStats(): Promise<IGitHubStats> {
  const [userRes, eventsRes] = await Promise.all([
    axios.get<IGitHubUser>(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers: GITHUB_HEADERS }),
    axios.get<IGitHubEvent[]>(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=10`, {
      headers: GITHUB_HEADERS,
    }),
  ]);

  const pushEvent = eventsRes.data.find((e) => e.type === "PushEvent");

  return {
    followers: userRes.data.followers,
    publicRepos: userRes.data.public_repos,
    lastCommitDate: pushEvent?.created_at ?? null,
    lastRepo: pushEvent?.repo.name.split("/")[1] ?? null,
  };
}
