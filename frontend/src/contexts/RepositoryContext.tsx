/**
 * Repository/Workspace Context for managing selected repository state.
 *
 * Provides global state for the currently selected repository/installation.
 * Used by sidebar selector and dashboard pages to filter data by repo.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
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

const RepositoryContext = createContext<RepositoryContextType | undefined>(
  undefined
);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const [selectedRepo, setSelectedRepo] = useState<Installation | null>(null);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstallations = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.listInstallations(true); // active only
      setInstallations(data);

      // Auto-select first installation if none selected
      if (!selectedRepo && data.length > 0) {
        setSelectedRepo(data[0]);
        // Store in localStorage for persistence
        localStorage.setItem(
          'selectedRepoId',
          data[0].id
        );
      } else if (selectedRepo) {
        // Update selected repo if it's in the list (in case config changed)
        const updated = data.find((inst) => inst.id === selectedRepo.id);
        if (updated) {
          setSelectedRepo(updated);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch installations');
      console.error('Failed to fetch installations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Restore selected repo from localStorage on mount
  useEffect(() => {
    const savedRepoId = localStorage.getItem('selectedRepoId');
    if (savedRepoId) {
      // Will be populated after fetchInstallations
    }
    fetchInstallations();
  }, []);

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
