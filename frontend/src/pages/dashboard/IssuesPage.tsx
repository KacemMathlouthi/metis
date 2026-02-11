import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, FileQuestion, Bot, Loader2 } from 'lucide-react';
import { useRepository } from '@/contexts/RepositoryContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api-client';
import type { IssueWithAgent, AgentRun } from '@/types/api';
import { IssuesTable } from '@/components/issues/IssuesTable';
import { AgentRunsTable } from '@/components/issues/AgentRunsTable';

export const IssuesPage: React.FC = () => {
  const { selectedRepo } = useRepository();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'issues' | 'agents'>('issues');
  const [issues, setIssues] = useState<IssueWithAgent[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRepo) {
      fetchData();
    }
  }, [selectedRepo]);

  const fetchData = async () => {
    if (!selectedRepo) return;

    setLoading(true);
    try {
      const [issuesData, agentRunsData] = await Promise.all([
        apiClient.listIssues(selectedRepo.repository),
        apiClient.listAgentRuns(selectedRepo.repository),
      ]);
      setIssues(issuesData as IssueWithAgent[]); // Cast since agent runs not implemented yet
      setAgentRuns(agentRunsData);
    } catch (err) {
      toast.error('Failed to load data', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRepo) {
    return (
      <div className="flex items-center justify-center p-4 py-12">
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <FileQuestion className="mb-4 h-12 w-12 text-black/40" />
            <h3 className="text-lg font-black">No repository selected</h3>
            <p className="text-sm font-medium text-black/60">
              Select a repository from the sidebar to view issues
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="landing-display text-3xl font-black text-black">Issues</h1>
          <p className="mt-1 font-medium text-black/60">
            Manage GitHub issues and launch AI agents to solve them
          </p>
        </div>
        <Button
          onClick={fetchData}
          disabled={loading}
          variant="neutral"
          className="border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'issues' | 'agents')}>
        <TabsList className="grid h-auto w-full grid-cols-2 border-2 border-black bg-white p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <TabsTrigger
            value="issues"
            className="py-2 text-xs font-bold transition-all data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:bg-[var(--metis-pastel-2)] data-[state=active]:text-black data-[state=active]:shadow-sm sm:text-sm"
          >
            All Issues ({issues.length})
          </TabsTrigger>
          <TabsTrigger
            value="agents"
            className="py-2 text-xs font-bold transition-all data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:bg-[var(--metis-pastel-2)] data-[state=active]:text-black data-[state=active]:shadow-sm sm:text-sm"
          >
            Agent Runs ({agentRuns.length})
          </TabsTrigger>
        </TabsList>

        {/* Issues Tab */}
        <TabsContent value="issues" className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium text-black/60">Loading issues...</p>
            </div>
          ) : issues.length === 0 ? (
            <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="flex flex-col items-center px-4 py-12 text-center">
                <FileQuestion className="mb-4 h-12 w-12 text-black/40" />
                <h3 className="text-lg font-black">No issues found</h3>
                <p className="text-sm font-medium text-black/60">
                  There are no issues in this repository
                </p>
              </CardContent>
            </Card>
          ) : (
            <IssuesTable
              issues={issues}
              onRowClick={(num) => navigate(`/dashboard/issues/${num}`)}
            />
          )}
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="mt-6 flex min-h-0 flex-1 flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium text-black/60">Loading agents...</p>
            </div>
          ) : agentRuns.length === 0 ? (
            <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="flex flex-col items-center px-4 py-12 text-center">
                <Bot className="mb-4 h-12 w-12 text-black/40" />
                <h3 className="text-lg font-black">No agents running</h3>
                <p className="text-sm font-medium text-black/60">
                  Launch an agent from the Issues tab to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <AgentRunsTable
              agentRuns={agentRuns}
              onRowClick={(id) => navigate(`/dashboard/agents/${id}`)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
