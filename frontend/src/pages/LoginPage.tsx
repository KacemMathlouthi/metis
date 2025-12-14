/**
 * Login page that redirects to GitHub OAuth flow.
 */

import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PixelBlast from '@/components/ui/PixelBlast';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const LoginPage = () => {
  const handleLogin = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/login/github`;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: '#fffef8ff' }}>
      {/* Animated background */}
      <div className="fixed inset-0 z-0" style={{ width: '100vw', height: '100vh' }}>
        <PixelBlast
          variant="square"
          pixelSize={5}
          color="#A16207"
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
      <Card className="relative z-10 w-full max-w-md border-2 border-black bg-[#FCD34D] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-4xl font-black">Metis</h1>
          </div>

          <div className="mb-6 rounded border-2 border-black bg-gray-50 p-4">
            <p className="text-sm">
              Sign in with your GitHub account to start reviewing pull requests
              with AI-powered insights.
            </p>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            Login with GitHub
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
