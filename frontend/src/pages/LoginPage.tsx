/**
 * Login page that redirects to GitHub OAuth flow.
 */

import { useEffect } from 'react';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PixelBlast from '@/components/ui/PixelBlast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const LoginPage = () => {
  useEffect(() => {
    document.title = 'Metis — Login';
  }, []);

  const handleLogin = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/login/github`;
  };

  return (
    <div
      className="landing relative flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: 'var(--metis-cream)' }}
    >
      {/* Animated background */}
      <div className="fixed inset-0 z-0" style={{ width: '100vw', height: '100vh' }}>
        <PixelBlast
          variant="square"
          pixelSize={5}
          color="#2A0E06"
          patternScale={2.5}
          patternDensity={0.9}
          pixelSizeJitter={0.3}
          enableRipples
          rippleSpeed={0.35}
          rippleThickness={0.15}
          rippleIntensityScale={0.4}
          liquid
          liquidStrength={0.08}
          liquidRadius={0.5}
          liquidWobbleSpeed={0.8}
          speed={0.2}
          edgeFade={0.2}
          transparent
        />
      </div>

      {/* Login card */}
      <Card className="relative z-10 w-full max-w-md border-2 border-black bg-white shadow-[10px_10px_0px_0px_var(--metis-orange-dark)]">
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <h1 className="landing-display mb-2 text-4xl font-black">Metis</h1>
          </div>

          <div className="mb-6 rounded border-2 border-black bg-[var(--metis-pastel-2)] p-4">
            <p className="text-sm font-semibold">
              Sign in with your GitHub account to start reviewing pull requests with AI-powered
              insights.
            </p>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full border-2 border-black bg-[var(--metis-orange)] text-white shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000]"
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            Login with GitHub
          </Button>

          <p className="mt-4 text-center text-xs text-black/60">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
