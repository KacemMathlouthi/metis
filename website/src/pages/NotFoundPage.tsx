import { ArrowLeft, BookOpen } from 'lucide-react';
import { ButtonLink } from '@/components/ui/ButtonLink';

export function NotFoundPage() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-display-tight mb-4 text-8xl font-black text-[var(--metis-orange)] [text-shadow:6px_6px_0_#000] md:text-9xl">
        404
      </p>
      <h1 className="font-display mb-4 text-3xl font-black uppercase md:text-4xl">
        This page didn't pass review
      </h1>
      <p className="mb-10 max-w-md font-semibold text-black/70">
        The page you are looking for doesn't exist or has moved.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <ButtonLink href="/" variant="neutral">
          <ArrowLeft /> BACK HOME
        </ButtonLink>
        <ButtonLink href="/docs">
          READ THE DOCS <BookOpen />
        </ButtonLink>
      </div>
    </section>
  );
}
