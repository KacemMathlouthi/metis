import React from 'react';
import type { AgentRun } from '@/types/api';
import { formatDuration } from './utils';

interface AgentRunStatsCardsProps {
  agentRun: AgentRun;
  timelineCount: number;
}

export const AgentRunStatsCards: React.FC<AgentRunStatsCardsProps> = ({
  agentRun,
  timelineCount,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="mb-1 text-xs font-bold tracking-wider text-black/60 uppercase">Tokens</p>
        <p className="text-2xl font-black text-black">{agentRun.tokens_used.toLocaleString()}</p>
      </div>
      <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="mb-1 text-xs font-bold tracking-wider text-black/60 uppercase">Duration</p>
        <p className="text-2xl font-black text-black">{formatDuration(agentRun.elapsed_seconds)}</p>
      </div>
      <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="mb-1 text-xs font-bold tracking-wider text-black/60 uppercase">Iterations</p>
        <p className="text-2xl font-black text-black">{agentRun.iteration}</p>
      </div>
      <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="mb-1 text-xs font-bold tracking-wider text-black/60 uppercase">Tool Calls</p>
        <p className="text-2xl font-black text-black">{agentRun.tool_calls_made}</p>
      </div>
      <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="mb-1 text-xs font-bold tracking-wider text-black/60 uppercase">
          Timeline Steps
        </p>
        <p className="text-2xl font-black text-black">{timelineCount}</p>
      </div>
    </div>
  );
};
