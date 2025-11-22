import { useState, useEffect } from 'react';
import config from '@/config';

// Track if GitHub API is disabled due to rate limits (persists for session)
let githubAPIDisabled = false;

interface GitHubRelease {
    tag_name: string;
    name: string;
    published_at: string;
}

export function useAppVersion() {
    // Use config version as initial state (reads from package.json at build time)
    const [version, setVersion] = useState<string>(config.app.version);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVersion() {
            try {
                // Check if GitHub API is disabled (config or rate limit)
                if (!config.features.enableGitHubAPI || githubAPIDisabled) {
                    setVersion(config.app.version);
                    setLoading(false);
                    return;
                }

                // Extract owner and repo from repoUrl
                const repoUrl = config.github.repoUrl;
                const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
                if (!match) {
                    // Fallback to config version (from package.json)
                    setVersion(config.app.version);
                    setLoading(false);
                    return;
                }

                const [, owner, repo] = match;

                // Fetch latest release - catch errors silently
                const controller = new AbortController();
                const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                    },
                    signal: controller.signal,
                }).catch(() => {
                    // Silently catch fetch errors
                    return null;
                });

                if (response && response.ok) {
                    const release: GitHubRelease = await response.json();
                    // Extract version from tag (remove 'v' prefix if present)
                    const versionFromTag = release.tag_name.replace(/^v/, '');
                    setVersion(versionFromTag);
                } else if (response && response.status === 404) {
                    // No releases yet, try to get latest tag
                    const tagsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/tags?per_page=1`, {
                        signal: controller.signal,
                    }).catch(() => null);
                    if (tagsResponse && tagsResponse.ok) {
                        const tags = await tagsResponse.json();
                        if (Array.isArray(tags) && tags.length > 0) {
                            const versionFromTag = tags[0].name.replace(/^v/, '');
                            setVersion(versionFromTag);
                        } else {
                            // Fallback to config version (from package.json)
                            setVersion(config.app.version);
                        }
                    } else {
                        // Fallback to config version (from package.json)
                        setVersion(config.app.version);
                    }
                } else {
                    // Handle rate limiting - disable API for this session if 403/429
                    if (response && (response.status === 403 || response.status === 429)) {
                        githubAPIDisabled = true;
                    }
                    // Any error (403, 429, network, etc.) - use config version silently
                    setVersion(config.app.version);
                }
            } catch (error) {
                // Silently handle all errors - use config version
                setVersion(config.app.version);
            } finally {
                setLoading(false);
            }
        }

        fetchVersion();

        // Cleanup function
        return () => {
            // AbortController cleanup is handled by fetch signal
        };
    }, []);

    return { version, loading };
}
