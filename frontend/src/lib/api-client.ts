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
  IssueComment,
  AgentRun,
  LaunchAgentRequest,
  LaunchAgentResponse,
  ReviewCommentsListResponse,
  AnalyticsOverviewResponse,
  DashboardAnalyticsResponse,
  SidebarAnalyticsResponse,
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
   * List review comments with pagination and filters.
   */
  async listReviewComments(params: {
    repository?: string;
    review_id?: string;
    severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    category?: 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'STYLE' | 'MAINTAINABILITY' | 'DOCUMENTATION' | 'TESTING';
    review_status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    created_from?: string;
    created_to?: string;
    page?: number;
    page_size?: number;
  }): Promise<ReviewCommentsListResponse> {
    const query = new URLSearchParams();

    if (params.repository) query.set('repository', params.repository);
    if (params.review_id) query.set('review_id', params.review_id);
    if (params.severity) query.set('severity', params.severity);
    if (params.category) query.set('category', params.category);
    if (params.review_status) query.set('review_status', params.review_status);
    if (params.created_from) query.set('created_from', params.created_from);
    if (params.created_to) query.set('created_to', params.created_to);
    query.set('page', String(params.page ?? 1));
    query.set('page_size', String(params.page_size ?? 20));

    return this.request<ReviewCommentsListResponse>(`/api/review-comments?${query.toString()}`);
  }

  /**
   * Get analytics overview for statistics tab.
   */
  async getAnalyticsOverview(repository: string): Promise<AnalyticsOverviewResponse> {
    return this.request<AnalyticsOverviewResponse>(
      `/api/analytics/overview?repository=${encodeURIComponent(repository)}`
    );
  }

  /**
   * Get dashboard cards analytics.
   */
  async getDashboardAnalytics(
    repository: string,
    days: number = 30
  ): Promise<DashboardAnalyticsResponse> {
    return this.request<DashboardAnalyticsResponse>(
      `/api/analytics/dashboard?repository=${encodeURIComponent(repository)}&days=${days}`
    );
  }

  /**
   * Get sidebar cards analytics.
   */
  async getSidebarAnalytics(
    repository: string,
    days: number = 30
  ): Promise<SidebarAnalyticsResponse> {
    return this.request<SidebarAnalyticsResponse>(
      `/api/analytics/sidebar?repository=${encodeURIComponent(repository)}&days=${days}`
    );
  }

  /**
   * Get all agent runs for a specific issue
   */
  async getIssueAgentRuns(issueNumber: number, repository: string): Promise<AgentRun[]> {
    return this.request<AgentRun[]>(
      `/api/issues/${issueNumber}/agent-runs?repository=${encodeURIComponent(repository)}`
    );
  }

  // ==================== Agent Endpoints ====================

  /**
   * Launch an agent to solve an issue
   */
  async launchAgent(data: LaunchAgentRequest): Promise<LaunchAgentResponse> {
    return this.request<LaunchAgentResponse>('/api/agents/launch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * List all agent runs for a repository
   */
  async listAgentRuns(repository: string): Promise<AgentRun[]> {
    return this.request<AgentRun[]>(
      `/api/agents?repository=${encodeURIComponent(repository)}`
    );
  }

  /**
   * Get single agent run with full details
   */
  async getAgentRun(agentRunId: string): Promise<AgentRun> {
    return this.request<AgentRun>(`/api/agents/${agentRunId}`);
  }
}

export const apiClient = new ApiClient();
