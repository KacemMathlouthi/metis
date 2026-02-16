/**
 * 404 Not Found page.
 */

import { Home, ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PixelBlast from '@/components/ui/PixelBlast';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Check if there's history to go back to (more than just current page)
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // No useful history, go to home
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div
      className="landing relative flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: 'var(--metis-cream)' }}
    >
      {/* Animated background */}
      <div className="fixed inset-0 z-0" style={{ width: '100vw', height: '100vh' }}>
        <PixelBlast
          variant="triangle"
          pixelSize={6}
          color="#2A0E06"
          patternScale={3}
          patternDensity={0.7}
          pixelSizeJitter={0.4}
          enableRipples
          rippleSpeed={0.5}
          rippleThickness={0.2}
          rippleIntensityScale={2}
          liquid
          liquidStrength={0.15}
          liquidRadius={1.5}
          liquidWobbleSpeed={6}
          speed={0.5}
          edgeFade={0.15}
          transparent
        />
      </div>

      {/* 404 Card */}
      <Card className="relative z-10 w-full max-w-lg border-4 border-black bg-[var(--metis-pastel-1)] shadow-[12px_12px_0px_0px_var(--metis-red)]">
        <CardContent className="p-10">
          {/* Giant 404 */}
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-lg border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_#000]">
              <Zap className="h-12 w-12" />
            </div>
            <h1 className="landing-display mb-2 text-8xl font-black tracking-tighter text-[var(--metis-red)]">
              404
            </h1>
            <h2 className="landing-display text-2xl font-black uppercase">Page Not Found</h2>
          </div>

          {/* Message */}
          <div className="mb-6 rounded border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000]">
            <p className="text-center font-semibold">
              Oops! Looks like this page got lost in the code review.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleGoBack}
              className="flex-1 border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000]"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex-1 border-2 border-black bg-[var(--metis-orange)] text-white shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000]"
              size="lg"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};