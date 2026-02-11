import React from 'react';
import { ExternalLink, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AgentRun } from '@/types/api';
import { formatDateTime, CodeBlock } from './utils';

interface AgentRunMetadataPanelProps {
  agentRun: AgentRun;
}

export const AgentRunMetadataPanel: React.FC<AgentRunMetadataPanelProps> = ({ agentRun }) => {
  return (
    <>
      <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-black tracking-wider text-black/70 uppercase">
            Run Metadata
          </h2>
          <div className="flex items-center gap-2">
            {agentRun.pr_url && (
              <Button
                asChild
                variant="neutral"
                className="h-8 gap-2 border-2 border-black px-3 font-bold"
              >
                <a href={agentRun.pr_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  PR #{agentRun.pr_number}
                </a>
              </Button>
            )}
            {agentRun.issue_url && (
              <Button
                asChild
                variant="neutral"
                className="h-8 gap-2 border-2 border-black px-3 font-bold"
              >
                <a href={agentRun.issue_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open Issue
                </a>
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <p>
            <span className="font-bold">Issue:</span> #{agentRun.issue_number}
          </p>
          <p>
            <span className="font-bold">Branch:</span> {agentRun.branch_name || 'N/A'}
          </p>
          <p>
            <span className="font-bold">Started:</span> {formatDateTime(agentRun.started_at)}
          </p>
          <p>
            <span className="font-bold">Completed:</span> {formatDateTime(agentRun.completed_at)}
          </p>
        </div>

        {agentRun.files_changed.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold tracking-wider text-black/70 uppercase">
              Changed Files ({agentRun.files_changed.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {agentRun.files_changed.map((file) => (
                <span
                  key={file}
                  className="inline-flex items-center gap-1 rounded border border-black/20 bg-[var(--metis-pastel-1)] px-2 py-1 font-mono text-[11px]"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  {file}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {agentRun.status === 'FAILED' && agentRun.error && (
        <div className="rounded-lg border-2 border-black bg-[var(--metis-pastel-red)] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-black tracking-wider text-[var(--metis-red)] uppercase">
            Error
          </h2>
          <CodeBlock code={agentRun.error} language="text" />
        </div>
      )}
    </>
  );
};
