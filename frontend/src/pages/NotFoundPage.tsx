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

  return (
    <div
      className="relative flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: '#FEF3F2' }}
    >
      {/* Animated background */}
      <div className="fixed inset-0 z-0" style={{ width: '100vw', height: '100vh' }}>
        <PixelBlast
          variant="triangle"
          pixelSize={6}
          color="#F472B6"
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
      <Card className="relative z-10 w-full max-w-lg border-4 border-black bg-[#F472B6] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-10">
          {/* Giant 404 */}
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-lg border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Zap className="h-12 w-12" />
            </div>
            <h1 className="mb-2 text-8xl font-black tracking-tighter">404</h1>
            <h2 className="text-2xl font-black">PAGE NOT FOUND</h2>
          </div>

          {/* Message */}
          <div className="mb-6 rounded border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-center font-bold">
              Oops! Looks like this page got lost in the code review.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => navigate(-1)}
              className="flex-1 border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="flex-1 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              size="lg"
            >
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
