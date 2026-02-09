import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import type { AgentRun } from '@/types/api';
import { AgentRunHeader } from '@/components/dashboard/agent-progress/AgentRunHeader';
import { AgentRunStatsCards } from '@/components/dashboard/agent-progress/AgentRunStatsCards';
import { AgentRunMetadataPanel } from '@/components/dashboard/agent-progress/AgentRunMetadataPanel';
import { AgentRunTimeline } from '@/components/dashboard/agent-progress/AgentRunTimeline';
import type { TimelineEntry } from '@/components/dashboard/agent-progress/types';

export const AgentProgressPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [agentRun, setAgentRun] = useState<AgentRun | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentRun();
  }, [agentId]);

  useEffect(() => {
    if (!agentRun || (agentRun.status !== 'RUNNING' && agentRun.status !== 'PENDING')) {
      return;
    }

    const interval = setInterval(() => {
      fetchAgentRun(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [agentRun?.id, agentRun?.status]);

  const fetchAgentRun = async (silent: boolean = false) => {
    if (!agentId) return;

    if (!silent) setLoading(true);
    try {
      const data = await apiClient.getAgentRun(agentId);
      setAgentRun(data);
    } catch (err) {
      toast.error(
        'Failed to load agent run',
        err instanceof Error ? err.message : 'Unknown error'
      );
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const conversationHistory = useMemo(() => {
    if (!agentRun?.conversation || !Array.isArray(agentRun.conversation)) return [];
    return agentRun.conversation as TimelineEntry[];
  }, [agentRun?.conversation]);

  const visibleTimeline = useMemo(
    () => conversationHistory.filter((entry) => (entry.role || '').toLowerCase() !== 'system'),
    [conversationHistory]
  );

  const toolNameByCallId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const entry of conversationHistory) {
      if ((entry.role || '').toLowerCase() !== 'assistant') continue;
      if (!Array.isArray(entry.tool_calls)) continue;

      for (const call of entry.tool_calls) {
        if (call.id && call.function?.name) {
          map[call.id] = call.function.name;
        }
      }
    }
    return map;
  }, [conversationHistory]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-[var(--metis-orange-dark)]" />
        <p className="text-sm text-black/60">Loading agent details...</p>
      </div>
    );
  }

  if (!agentRun) {
    return (
      <div className="space-y-6 p-2">
        <Button
          onClick={() => navigate('/dashboard/issues')}
          variant="neutral"
          className="border-2 border-black font-bold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Issues
        </Button>
        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="text-lg font-bold">Agent run not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-2 md:p-4">
      <AgentRunHeader
        agentRun={agentRun}
        onBack={() => navigate('/dashboard/issues')}
        onRefresh={() => fetchAgentRun()}
      />

      <AgentRunStatsCards agentRun={agentRun} timelineCount={visibleTimeline.length} />

      <AgentRunMetadataPanel agentRun={agentRun} />

      <AgentRunTimeline timeline={visibleTimeline} toolNameByCallId={toolNameByCallId} />
    </div>
  );
};
