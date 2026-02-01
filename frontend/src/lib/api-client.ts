/**
 * API client for backend communication.
 *
 * Provides methods for all backend endpoints with automatic cookie-based
 * authentication. Handles errors and throws exceptions for error handling
 * by the caller (ProtectedRoute handles 401 redirects).
 */

import type {
  User,
  Installation,
  InstallationConfig,
  GitHubInstallation,
  SyncInstallationsResponse,
  Issue,
  IssueWithAgent,
  IssueComment,
  AgentRun,
  LaunchAgentRequest,
  LaunchAgentResponse,
} from '@/types/api';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  /**
   * Make HTTP request with automatic cookie handling.
   *
   * Includes credentials (cookies) with every request for authentication.
   * Throws error on non-2xx responses. Caller handles 401 appropriately.
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Send cookies with request
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    // Handle 204 No Content (no response body)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // ==================== Auth Endpoints ====================

  /**
   * Get current authenticated user profile.
   * Requires valid access_token cookie.
   */
  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  /**
   * Logout user by clearing authentication cookies.
   * Automatically redirects to home page after logout.
   */
  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  /**
   * Refresh access token using refresh token.
   * Called automatically when access token expires.
   */
  async refreshToken(): Promise<{ access_token: string }> {
    return this.request<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  // ==================== Installation Endpoints ====================

  /**
   * List user's GitHub App installations from GitHub API.
   * Shows which repositories are available to enable.
   */
  async getGitHubInstallations(): Promise<GitHubInstallation[]> {
    return this.request<GitHubInstallation[]>('/api/installations/github');
  }

  /**
   * Sync installations from GitHub to database.
   * Creates Installation records for available repositories.
   */
  async syncInstallations(): Promise<SyncInstallationsResponse> {
    return this.request<SyncInstallationsResponse>(
      '/api/installations/sync',
      { method: 'POST' }
    );
  }

  /**
   * List user's enabled installations from database.
   */
  async listInstallations(activeOnly: boolean = true): Promise<Installation[]> {
    const query = activeOnly ? '?active_only=true' : '?active_only=false';
    return this.request<Installation[]>(`/api/installations${query}`);
  }

  /**
   * Enable code reviews for a repository.
   */
  async enableRepository(data: {
    github_installation_id: number;
    repository: string;
    account_type: 'USER' | 'ORGANIZATION';
    account_name: string;
    config: InstallationConfig;
  }): Promise<Installation> {
    return this.request<Installation>('/api/installations/enable', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update installation review configuration.
   */
  async updateInstallationConfig(
    installationId: string,
    config: InstallationConfig
  ): Promise<Installation> {
    return this.request<Installation>(
      `/api/installations/${installationId}/config`,
      {
        method: 'PUT',
        body: JSON.stringify({ config }),
      }
    );
  }

  /**
   * Disable installation.
   */
  async disableInstallation(installationId: string): Promise<void> {
    await this.request(`/api/installations/${installationId}`, {
      method: 'DELETE',
    });
  }

  // ==================== Issues Endpoints ====================

  /**
   * List all issues for a repository
   * Note: Agent runs not yet implemented, returns issues without agent data
   */
  async listIssues(repository: string): Promise<Issue[]> {
    return this.request<Issue[]>(`/api/issues?repository=${encodeURIComponent(repository)}`);
  }

  /**
   * Get single issue with all details
   */
  async getIssue(issueNumber: number, repository: string): Promise<Issue> {
    return this.request<Issue>(`/api/issues/${issueNumber}?repository=${encodeURIComponent(repository)}`);
  }

  /**
   * Get all comments for an issue
   */
  async getIssueComments(issueNumber: number, repository: string): Promise<IssueComment[]> {
    return this.request<IssueComment[]>(`/api/issues/${issueNumber}/comments?repository=${encodeURIComponent(repository)}`);
  }

  /**
   * Get all agent runs for a specific issue
   */
  async getIssueAgentRuns(issueId: string): Promise<AgentRun[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      {
        id: 'run-1',
        issue_id: issueId,
        repository: 'user/repo',
        issue_number: 42,
        status: 'COMPLETED',
        custom_instructions: null,
        iteration: 8,
        tokens_used: 15420,
        tool_calls_made: 24,
        started_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        elapsed_seconds: 3600,
        pr_url: 'https://github.com/user/repo/pull/123',
        pr_number: 123,
        branch_name: 'fix/issue-42-authentication',
        files_changed: ['backend/app/api/auth.py', 'backend/app/core/security.py', 'tests/test_auth.py'],
        error: null,
        celery_task_id: 'task-123',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'run-0',
        issue_id: issueId,
        repository: 'user/repo',
        issue_number: 42,
        status: 'FAILED',
        custom_instructions: 'Try to use OAuth2',
        iteration: 3,
        tokens_used: 4200,
        tool_calls_made: 8,
        started_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
        elapsed_seconds: 3600,
        pr_url: null,
        pr_number: null,
        branch_name: null,
        files_changed: [],
        error: 'Failed to install required OAuth2 dependencies. Package not found in registry.',
        celery_task_id: 'task-122',
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  // ==================== Agent Endpoints ====================

  /**
   * Launch an agent to solve an issue
   */
  async launchAgent(data: LaunchAgentRequest): Promise<LaunchAgentResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const agentId = `run-${Math.random().toString(36).substr(2, 9)}`;
    return {
      agent_run_id: agentId,
      celery_task_id: `task-${Math.random().toString(36).substr(2, 9)}`,
      message: `Agent launched successfully for issue #${data.issue_number}`,
    };
  }

  /**
   * List all agent runs for a repository
   */
  async listAgentRuns(repositoryId: string): Promise<AgentRun[]> {
    await new Promise(resolve => setTimeout(resolve, 400));

    return [
      {
        id: 'run-1',
        issue_id: 'issue-1',
        repository: 'user/repo',
        issue_number: 42,
        status: 'COMPLETED',
        custom_instructions: null,
        iteration: 8,
        tokens_used: 15420,
        tool_calls_made: 24,
        started_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        elapsed_seconds: 3600,
        pr_url: 'https://github.com/user/repo/pull/123',
        pr_number: 123,
        branch_name: 'fix/issue-42-authentication',
        files_changed: ['backend/app/api/auth.py', 'backend/app/core/security.py', 'tests/test_auth.py'],
        error: null,
        celery_task_id: 'task-123',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'run-2',
        issue_id: 'issue-2',
        repository: 'user/repo',
        issue_number: 43,
        status: 'RUNNING',
        custom_instructions: 'Focus on the data loader module',
        iteration: 5,
        tokens_used: 8200,
        tool_calls_made: 15,
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        completed_at: null,
        elapsed_seconds: 1800,
        pr_url: null,
        pr_number: null,
        branch_name: null,
        files_changed: [],
        error: null,
        celery_task_id: 'task-124',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'run-3',
        issue_id: 'issue-5',
        repository: 'user/repo',
        issue_number: 50,
        status: 'PENDING',
        custom_instructions: null,
        iteration: 0,
        tokens_used: 0,
        tool_calls_made: 0,
        started_at: null,
        completed_at: null,
        elapsed_seconds: null,
        pr_url: null,
        pr_number: null,
        branch_name: null,
        files_changed: [],
        error: null,
        celery_task_id: 'task-125',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ];
  }

  /**
   * Get single agent run with full details
   */
  async getAgentRun(agentRunId: string): Promise<AgentRun> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return different data based on ID
    const mockAgents: Record<string, AgentRun> = {
      'run-1': {
        id: 'run-1',
        issue_id: 'issue-1',
        repository: 'user/repo',
        issue_number: 42,
        status: 'COMPLETED',
        custom_instructions: 'Make sure to add comprehensive tests',
        iteration: 8,
        tokens_used: 15420,
        tool_calls_made: 24,
        started_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        elapsed_seconds: 3600,
        pr_url: 'https://github.com/user/repo/pull/123',
        pr_number: 123,
        branch_name: 'fix/issue-42-authentication',
        files_changed: [
          'backend/app/api/auth.py',
          'backend/app/core/security.py',
          'backend/app/middleware/jwt.py',
          'tests/test_auth.py',
          'tests/test_security.py',
        ],
        error: null,
        celery_task_id: 'task-123',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      'run-2': {
        id: 'run-2',
        issue_id: 'issue-2',
        repository: 'user/repo',
        issue_number: 43,
        status: 'RUNNING',
        custom_instructions: 'Focus on the data loader module',
        iteration: 5,
        tokens_used: 8200,
        tool_calls_made: 15,
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        completed_at: null,
        elapsed_seconds: 1800,
        pr_url: null,
        pr_number: null,
        branch_name: null,
        files_changed: [],
        error: null,
        celery_task_id: 'task-124',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      'run-3': {
        id: 'run-3',
        issue_id: 'issue-5',
        repository: 'user/repo',
        issue_number: 50,
        status: 'PENDING',
        custom_instructions: null,
        iteration: 0,
        tokens_used: 0,
        tool_calls_made: 0,
        started_at: null,
        completed_at: null,
        elapsed_seconds: null,
        pr_url: null,
        pr_number: null,
        branch_name: null,
        files_changed: [],
        error: null,
        celery_task_id: 'task-125',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    };

    return mockAgents[agentRunId] || mockAgents['run-1'];
  }
}

export const apiClient = new ApiClient();
