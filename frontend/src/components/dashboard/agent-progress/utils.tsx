import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';

export function formatDateTime(value: string | null): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return 'N/A';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function parseJsonSafely(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function guessCodeLanguage(path?: string): string {
  if (!path) return 'text';
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
  if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
  if (path.endsWith('.py')) return 'python';
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.md')) return 'markdown';
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.yml') || path.endsWith('.yaml')) return 'yaml';
  return 'text';
}

export function toPrettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-pre:overflow-x-auto prose-pre:rounded-md prose-pre:border prose-pre:border-black/20 prose-pre:bg-black prose-pre:p-3 prose-pre:text-xs prose-pre:text-gray-50">
      <Streamdown
        isAnimating={false}
        plugins={{ code }}
        shikiTheme={['github-light', 'github-dark']}
      >
        {markdown}
      </Streamdown>
    </div>
  );
}

export function CodeBlock({ code, language = 'text' }: { code: string; language?: string }) {
  const safeCode = code.replace(/```/g, '``\\`');
  const markdown = `\`\`\`${language}\n${safeCode}\n\`\`\``;
  return <MarkdownContent markdown={markdown} />;
}
