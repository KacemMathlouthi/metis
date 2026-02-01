import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, ArrowLeft, Github, CircleDot, Circle, GitPullRequest } from 'lucide-react';
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

      const [issueData, commentsData] = await Promise.all([
        apiClient.getIssue(issueNum, selectedRepo.repository),
        apiClient.getIssueComments(issueNum, selectedRepo.repository),
      ]);

      setIssue(issueData);
      setComments(commentsData);
      // Agent runs not yet implemented
      setAgentRuns([]);
    } catch (err) {
      toast.error(
        'Failed to load issue',
        err instanceof Error ? err.message : 'Unknown error'
      );
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

      // Agent runs will be implemented later
      // Refresh would happen here
    } catch (err) {
      toast.dismiss(loadingId);
      toast.error(
        'Failed to launch agent',
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Loading issue...</p>
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
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Issues
        </Button>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="font-bold text-lg">Issue not found</h3>
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
    <div className="p-2 md:p-4 max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          onClick={() => navigate('/dashboard/issues')}
          variant="neutral"
          className="border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Issues
        </Button>
      </div>

      {/* Main Layout: Content + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left: Main Content */}
        <div className="flex-1 space-y-4 min-w-0 order-2 lg:order-1">
          {/* Title Section */}
          <div className="space-y-2 border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-black break-words mb-2">
              {issue.title}
              <span className="text-muted-foreground font-normal ml-2">#{issue.issue_number}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              {issue.status === 'OPEN' ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-600 text-white shadow-sm">
                  <CircleDot className="h-3.5 w-3.5" />
                  <span className="font-bold text-xs">Open</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white shadow-sm">
                  <Circle className="h-3.5 w-3.5" />
                  <span className="font-bold text-xs">Closed</span>
                </div>
              )}

              <span className="text-sm text-gray-600 ml-1">
                <span className="font-semibold text-black">{issue.author}</span> opened this issue on {formatDate(issue.created_at)}
              </span>

              <span className="text-sm text-gray-600">
                • {issue.comments_count} comments
              </span>
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
        <div className="w-full lg:w-72 flex-shrink-0 space-y-6 order-1 lg:order-2 lg:pl-8 lg:border-l lg:border-gray-200">
          {/* Assignees */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500">Assignees</h3>
            </div>
            {issue.assignees.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No one assigned</p>
            ) : (
              <div className="space-y-2">
                {issue.assignees.map((assignee) => (
                  <div key={assignee} className="flex items-center gap-2 group cursor-pointer">
                    <img 
                      src={`https://github.com/${assignee}.png`} 
                      alt={assignee}
                      className="h-5 w-5 rounded-full border border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{assignee}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500">Labels</h3>
            </div>
            {issue.labels.length === 0 ? (
              <p className="text-xs text-gray-500 italic">None yet</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {issue.labels.map((label) => (
                  <LabelBadge key={label} label={label} />
                ))}
              </div>
            )}
          </div>

          {/* Development Section */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-xs font-bold text-gray-500 mb-3">Development</h3>

            {/* Launch Agent Button */}
            <LaunchAgentDialog
              issueNumber={issue.issue_number}
              issueTitle={issue.title}
              repository={selectedRepo?.repository || ''}
              onLaunch={handleLaunchAgent}
              triggerButton={
                <Button className="w-full border-2 border-black bg-[#A78BFA] font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all mb-3">
                  Code with agent mode
                </Button>
              }
            />

            {/* Related PRs */}
            {agentRuns.filter((r) => r.pr_number).length > 0 ? (
              <div className="space-y-2 mt-3">
                {agentRuns
                  .filter((run) => run.pr_number)
                  .map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center gap-2 text-sm group cursor-pointer"
                      onClick={() => navigate(`/dashboard/agents/${run.id}`)}
                    >
                      <GitPullRequest className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-900 group-hover:text-blue-600">
                        #{run.pr_number}
                      </span>
                      <AgentStatusBadge status={run.status} className="text-[10px] px-1.5 py-0 ml-auto" />
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                No pull requests yet
              </p>
            )}
          </div>

          {/* View on GitHub */}
          <div className="pt-2">
            <a
              href={`https://github.com/${issue.repository}/issues/${issue.issue_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1"
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
