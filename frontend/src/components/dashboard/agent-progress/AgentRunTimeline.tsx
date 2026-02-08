import React from 'react';
import type { ParsedToolPayload, TimelineEntry, ToolCall } from './types';
import { CodeBlock, guessCodeLanguage, MarkdownContent, parseJsonSafely, toPrettyJson } from './utils';

function summarizeArgs(args: unknown): string[] {
  if (!args || typeof args !== 'object') return [];
  const entries = Object.entries(args as Record<string, unknown>).slice(0, 4);
  return entries.map(([key, value]) => {
    if (typeof value === 'string') {
      const compact = value.length > 24 ? `${value.slice(0, 24)}...` : value;
      return `${key}="${compact}"`;
    }
    if (Array.isArray(value)) return `${key}[${value.length}]`;
    if (value && typeof value === 'object') return `${key}{...}`;
    return `${key}=${String(value)}`;
  });
}

function renderToolData(toolName: string | undefined, data: unknown) {
  if (!data || typeof data !== 'object') {
    if (typeof data === 'string' && data.trim()) {
      return <CodeBlock code={data} />;
    }
    return null;
  }

  const payload = data as Record<string, unknown>;

  if (toolName === 'read_file' && typeof payload.content === 'string') {
    const filePath = typeof payload.path === 'string' ? payload.path : undefined;
    return (
      <div className="space-y-2">
        {filePath && (
          <p className="rounded border border-black/20 bg-white px-2 py-1 font-mono text-[11px] text-black/70">
            {filePath}
          </p>
        )}
        <CodeBlock code={payload.content} language={guessCodeLanguage(filePath)} />
      </div>
    );
  }

  if (toolName === 'run_command') {
    const output =
      typeof payload.stdout === 'string'
        ? payload.stdout
        : typeof payload.result === 'string'
          ? payload.result
          : '';

    return (
      <div className="space-y-2">
        {typeof payload.exit_code === 'number' && (
          <p className="text-xs font-semibold text-black/70">Exit code: {payload.exit_code}</p>
        )}
        <CodeBlock code={output || '(no output)'} language="bash" />
      </div>
    );
  }

  if (toolName === 'run_code') {
    const result = typeof payload.result === 'string' ? payload.result : toPrettyJson(payload.result);
    return <CodeBlock code={result} language="text" />;
  }

  return <CodeBlock code={toPrettyJson(payload)} language="json" />;
}

