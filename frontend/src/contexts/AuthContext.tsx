/**
 * Authentication context for managing user auth state across the app.
 *
 * Provides current user data, loading state, and authentication methods.
 * Automatically fetches user on mount and provides logout functionality.
 * Use the useAuth hook to access auth state in any component.
 */

import React, { createContext, useContext, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await apiClient.getMe();
      setUser(userData);
    } catch (err) {
      // 401 is expected when not logged in
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Don't fetch on mount - only ProtectedRoute will call refetch()
  return (
    <AuthContext.Provider value={{ user, loading, error, logout, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context.
 *
 * Returns current user, loading state, and auth methods.
 * Throws error if used outside AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
