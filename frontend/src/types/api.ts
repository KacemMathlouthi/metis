/**
 * Type definitions for API responses and requests.
 *
 * Contains all interfaces and types used for backend API communication
 * including user data, repositories, reviews, and configuration objects.
 */

export interface User {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  github_id: number;
  last_login_at: string | null;
  is_active: boolean;
}

export interface Installation {
  id: string;
  github_installation_id: number;
  user_id: string;
  account_type: 'USER' | 'ORGANIZATION';
  account_name: string;
  repository: string;
  config: InstallationConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface InstallationConfig {
  sensitivity: string;
  custom_instructions: string;
  ignore_patterns: string[];
  auto_review_enabled: boolean;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  default_branch: string;
}

export interface GitHubInstallation {
  id: number;
  account: {
    login: string;
    type: string;
    avatar_url: string;
  };
  repository_selection: string;
  repositories: GitHubRepository[];
  created_at: string;
  updated_at: string;
}

export interface SyncInstallationsResponse {
  synced: number;
  created: number;
  updated: number;
  installations: Installation[];
}

export interface Review {
  id: string;
  pr_number: number;
  repository: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  review_text: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ReviewComment {
  id: string;
  review_id: string;
  file_path: string;
  line_number: number;
  line_end: number | null;
  comment_text: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  category: 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'STYLE' | 'MAINTAINABILITY' | 'DOCUMENTATION' | 'TESTING';
  created_at: string;
}
