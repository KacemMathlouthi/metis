/**
 * Protected route wrapper that requires authentication.
 *
 * Redirects to login page if user is not authenticated.
 * Shows loading state while checking authentication status.
 * Fetches user data when mounted to verify authentication.
 */

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, refetch } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  // Fetch user when protected route mounts
  useEffect(() => {
    refetch().finally(() => {
      setHasChecked(true);  // Mark that we've checked auth
    });
  }, []);

  // Show loading state while checking auth
  if (!hasChecked || loading) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--metis-cream)]">
        <div className="w-full max-w-sm space-y-4">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center border-4 border-black bg-gradient-to-br from-[var(--metis-yellow)] via-[var(--metis-orange-light)] to-[var(--metis-red)] text-4xl font-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              M
            </div>
          </div>
          {/* Spinning dots */}
          <div className="flex justify-center gap-2">
            <div className="h-3 w-3 animate-bounce rounded-sm border-2 border-black bg-[var(--metis-yellow)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" style={{ animationDelay: '0s' }}></div>
            <div className="h-3 w-3 animate-bounce rounded-sm border-2 border-black bg-[var(--metis-orange-light)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-3 w-3 animate-bounce rounded-sm border-2 border-black bg-[var(--metis-red)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (hasChecked && !user) {
    // Not authenticated - redirect to login
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
