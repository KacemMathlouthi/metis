/**
 * OAuth callback page that handles GitHub OAuth redirect.
 *
 * GitHub redirects here after user authorization with a code parameter.
 * This page sends the code to backend which completes the OAuth flow,
 * sets authentication cookies, and redirects to dashboard.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PixelBlast from '@/components/ui/PixelBlast';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');

      if (!code) {
        setError('No authorization code received');
        return;
      }

      try {
        // Send code to backend (backend handles token exchange)
        const response = await fetch(
          `${API_BASE_URL}/auth/callback/github?code=${code}`,
          {
            credentials: 'include', // Receive cookies from backend
            redirect: 'manual', // Don't auto-follow redirects
          }
        );

        if (response.ok || response.type === 'opaqueredirect') {
          // Cookies set by backend, redirect to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          setError('Authentication failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: '#FFFBEB' }}>
        <div className="fixed inset-0 z-0" style={{ width: '100vw', height: '100vh' }}>
          <PixelBlast
            variant="square"
            pixelSize={5}
            color="#A16207"
            patternScale={2.5}
            patternDensity={0.9}
            enableRipples
            transparent
          />
        </div>
        <div className="relative z-10 rounded border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="mb-4 text-2xl font-black text-red-600">
            Authentication Error
          </h2>
          <p className="mb-4">{error}</p>
          <a
            href="/login"
            className="font-bold text-black underline decoration-2 underline-offset-4 hover:text-gray-700"
          >
            Try again →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: '#FFFBEB' }}>
      <div className="fixed inset-0 z-0" style={{ width: '100vw', height: '100vh' }}>
        <PixelBlast
          variant="square"
          pixelSize={5}
          color="#A16207"
          patternScale={2.5}
          patternDensity={0.9}
          enableRipples
          transparent
        />
      </div>
      <div className="relative z-10 rounded border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="mb-4 text-2xl font-black">Completing login...</h2>
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
          <p className="font-bold">Please wait</p>
        </div>
      </div>
    </div>
  );
};
