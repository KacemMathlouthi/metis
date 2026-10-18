import { Capabilities } from '@/components/home/Capabilities';
import { Faqs } from '@/components/home/Faqs';
import { FeatureDeck } from '@/components/home/FeatureDeck';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Marquee } from '@/components/home/Marquee';
import { ReviewTerminal } from '@/components/home/ReviewTerminal';
import { SelfHostCta } from '@/components/home/SelfHostCta';
import { Stack } from '@/components/home/Stack';

export function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <FeatureDeck />
      <Capabilities />
      <HowItWorks />
      <ReviewTerminal />
      <Stack />
      <Faqs />
      <SelfHostCta />
    </>
  );
}
