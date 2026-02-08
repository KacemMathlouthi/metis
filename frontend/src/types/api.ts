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

/**
 * GitHub Issue
 */
export interface Issue {
  id: string;  // Our UUID
  github_issue_id: number;
  repository: string;  // "owner/repo"
  issue_number: number;
  title: string;
  body: string | null;
  status: 'OPEN' | 'CLOSED';
  labels: string[];  // Array of label names
  assignees: string[];  // Array of GitHub usernames
  author: string;  // GitHub username
  created_at: string;  // ISO date
  updated_at: string | null;
  closed_at: string | null;
  comments_count: number;
}

/**
 * Issue comment
 */
export interface IssueComment {
  id: string;
  issue_id: string;
  github_comment_id: number;
  author: string;
  avatar_url: string | null;
  body: string;
  created_at: string;
}

/**
 * Agent run tracking
 */
export interface AgentRun {
  id: string;  // Agent execution ID
  issue_id: string;
  repository: string;
  issue_number: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  custom_instructions: string | null;

  // Execution metrics
  iteration: number;
  tokens_used: number;
  tool_calls_made: number;
  started_at: string | null;
  completed_at: string | null;
  elapsed_seconds: number | null;

  // Results
  pr_url: string | null;  // GitHub PR URL
  pr_number: number | null;
  branch_name: string | null;
  files_changed: string[];  // Array of file paths
  error: string | null;

  // Metadata
  celery_task_id: string | null;
  created_at: string;
}

/**
 * Issue with latest agent run (denormalized for list view)
 */
export interface IssueWithAgent extends Issue {
  latest_agent_run: AgentRun | null;
}

/**
 * Launch agent request
 */
export interface LaunchAgentRequest {
  issue_number: number;
  repository: string;
  custom_instructions: string | null;
}

/**
 * Launch agent response
 */
export interface LaunchAgentResponse {
  agent_run_id: string;
  celery_task_id: string;
  message: string;
}

export interface ReviewCommentRecord {
  id: string;
  review_id: string;
  title: string;
  file_path: string;
  line_number: number;
  line_end: number | null;
  comment_text: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  category:
    | 'BUG'
    | 'SECURITY'
    | 'PERFORMANCE'
    | 'STYLE'
    | 'MAINTAINABILITY'
    | 'DOCUMENTATION'
    | 'TESTING';
  github_comment_id: number | null;
  created_at: string;
}

export interface ReviewCommentReviewContext {
  repository: string;
  pr_number: number;
  review_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  commit_sha: string;
}

export interface ReviewCommentWithContext {
  comment: ReviewCommentRecord;
  review: ReviewCommentReviewContext;
}

export interface ReviewCommentsListResponse {
  items: ReviewCommentWithContext[];
  total: number;
  page: number;
  page_size: number;
}
