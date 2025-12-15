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
}

export const apiClient = new ApiClient();
