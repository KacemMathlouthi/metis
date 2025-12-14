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

export interface Repository {
  id: string;
  repository: string;
  account_name: string;
  config: RepositoryConfig;
  is_active: boolean;
  created_at: string;
}

export interface RepositoryConfig {
  sensitivity: string;
  custom_instructions: string;
  ignore_patterns: string[];
  auto_review_enabled: boolean;
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
