/**
 * Repository/Workspace Context for managing selected repository state.
 *
 * Provides global state for the currently selected repository/installation.
 * Used by sidebar selector and dashboard pages to filter data by repo.
 */

import * as React from 'react';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Installation } from '@/types/api';
import { apiClient } from '@/lib/api-client';

interface RepositoryContextType {
  selectedRepo: Installation | null;
  setSelectedRepo: (repo: Installation | null) => void;
  installations: Installation[];
  loading: boolean;
  error: string | null;
  refetchInstallations: () => Promise<void>;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const [selectedRepo, setSelectedRepo] = useState<Installation | null>(null);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = React.useRef(false); // Prevent duplicate fetches

  const fetchInstallations = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.listInstallations(true); // active only
      setInstallations(data);

      // Restore from localStorage or auto-select first
      const savedRepoId = localStorage.getItem('selectedRepoId');

      if (savedRepoId) {
        // Try to find saved repo in the list
        const saved = data.find((inst) => inst.id === savedRepoId);
        if (saved) {
          setSelectedRepo(saved);
        } else if (data.length > 0) {
          // Saved repo not found, select first
          setSelectedRepo(data[0]);
          localStorage.setItem('selectedRepoId', data[0].id);
        }
      } else if (data.length > 0) {
        // No saved repo, select first
        setSelectedRepo(data[0]);
        localStorage.setItem('selectedRepoId', data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch installations');
      console.error('Failed to fetch installations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch installations only once on mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchInstallations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch data when selected repository changes (for future repo-specific data)
  useEffect(() => {
    if (selectedRepo) {
      // TODO: Trigger refetch of dashboard stats, PRs, issues for this repo
      console.log('Selected repository changed:', selectedRepo.repository);
      // Future: dispatch event or call refetch callbacks
    }
  }, [selectedRepo]);

  // Update localStorage when selection changes
  const handleSetSelectedRepo = (repo: Installation | null) => {
    setSelectedRepo(repo);
    if (repo) {
      localStorage.setItem('selectedRepoId', repo.id);
    } else {
      localStorage.removeItem('selectedRepoId');
    }
  };

  return (
    <RepositoryContext.Provider
      value={{
        selectedRepo,
        setSelectedRepo: handleSetSelectedRepo,
        installations,
        loading,
        error,
        refetchInstallations: fetchInstallations,
      }}
    >
      {children}
    </RepositoryContext.Provider>
  );
}

/**
 * Hook to access repository context.
 * Must be used within RepositoryProvider.
 */
export function useRepository() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error('useRepository must be used within RepositoryProvider');
  }
  return context;
}
