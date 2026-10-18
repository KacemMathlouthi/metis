import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  /** Shown in the header bar, e.g. "bash" or "backend/.env". */
  title?: string;
  className?: string;
}

const COPIED_RESET_MS = 2000;

export function CodeBlock({ code, title = 'bash', className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const trimmed = code.trim();

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
    } catch (error) {
      // Clipboard access can be denied (permissions, insecure context); the code stays selectable.
      console.warn('Copy to clipboard failed', error);
    }
  };

  return (
    <div
      className={cn(
        'my-6 overflow-hidden border-4 border-black bg-[#0b0b0b] text-white shadow-[6px_6px_0px_0px_var(--metis-orange)]',
        className
      )}
    >
      <div className="flex items-center justify-between border-b-2 border-white/20 bg-black px-4 py-2">
        <span className="font-mono text-xs font-semibold text-white/70">{title}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 border border-white/30 px-2 py-1 font-mono text-xs font-semibold text-white/80 hover:border-white hover:text-white"
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        <code>{trimmed}</code>
      </pre>
    </div>
  );
}