function TimelineAssistantMessage({
  content,
  toolCalls,
}: {
  content: string;
  toolCalls: ToolCall[];
}) {
  return (
    <div className="space-y-3">
      {content.trim() && (
        <MarkdownContent markdown={content} />
      )}

      {toolCalls.length > 0 && (
        <div className="space-y-2">
          {toolCalls.map((tool, index) => {
            const toolName = tool.function?.name || 'unknown_tool';
            const parsedArgs = parseJsonSafely(tool.function?.arguments || '{}');
            const argSummary = summarizeArgs(parsedArgs);

            return (
              <div
                key={tool.id || `${toolName}-${index}`}
                className="rounded-md border border-black/20 bg-[var(--metis-pastel-1)]"
              >
                <div className="flex items-center justify-between gap-2 border-b border-black/15 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[var(--metis-orange-dark)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      TOOL
                    </span>
                    <span className="font-mono text-xs font-semibold text-black">{toolName}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-black/50">#{index + 1}</span>
                </div>
                {argSummary.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-3 pt-2">
                    {argSummary.map((chunk) => (
                      <span
                        key={`${tool.id || toolName}-${chunk}`}
                        className="rounded border border-black/15 bg-white px-1.5 py-0.5 font-mono text-[10px] text-black/70"
                      >
                        {chunk}
                      </span>
                    ))}
                  </div>
                )}
                <details className="px-3 pb-3 pt-2">
                  <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-black/60">
                    TOOL CALL
                  </summary>
                  <div className="pt-2">{renderToolData(undefined, parsedArgs)}</div>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TimelineToolResult({
  entry,
  toolName,
}: {
  entry: TimelineEntry;
  toolName?: string;
}) {
  const parsed = parseJsonSafely(entry.content);
  const payload =
    parsed && typeof parsed === 'object'
      ? (parsed as ParsedToolPayload)
      : ({ data: parsed } as ParsedToolPayload);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-black px-1.5 py-0.5 text-[10px] font-bold text-white">TOOL RESULT</span>
        <span className="font-mono text-xs font-semibold text-black">{toolName || 'unknown_tool'}</span>
        <span
          className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
            payload.success === false
              ? 'border-[var(--metis-red)] bg-[var(--metis-pastel-red)] text-[var(--metis-red)]'
              : 'border-[var(--metis-orange-dark)] bg-[var(--metis-pastel-2)] text-[var(--metis-orange-dark)]'
          }`}
        >
          {payload.success === false ? 'FAILED' : 'SUCCESS'}
        </span>
      </div>

      <details className="rounded border border-black/20 bg-white px-3 py-2">
        <summary className="cursor-pointer text-xs font-bold text-black/70">Output</summary>
        <div className="mt-2">{renderToolData(toolName, payload.data || null)}</div>
      </details>

      {payload.error && (
        <div className="rounded border border-[var(--metis-red)] bg-[var(--metis-pastel-red)] p-3 font-mono text-xs text-[var(--metis-red)]">
          {payload.error}
        </div>
      )}

      {payload.metadata && Object.keys(payload.metadata).length > 0 && (
        <details className="rounded border border-black/20 bg-white px-3 py-2">
          <summary className="cursor-pointer text-xs font-bold text-black/70">Metadata</summary>
          <div className="mt-2">{renderToolData(undefined, payload.metadata)}</div>
        </details>
      )}
    </div>
  );
}

interface AgentRunTimelineProps {
  timeline: TimelineEntry[];
  toolNameByCallId: Record<string, string>;
}

export const AgentRunTimeline: React.FC<AgentRunTimelineProps> = ({
  timeline,
  toolNameByCallId,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between border-b-2 border-black bg-[var(--metis-pastel-1)] px-5 py-4">
        <h2 className="text-xl font-black text-black">Execution Timeline</h2>
        <span className="rounded bg-black px-2 py-1 text-xs font-bold text-white">{timeline.length} EVENTS</span>
      </div>

      <div className="space-y-6 p-5">
        {timeline.map((entry, index) => {
          const role = (entry.role || 'unknown').toLowerCase();
          const content =
            typeof entry.content === 'string'
              ? entry.content
              : entry.content == null
                ? ''
                : toPrettyJson(entry.content);
          const toolCalls = Array.isArray(entry.tool_calls) ? entry.tool_calls : [];
          const toolName = entry.tool_call_id ? toolNameByCallId[entry.tool_call_id] : undefined;

          return (
            <div key={`${index}-${role}`} className="relative pl-8">
              {index !== timeline.length - 1 && (
                <div className="absolute bottom-[-26px] left-[11px] top-7 w-0.5 bg-black/15" />
              )}
              <div className="absolute left-0 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-white text-[10px] font-bold">
                {index + 1}
              </div>

              <div className="overflow-hidden rounded-lg border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)]">
                <div className="flex items-center justify-between border-b-2 border-black bg-[var(--metis-pastel-1)] px-4 py-2">
                  <span className="text-xs font-black uppercase tracking-wider text-black/65">{role}</span>
                  {toolName && (
                    <span className="rounded border border-black/20 bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-black">
                      {toolName}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {role === 'assistant' ? (
                    <TimelineAssistantMessage content={content} toolCalls={toolCalls} />
                  ) : role === 'tool' ? (
                    <TimelineToolResult entry={entry} toolName={toolName} />
                  ) : (
                    <MarkdownContent markdown={content || 'No textual content'} />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {timeline.length === 0 && (
          <div className="py-8 text-center text-sm font-semibold text-black/60">No timeline events available.</div>
        )}
      </div>
    </div>
  );
};
