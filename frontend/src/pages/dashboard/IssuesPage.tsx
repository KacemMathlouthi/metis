import React, { useState, useEffect, useRef } from 'react';
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
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current && selectedRepo) {
      hasFetchedRef.current = true;
      fetchData();
    }
  }, [selectedRepo]);

  const fetchData = async () => {
    if (!selectedRepo) return;

    setLoading(true);
    try {
      const [issuesData, agentsData] = await Promise.all([
        apiClient.listIssues(selectedRepo.id, true),
        apiClient.listAgentRuns(selectedRepo.id),
      ]);
      setIssues(issuesData);
      setAgentRuns(agentsData);
    } catch (err) {
      toast.error('Failed to load data', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };


  if (!selectedRepo) {
    return (
      <div className="flex items-center justify-center py-12 p-4">
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <FileQuestion className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="font-black text-lg">No repository selected</h3>
            <p className="text-sm font-medium text-muted-foreground">
              Select a repository from the sidebar to view issues
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-black">Issues</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Manage GitHub issues and launch AI agents to solve them
          </p>
        </div>
        <Button
          onClick={fetchData}
          disabled={loading}
          variant="neutral"
          className="border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'issues' | 'agents')}>
        <TabsList className="grid w-full grid-cols-2 border-2 border-black bg-white p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-auto">
          <TabsTrigger
            value="issues"
            className="font-bold text-xs sm:text-sm data-[state=active]:bg-[#FCD34D] data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-sm transition-all py-2"
          >
            All Issues ({issues.length})
          </TabsTrigger>
          <TabsTrigger
            value="agents"
            className="font-bold text-xs sm:text-sm data-[state=active]:bg-[#FCD34D] data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-sm transition-all py-2"
          >
            Agent Runs ({agentRuns.length})
          </TabsTrigger>
        </TabsList>

        {/* Issues Tab */}
        <TabsContent value="issues" className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Loading issues...</p>
            </div>
          ) : issues.length === 0 ? (
            <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="flex flex-col items-center py-12 px-4 text-center">
                <FileQuestion className="h-12 w-12 mb-4 text-muted-foreground" />
                <h3 className="font-black text-lg">No issues found</h3>
                <p className="text-sm font-medium text-muted-foreground">
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
        <TabsContent value="agents" className="flex-1 flex flex-col min-h-0 mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Loading agents...</p>
            </div>
          ) : agentRuns.length === 0 ? (
            <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="flex flex-col items-center py-12 px-4 text-center">
                <Bot className="h-12 w-12 mb-4 text-muted-foreground" />
                <h3 className="font-black text-lg">No agents running</h3>
                <p className="text-sm font-medium text-muted-foreground">
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
