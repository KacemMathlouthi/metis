/**
 * Repository Management Page.
 *
 * Allows users to view their GitHub installations, enable/disable
 * code reviews for repositories, and configure review settings.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Settings, CheckCircle2, XCircle, Code2, ExternalLink, AlertCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { getLanguageIcon, truncateText } from '@/lib/language-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiClient } from '@/lib/api-client';
import type { GitHubInstallation, Installation, InstallationConfig } from '@/types/api';
import { useRepository } from '@/contexts/RepositoryContext';

export const RepositoriesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { refetchInstallations } = useRepository();
  const [githubInstallations, setGithubInstallations] = useState<GitHubInstallation[]>([]);
  const [enabledInstallations, setEnabledInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDisable, setConfirmDisable] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

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

      // Show success toast
      toast.success(
        'Installations Synced',
        `${result.synced} installations synced (${result.created} new, ${result.updated} updated)`
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMsg);
      toast.error('Sync Failed', errorMsg);
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
    const loadingId = toast.loading('Enabling repository...', `Setting up code reviews for ${repository}`);

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

      toast.dismiss(loadingId);
      toast.success('Repository Enabled', `Code reviews enabled for ${repository}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to enable repository';
      toast.dismiss(loadingId);
      toast.error('Enable Failed', errorMsg);
    }
  };

  const handleDisable = async (installationId: string) => {
    const loadingId = toast.loading('Disabling repository...', 'Removing code review configuration');

    try {
      await apiClient.disableInstallation(installationId);
      await fetchData();
      await refetchInstallations();

      toast.dismiss(loadingId);
      toast.success('Repository Disabled', 'Code reviews have been disabled for this repository');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to disable repository';
      toast.dismiss(loadingId);
      toast.error('Disable Failed', errorMsg);
    } finally {
      setConfirmDisable({ open: false, id: null });
    }
  };

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchData();
      hasFetchedRef.current = true;
    }
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
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="landing-display text-3xl font-black">Repository Management</h1>
          <p className="text-sm text-black/60 mt-1">
            Enable code reviews for your GitHub repositories
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="neutral"
            className="border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync from GitHub'}
          </Button>
          <Button
            onClick={() =>
              window.open(
                'https://github.com/apps/metis-ai-testing/installations/new',
                '_blank'
              )
            }
            className="border-2 border-black bg-[var(--metis-orange)] font-bold text-white shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] transition-all"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Install on GitHub
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
              className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
                            ? 'border-[var(--metis-orange-dark)] bg-[var(--metis-pastel-4)]'
                            : 'border-black bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Language Icon with white background */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {getLanguageIcon(repo.language)}
                          </div>

                          {/* Status Icon */}
                          <div className="flex-shrink-0">
                            {enabled ? (
                              <CheckCircle2 className="h-5 w-5 text-[var(--metis-orange-dark)]" />
                            ) : (
                              <XCircle className="h-5 w-5 text-black/40" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm">{repo.full_name}</p>
                            <div className="flex items-center gap-2">
                              {/* Language badge first */}
                              {repo.language && (
                                <Badge
                                  variant="neutral"
                                  className="border border-black text-xs flex-shrink-0"
                                >
                                  {repo.language}
                                </Badge>
                              )}
                              {/* Description - truncated to 40 chars */}
                              <span className="text-xs text-black/40">•</span>
                              <p className="text-xs text-black/60 truncate">
                                {truncateText(repo.description, 60)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {enabled && enabledInst ? (
                            <>
                              <Button
                                size="sm"
                                variant="neutral"
                                className="border-2 border-black font-bold"
                                onClick={() => navigate('/dashboard/ai-review')}
                              >
                                <Settings className="mr-1 h-4 w-4" />
                                Configure
                              </Button>
                              <Button
                                size="sm"
                                variant="neutral"
                                className="border-2 border-[var(--metis-red)] bg-[var(--metis-pastel-red)] font-bold text-[var(--metis-red)] hover:bg-[var(--metis-pastel-1)]"
                                onClick={() => setConfirmDisable({ open: true, id: enabledInst.id })}
                              >
                                Disable
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="border-2 border-black bg-[var(--metis-orange)] font-bold text-white shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000]"
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
            <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="py-12 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border-4 border-black bg-[var(--metis-pastel-1)] shadow-[4px_4px_0px_0px_#000]">
                    <Code2 className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-black">No GitHub Installations Found</h3>
                <p className="mb-6 text-sm text-black/60">
                  Install the Metis GitHub App on your repositories to get started
                </p>
                <Button
                  className="border-2 border-black bg-[var(--metis-orange)] font-bold text-white shadow-[4px_4px_0px_0px_#000]"
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

      {/* Confirmation Dialog for Disabling */}
      <AlertDialog
        open={confirmDisable.open}
        onOpenChange={(open) => setConfirmDisable({ open, id: confirmDisable.id })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Code Reviews?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop automatic code reviews for this repository. You can re-enable it
              anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDisable.id && handleDisable(confirmDisable.id)}
              className="bg-black text-white border-black"
            >
              Disable Reviews
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
