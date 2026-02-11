import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  Github,
  CircleDot,
  Circle,
  GitPullRequest,
} from 'lucide-react';
import { useRepository } from '@/contexts/RepositoryContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import type { Issue, IssueComment, AgentRun } from '@/types/api';
import { LabelBadge } from '@/components/issues/LabelBadge';
import { AgentStatusBadge } from '@/components/issues/AgentStatusBadge';
import { LaunchAgentDialog } from '@/components/issues/LaunchAgentDialog';
import { IssueCommentCard } from '@/components/issues/IssueCommentCard';

export const IssueDetailPage: React.FC = () => {
  const { issueNumber } = useParams<{ issueNumber: string }>();
  const { selectedRepo } = useRepository();
  const navigate = useNavigate();
  const toast = useToast();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssue();
  }, [issueNumber, selectedRepo]);

  const fetchIssue = async () => {
    if (!issueNumber || !selectedRepo) return;

    setLoading(true);
    try {
      const issueNum = parseInt(issueNumber);

      const [issueData, commentsData, runsData] = await Promise.all([
        apiClient.getIssue(issueNum, selectedRepo.repository),
        apiClient.getIssueComments(issueNum, selectedRepo.repository),
        apiClient.getIssueAgentRuns(issueNum, selectedRepo.repository),
      ]);

      setIssue(issueData);
      setComments(commentsData);
      setAgentRuns(runsData);
    } catch (err) {
      toast.error('Failed to load issue', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchAgent = async (customInstructions: string) => {
    if (!issue || !selectedRepo) return;

    const loadingId = toast.loading('Launching agent...', 'Setting up workspace');
    try {
      const response = await apiClient.launchAgent({
        issue_number: issue.issue_number,
        repository: selectedRepo.repository,
        custom_instructions: customInstructions || null,
      });

      toast.dismiss(loadingId);
      toast.success('Agent launched!', `Task ID: ${response.celery_task_id}`);
      await fetchIssue();
      navigate(`/dashboard/agents/${response.agent_run_id}`);
    } catch (err) {
      toast.dismiss(loadingId);
      toast.error('Failed to launch agent', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-[var(--metis-orange-dark)]" />
        <p className="text-sm text-black/60">Loading issue...</p>
      </div>
    );
  }

  if (!issue) {
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
          <h3 className="text-lg font-bold">Issue not found</h3>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="mx-auto max-w-6xl p-2 md:p-4">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          onClick={() => navigate('/dashboard/issues')}
          variant="neutral"
          className="border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Issues
        </Button>
      </div>

      {/* Main Layout: Content + Sidebar */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Left: Main Content */}
        <div className="order-2 min-w-0 flex-1 space-y-4 lg:order-1">
          {/* Title Section */}
          <div className="mb-6 space-y-2 border-b border-black/10 pb-4">
            <h1 className="landing-display mb-2 text-2xl font-black break-words text-black md:text-3xl">
              {issue.title}
              <span className="ml-2 font-normal text-black/60">#{issue.issue_number}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              {issue.status === 'OPEN' ? (
                <div className="flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1 text-white shadow-sm">
                  <CircleDot className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">Open</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-purple-600 px-3 py-1 text-white shadow-sm">
                  <Circle className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">Closed</span>
                </div>
              )}

              <span className="ml-1 text-sm text-black/60">
                <span className="font-semibold text-black">{issue.author}</span> opened this issue
                on {formatDate(issue.created_at)}
              </span>

              <span className="text-sm text-black/60">• {issue.comments_count} comments</span>
            </div>
          </div>

          {/* Issue Body */}
          <div className="mb-8">
            <IssueCommentCard
              comment={{
                id: 'issue-description',
                issue_id: issue.id,
                github_comment_id: 0,
                author: issue.author,
                avatar_url: `https://github.com/${issue.author}.png`,
                body: issue.body || 'No description provided',
                created_at: issue.created_at,
              }}
            />
          </div>

          {/* Comments */}
          {comments.length > 0 && (
            <div className="">
              {comments.map((comment) => (
                <IssueCommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="order-1 w-full flex-shrink-0 space-y-6 lg:order-2 lg:w-72 lg:border-l lg:border-black/10 lg:pl-8">
          {/* Assignees */}
          <div className="border-b border-black/10 pb-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-black/60">Assignees</h3>
            </div>
            {issue.assignees.length === 0 ? (
              <p className="text-xs text-black/60 italic">No one assigned</p>
            ) : (
              <div className="space-y-2">
                {issue.assignees.map((assignee) => (
                  <div key={assignee} className="group flex cursor-pointer items-center gap-2">
                    <img
                      src={`https://github.com/${assignee}.png`}
                      alt={assignee}
                      className="h-5 w-5 rounded-full border border-black/20"
                    />
                    <span className="text-sm font-medium text-black/70 group-hover:text-[var(--metis-orange)]">
                      {assignee}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="border-b border-black/10 pb-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-black/60">Labels</h3>
            </div>
            {issue.labels.length === 0 ? (
              <p className="text-xs text-black/60 italic">None yet</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {issue.labels.map((label) => (
                  <LabelBadge key={label} label={label} />
                ))}
              </div>
            )}
          </div>

          {/* Development Section */}
          <div className="border-b border-black/10 pb-4">
            <h3 className="mb-3 text-xs font-bold text-black/60">Development</h3>

            {/* Launch Agent Button */}
            <LaunchAgentDialog
              issueNumber={issue.issue_number}
              issueTitle={issue.title}
              repository={selectedRepo?.repository || ''}
              onLaunch={handleLaunchAgent}
              triggerButton={
                <Button className="mb-3 w-full border-2 border-black bg-[var(--metis-orange)] text-sm font-bold text-white shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000]">
                  Code with agent mode
                </Button>
              }
            />

            {/* Related PRs */}
            {agentRuns.filter((r) => r.pr_number).length > 0 ? (
              <div className="mt-3 space-y-2">
                {agentRuns
                  .filter((run) => run.pr_number)
                  .map((run) => (
                    <div
                      key={run.id}
                      className="group flex cursor-pointer items-center gap-2 text-sm"
                      onClick={() => navigate(`/dashboard/agents/${run.id}`)}
                    >
                      <GitPullRequest className="h-4 w-4 text-[var(--metis-orange-dark)]" />
                      <span className="font-medium text-black group-hover:text-[var(--metis-orange)]">
                        #{run.pr_number}
                      </span>
                      <AgentStatusBadge
                        status={run.status}
                        className="ml-auto px-1.5 py-0 text-[10px]"
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-black/60 italic">No pull requests yet</p>
            )}
          </div>

          {/* View on GitHub */}
          <div className="pt-2">
            <a
              href={`https://github.com/${issue.repository}/issues/${issue.issue_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-black/60 hover:text-[var(--metis-orange)]"
            >
              <Github className="h-3.5 w-3.5" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
