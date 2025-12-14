/**
 * Repository Management Page.
 *
 * Allows users to view their GitHub installations, enable/disable
 * code reviews for repositories, and configure review settings.
 */

import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Settings, CheckCircle2, XCircle, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import type { GitHubInstallation, Installation, InstallationConfig } from '@/types/api';
import { useRepository } from '@/contexts/RepositoryContext';

export const RepositoriesPage = () => {
  const { refetchInstallations } = useRepository();
  const [githubInstallations, setGithubInstallations] = useState<GitHubInstallation[]>([]);
  const [enabledInstallations, setEnabledInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch both GitHub installations and enabled installations
      const [github, enabled] = await Promise.all([
        apiClient.getGitHubInstallations(),
        apiClient.listInstallations(false), // Get all, not just active
      ]);

      setGithubInstallations(github);
      setEnabledInstallations(enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch installations');
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      const result = await apiClient.syncInstallations();
      setEnabledInstallations(result.installations);
      await refetchInstallations();

      // Show success message
      alert(`Synced ${result.synced} installations (${result.created} new, ${result.updated} updated)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleEnable = async (
    githubInstallationId: number,
    repository: string,
    accountType: 'USER' | 'ORGANIZATION',
    accountName: string
  ) => {
    try {
      const defaultConfig: InstallationConfig = {
        sensitivity: 'MEDIUM',
        custom_instructions: '',
        ignore_patterns: [],
        auto_review_enabled: true,
      };

      await apiClient.enableRepository({
        github_installation_id: githubInstallationId,
        repository,
        account_type: accountType,
        account_name: accountName,
        config: defaultConfig,
      });

      // Refresh data
      await fetchData();
      await refetchInstallations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to enable repository');
    }
  };

  const handleDisable = async (installationId: string) => {
    if (!confirm('Disable code reviews for this repository?')) {
      return;
    }

    try {
      await apiClient.disableInstallation(installationId);
      await fetchData();
      await refetchInstallations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to disable repository');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to check if a repo is enabled
  const isRepoEnabled = (repoFullName: string) => {
    return enabledInstallations.some(
      (inst) => inst.repository === repoFullName && inst.is_active
    );
  };

  const getEnabledInstallation = (repoFullName: string) => {
    return enabledInstallations.find((inst) => inst.repository === repoFullName);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Repository Management</h1>
          <p className="text-sm text-gray-600">
            Enable code reviews for your GitHub repositories
          </p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="border-2 border-black bg-[#FCD34D] font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync from GitHub'}
        </Button>
      </div>

      {error && (
        <Card className="border-2 border-red-600 bg-red-50">
          <CardContent className="pt-6">
            <p className="font-bold text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-3 font-bold">Loading repositories...</span>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* GitHub Installations */}
          {githubInstallations.map((installation) => (
            <Card
              key={installation.id}
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <img
                        src={installation.account.avatar_url}
                        alt={installation.account.login}
                        className="h-10 w-10 rounded-lg"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black">
                        {installation.account.login}
                      </CardTitle>
                      <CardDescription className="font-bold">
                        {installation.account.type} · {installation.repositories.length}{' '}
                        repositories
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="neutral"
                    className="border-2 border-black bg-white font-bold"
                  >
                    Installation #{installation.id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {installation.repositories.map((repo) => {
                    const enabled = isRepoEnabled(repo.full_name);
                    const enabledInst = getEnabledInstallation(repo.full_name);

                    return (
                      <div
                        key={repo.id}
                        className={`flex items-center justify-between rounded border-2 p-3 ${
                          enabled
                            ? 'border-green-600 bg-green-50'
                            : 'border-black bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {enabled ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                          <div>
                            <p className="font-bold">{repo.full_name}</p>
                            <p className="text-xs text-gray-600">
                              {repo.description || 'No description'}
                              {repo.language && (
                                <Badge
                                  variant="neutral"
                                  className="ml-2 border border-black text-xs"
                                >
                                  {repo.language}
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {enabled && enabledInst ? (
                            <>
                              <Button
                                size="sm"
                                variant="neutral"
                                className="border-2 border-black font-bold"
                                onClick={() =>
                                  alert('Config modal coming soon')
                                }
                              >
                                <Settings className="mr-1 h-4 w-4" />
                                Configure
                              </Button>
                              <Button
                                size="sm"
                                variant="neutral"
                                className="border-2 border-red-600 bg-red-50 font-bold text-red-600 hover:bg-red-100"
                                onClick={() => handleDisable(enabledInst.id)}
                              >
                                Disable
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="border-2 border-black bg-[#4ADE80] font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                              onClick={() =>
                                handleEnable(
                                  installation.id,
                                  repo.full_name,
                                  installation.account.type === 'Organization'
                                    ? 'ORGANIZATION'
                                    : 'USER',
                                  installation.account.login
                                )
                              }
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              Enable Reviews
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {githubInstallations.length === 0 && !loading && (
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="py-12 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border-4 border-black bg-[#F472B6] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Code2 className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-black">No GitHub Installations Found</h3>
                <p className="mb-6 text-sm text-gray-600">
                  Install the Metis GitHub App on your repositories to get started
                </p>
                <Button
                  className="border-2 border-black bg-[#FCD34D] font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  onClick={() =>
                    window.open(
                      'https://github.com/apps/metis-ai-testing/installations/new',
                      '_blank'
                    )
                  }
                >
                  Install GitHub App
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
