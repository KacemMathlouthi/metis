import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, RefreshCw, ArrowLeft, ExternalLink, FileCode } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import type { AgentRun } from '@/types/api';
import { AgentStatusBadge } from '@/components/issues/AgentStatusBadge';
import agentGif from '@/assets/lechat.gif';

export const AgentProgressPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [agentRun, setAgentRun] = useState<AgentRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const loadingTexts = [
    'Thinking...',
    'Planning...',
    'Analyzing...',
    'Reading files...',
    'Fixing...',
    'Testing...'
  ];

  // Cycle through loading texts
  useEffect(() => {
    if (agentRun && (agentRun.status === 'RUNNING' || agentRun.status === 'PENDING')) {
      const interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
      }, 2000); // Change every 2 seconds

      return () => clearInterval(interval);
    }
  }, [agentRun]);

  useEffect(() => {
    fetchAgentRun();
  }, [agentId]);

  const fetchAgentRun = async () => {
    if (!agentId) return;

    setLoading(true);
    try {
      const data = await apiClient.getAgentRun(agentId);
      setAgentRun(data);
    } catch (err) {
      toast.error(
        'Failed to load agent run',
        err instanceof Error ? err.message : 'Unknown error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-[var(--metis-orange-dark)]" />
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
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Issues
        </Button>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="font-bold text-lg">Agent run not found</h3>
        </div>
      </div>
    );
  }

  // Mock conversation history with tool calls (will come from backend later)
  const mockConversationHistory = [
    {
      iteration: 1,
      phase: 'Planning',
      reasoning: 'I need to understand the current authentication implementation before making changes.',
      toolCalls: [
        {
          name: 'list_files',
          args: { directory: 'backend/app/api' },
          result: 'Found 8 files: auth.py, users.py, installations.py...',
        },
        {
          name: 'read_file',
          args: { file_path: 'backend/app/api/auth.py' },
          result: 'File contains 245 lines with OAuth flow implementation...',
        },
      ],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      iteration: 2,
      phase: 'Execution',
      reasoning: 'Now I will implement JWT token generation and validation middleware.',
      toolCalls: [
        {
          name: 'create_file',
          args: { file_path: 'backend/app/middleware/jwt.py', content: '# JWT middleware implementation...' },
          result: 'File created successfully',
        },
        {
          name: 'replace_in_files',
          args: { file_path: 'backend/app/core/security.py', old_text: 'def verify_token...', new_text: 'async def verify_jwt_token...' },
          result: '3 replacements made',
        },
      ],
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      iteration: 3,
      phase: 'Execution',
      reasoning: 'Running tests to verify the new authentication flow works correctly.',
      toolCalls: [
        {
          name: 'run_tests',
          args: { test_path: 'tests/test_auth.py' },
          result: '✓ All 12 tests passed in 2.3s',
        },
      ],
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      iteration: 4,
      phase: 'Completion',
      reasoning: 'Tests passed. Creating pull request with all changes.',
      toolCalls: [
        {
          name: 'git_add',
          args: { files: ['backend/app/middleware/jwt.py', 'backend/app/core/security.py', 'tests/test_auth.py'] },
          result: '3 files staged',
        },
        {
          name: 'git_commit',
          args: { message: 'feat: implement JWT authentication middleware' },
          result: 'Commit created: abc123',
        },
        {
          name: 'git_push',
          args: { branch: 'fix/issue-42-authentication' },
          result: 'Push successful. PR created: #123',
        },
      ],
      timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Show loading GIF for running/pending agents
  if (agentRun.status === 'RUNNING' || agentRun.status === 'PENDING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] w-full p-8">
        <div className="flex flex-col items-center space-y-0 max-w-3xl w-full">
          {/* Agent GIF - Bigger */}
          <div className="w-full max-w-[400px] aspect-square relative flex items-center justify-center">
            <img
              src={agentGif}
              alt="Agent working"
              className="w-full object-contain drop-shadow-2xl"
            />
          </div>

          {/* Animated Text */}
          <div className="space-y-1 text-center w-full">
            <div className="min-h-[3rem] flex items-center justify-center">
              <h2 
                key={loadingTextIndex}
                className="text-3xl md:text-4xl font-black text-black animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                {agentRun.status === 'RUNNING' ? loadingTexts[loadingTextIndex] : 'Starting...'}
              </h2>
            </div>
            
            <p className="text-lg text-muted-foreground font-medium animate-pulse">
              {agentRun.status === 'RUNNING'
                ? `Working on issue #${agentRun.issue_number}`
                : `Agent is queued and will start soon`}
            </p>
            
            <div className="pt-1">
              <Button
                onClick={fetchAgentRun}
                variant="neutral"
                className="h-8 px-4 text-xs border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all bg-white"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Refresh Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-black/10 pb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/dashboard/issues')}
            variant="neutral"
            className="h-10 w-10 p-0 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="landing-display text-2xl md:text-3xl font-black text-black flex items-center gap-3">
              Agent Run
              <AgentStatusBadge status={agentRun.status} className="text-sm px-3 py-1" />
            </h1>
            <p className="text-sm text-black/60 mt-1">
              <span className="font-bold text-black">#{agentRun.issue_number}</span> in <span className="font-mono text-xs bg-[var(--metis-pastel-1)] px-1.5 py-0.5 rounded border border-black/20">{agentRun.repository}</span>
            </p>
          </div>
        </div>
        <Button
          onClick={fetchAgentRun}
          variant="neutral"
          className="border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metrics & Results (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <p className="text-xs font-bold text-black/60 uppercase tracking-wider mb-1">Tokens</p>
              <p className="text-2xl font-black text-black">{agentRun.tokens_used.toLocaleString()}</p>
            </div>
            <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <p className="text-xs font-bold text-black/60 uppercase tracking-wider mb-1">Duration</p>
              <p className="text-2xl font-black text-black">{agentRun.elapsed_seconds ? `${agentRun.elapsed_seconds}s` : '-'}</p>
            </div>
            <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <p className="text-xs font-bold text-black/60 uppercase tracking-wider mb-1">Iterations</p>
              <p className="text-2xl font-black text-black">{agentRun.iteration}</p>
            </div>
            <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <p className="text-xs font-bold text-black/60 uppercase tracking-wider mb-1">Tools</p>
              <p className="text-2xl font-black text-black">{agentRun.tool_calls_made}</p>
            </div>
          </div>

          {/* Completed: PR Info */}
          {agentRun.status === 'COMPLETED' && agentRun.pr_url && (
            <div className="border-2 border-black bg-[var(--metis-pastel-2)] p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-black text-[var(--metis-red)] mb-4 flex items-center gap-2">
                <span className="bg-[var(--metis-orange-dark)] text-white p-1 rounded">
                  <ExternalLink className="h-4 w-4" />
                </span>
                Pull Request Created
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white border-2 border-black rounded-lg p-3">
                  <p className="text-xs font-bold text-[var(--metis-orange-dark)] uppercase mb-1">PR Number</p>
                  <a
                    href={agentRun.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl font-black text-black hover:underline flex items-center gap-2"
                  >
                    #{agentRun.pr_number}
                    <ExternalLink className="h-4 w-4 text-black/40" />
                  </a>
                </div>

                {agentRun.files_changed.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-black/70 uppercase mb-2">Files Changed ({agentRun.files_changed.length})</p>
                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {agentRun.files_changed.map((file) => (
                        <div
                          key={file}
                          className="flex items-center gap-2 text-xs p-2 bg-white border border-black rounded font-mono text-black"
                        >
                          <FileCode className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Failed: Error Info */}
          {agentRun.status === 'FAILED' && agentRun.error && (
            <div className="border-2 border-black bg-[var(--metis-pastel-red)] p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-black text-[var(--metis-red)] mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[var(--metis-red)]" />
                Execution Failed
              </h3>
              <div className="bg-white border-2 border-[var(--metis-red)] rounded p-4 font-mono text-xs text-[var(--metis-red)] overflow-x-auto">
                {agentRun.error}
              </div>
            </div>
          )}

          {/* Custom Instructions */}
          {agentRun.custom_instructions && (
            <div className="border-2 border-black bg-white p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-sm font-black text-black/80 uppercase tracking-wider mb-3">Custom Instructions</h3>
              <p className="text-sm text-black/60 leading-relaxed italic border-l-4 border-black/10 pl-4">
                "{agentRun.custom_instructions}"
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Conversation History (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="bg-[var(--metis-pastel-1)] border-b-2 border-black px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-black">Execution Timeline</h2>
              <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded">
                {mockConversationHistory.length} STEPS
              </span>
            </div>
            
            <div className="p-6 space-y-8">
              {mockConversationHistory.map((entry, index) => (
                <div key={index} className="relative pl-8 group">
                  {/* Timeline Line */}
                  {index !== mockConversationHistory.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-[-32px] w-0.5 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  )}
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-2 border-black bg-white flex items-center justify-center z-10 shadow-sm">
                    <span className="text-[10px] font-bold">{entry.iteration}</span>
                  </div>

                  {/* Content Card */}
                  <div className="border-2 border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2 bg-[var(--metis-pastel-1)] border-b-2 border-black rounded-t-md">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-wider text-black/60">Phase</span>
                        <span className="text-xs font-bold px-2 py-0.5 bg-[var(--metis-pastel-2)] text-[var(--metis-orange-dark)] border border-black rounded-full">
                          {entry.phase}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-black/40">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-4">
                      {/* Reasoning */}
                      <div>
                        <p className="text-[10px] font-bold text-black/60 uppercase mb-1">Reasoning</p>
                        <p className="text-sm text-black/80 leading-relaxed font-medium">
                          {entry.reasoning}
                        </p>
                      </div>

                      {/* Tool Calls */}
                      {entry.toolCalls.length > 0 && (
                        <div className="space-y-3 pt-2">
                          {entry.toolCalls.map((tool, toolIndex) => (
                            <div key={toolIndex} className="bg-[var(--metis-pastel-1)] border border-black/10 rounded-md overflow-hidden">
                              <div className="px-3 py-1.5 bg-[var(--metis-pastel-1)] border-b border-black/10 flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-[var(--metis-orange-dark)] text-white px-1.5 py-0.5 rounded">TOOL</span>
                                <span className="text-xs font-mono font-bold text-black">{tool.name}</span>
                              </div>
                              <div className="p-3 space-y-2">
                                <div className="font-mono text-[11px] text-black/70 bg-white p-2 rounded border border-black/10">
                                  {Object.entries(tool.args).map(([key, value]) => (
                                    <div key={key} className="flex gap-2">
                                      <span className="text-[var(--metis-orange)]">{key}:</span>
                                      <span className="text-black/80 break-all">
                                        {typeof value === 'string' ? (
                                          value.length > 100 ? `${value.substring(0, 100)}...` : value
                                        ) : Array.isArray(value) ? (
                                          `[${value.join(', ')}]`
                                        ) : (
                                          JSON.stringify(value)
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex gap-2 items-start">
                                  <span className="text-[10px] font-bold text-[var(--metis-orange-dark)] mt-0.5">➔</span>
                                  <span className="text-xs text-black/80 font-mono break-all">{tool.result}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {mockConversationHistory.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-black/60 font-bold">No activity recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
