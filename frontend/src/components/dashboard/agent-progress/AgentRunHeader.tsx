import React from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentStatusBadge } from '@/components/issues/AgentStatusBadge';
import type { AgentRun } from '@/types/api';

interface AgentRunHeaderProps {
  agentRun: AgentRun;
  onBack: () => void;
  onRefresh: () => void;
}

export const AgentRunHeader: React.FC<AgentRunHeaderProps> = ({ agentRun, onBack, onRefresh }) => {
  return (
    <div className="mb-2 flex flex-col items-start justify-between gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="neutral"
          className="h-10 w-10 rounded-full border-2 border-black p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="landing-display flex items-center gap-3 text-2xl font-black text-black md:text-3xl">
            Agent Run
            <AgentStatusBadge status={agentRun.status} className="px-3 py-1 text-sm" />
          </h1>
          <p className="mt-1 text-sm text-black/60">
            <span className="font-bold text-black">#{agentRun.issue_number}</span> in{' '}
            <span className="rounded border border-black/20 bg-[var(--metis-pastel-1)] px-1.5 py-0.5 font-mono text-xs text-black">
              {agentRun.repository}
            </span>
          </p>
        </div>
      </div>
      <Button onClick={onRefresh} variant="neutral" className="border-2 border-black font-bold">
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
};
