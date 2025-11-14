import { useEffect, useState } from 'react';
import config from '@/config';

interface GitHubStats {
  forks: number;
  commits: number;
  issues: number;
  stars?: number;
}

interface UseGitHubStatsOptions {
  owner?: string;
  repo?: string;
}

// Track if GitHub API is disabled due to rate limits (persists for session)
let githubAPIDisabled = false;

export function useGitHubStats(options?: UseGitHubStatsOptions): {
  stats: GitHubStats | null;
  loading: boolean;
  error: string | null;
} {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        // Check if GitHub API is disabled (config or rate limit)
        if (!config.features.enableGitHubAPI || githubAPIDisabled) {
          setStats({ forks: 0, commits: 0, issues: 0 });
          setLoading(false);
          return;
        }

        // Get repo info from config
        const repoUrl = config.github.repoUrl;
        const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

        if (!urlMatch) {
          // Set default values and return early
          setStats({ forks: 0, commits: 0, issues: 0 });
          setLoading(false);
          return;
        }

        const owner = options?.owner || urlMatch[1];
        const repo = options?.repo || urlMatch[2].replace(/\.git$/, '');

        // Fetch repo info (includes forks and stars)
        // Use AbortController to prevent errors from being logged
        const controller = new AbortController();
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
          signal: controller.signal,
        }).catch(() => {
          // Silently catch fetch errors (network issues, CORS, etc.)
          return null;
        });

        if (!repoResponse || !repoResponse.ok) {
          // Handle rate limiting - disable API for this session if 403/429
          if (repoResponse && (repoResponse.status === 403 || repoResponse.status === 429)) {
            githubAPIDisabled = true;
          }
          setStats({ forks: 0, commits: 0, issues: 0 });
          setLoading(false);
          return;
        }

        const repoData = await repoResponse.json();

        // Fetch open issues count (excluding pull requests)
        // Use GitHub Search API to get only issues, not PRs
        let issuesCount = 0;
        try {
          const issuesResponse = await fetch(
            `https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:issue+state:open`,
            {
              headers: {
                Accept: 'application/vnd.github.v3+json',
              },
              signal: controller.signal,
            }
          ).catch(() => null);

          if (issuesResponse && issuesResponse.ok) {
            const issuesData = await issuesResponse.json();
            issuesCount = issuesData.total_count || 0;
          } else {
            // Fallback: use repo open_issues_count and try to subtract PRs
            // This is less accurate but better than nothing
            const prsResponse = await fetch(
              `https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:pr+state:open`,
              {
                headers: {
                  Accept: 'application/vnd.github.v3+json',
                },
                signal: controller.signal,
              }
            ).catch(() => null);

            if (prsResponse && prsResponse.ok) {
              const prsData = await prsResponse.json();
              const prsCount = prsData.total_count || 0;
              issuesCount = Math.max(0, (repoData.open_issues_count || 0) - prsCount);
            } else {
              // Last resort: use open_issues_count (includes PRs, but better than 0)
              issuesCount = repoData.open_issues_count || 0;
            }
          }
        } catch (issueError) {
          // Silently handle errors - fallback to repo's open_issues_count
          issuesCount = repoData.open_issues_count || 0;
        }

        // For commits, fetch from default branch
        let commitsCount = 0;
        try {
          const defaultBranch = repoData.default_branch || 'main';
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&sha=${defaultBranch}`,
            {
              headers: {
                Accept: 'application/vnd.github.v3+json',
              },
              signal: controller.signal,
            }
          ).catch(() => null);

          if (commitsResponse && commitsResponse.ok) {
            const commitsData = await commitsResponse.json();
            commitsCount = commitsData.length;

            // Check if there are more commits by looking at Link header
            const linkHeader = commitsResponse.headers.get('Link');
            if (linkHeader && linkHeader.includes('rel="next"')) {
              // There are more commits, show "100+"
              commitsCount = 100;
            }
          }
        } catch (commitError) {
          // If commit fetch fails, just use 0 - silently
        }

        setStats({
          forks: repoData.forks_count || 0,
          commits: commitsCount,
          issues: issuesCount,
          stars: repoData.stargazers_count || 0,
        });
      } catch (err) {
        // Silently handle all errors - set default values
        setStats({ forks: 0, commits: 0, issues: 0 });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    // Cleanup function to abort any pending requests
    return () => {
      // AbortController cleanup is handled by fetch signal
    };
  }, [options?.owner, options?.repo]);

  return { stats, loading, error };
}
