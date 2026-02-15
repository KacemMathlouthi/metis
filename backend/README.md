# Metis Backend

AI-powered GitHub code review platform backend built with FastAPI, Celery, and PostgreSQL.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Core Workflows](#core-workflows)
- [AI Agent System](#ai-agent-system)
- [Getting Started](#getting-started)
- [Development](#development)
- [Database Management](#database-management)
- [Task Queue & Workers](#task-queue--workers)
- [Testing](#testing)
- [Configuration](#configuration)
- [Deployment](#deployment)

## Overview

The Metis backend is a production-grade FastAPI application that:

- Receives GitHub webhook events for pull requests and issues
- Analyzes code changes using AI agents in isolated sandboxes
- Posts intelligent, context-aware review comments directly on PRs
- Manages user authentication via GitHub OAuth 2.0
- Provides a REST API for the frontend dashboard
- Processes background tasks asynchronously using Celery

**Core Philosophy**: Asynchronous-first architecture that responds to webhooks in <500ms, then processes AI reviews in background workers.

## Architecture

### High-Level Flow

```
GitHub Event → Webhook Handler → Signature Verification → Queue Task → Return 202 Accepted
                                                              ↓
                                              Celery Worker picks task
                                                              ↓
                                              Create Daytona Sandbox
                                                              ↓
                                              Clone PR Branch
                                                              ↓
                                              Initialize AI Agent
                                                              ↓
                                              Run Agent Loop (plan → execute → evaluate)
                                                              ↓
                                              Post Findings to GitHub Progressively
                                                              ↓
                                              Complete Review & Cleanup
```

### System Architecture Diagram

```
┌─────────────┐
│   GitHub    │
│   Webhooks  │
└──────┬──────┘
       │
       │ POST /webhooks/github
       ▼
┌─────────────────────────────────────────────────────┐
│                  FastAPI Backend                    │
│  ┌────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Webhook   │  │   API    │  │  Auth (OAuth)  │  │
│  │  Handler   │  │  Routes  │  │  + JWT Tokens  │  │
│  └─────┬──────┘  └────┬─────┘  └────────┬───────┘  │
│        │              │                  │          │
│        │              │                  │          │
│        │         ┌────▼──────────────────▼────┐     │
│        │         │    PostgreSQL (async)      │     │
│        │         │   - Users                  │     │
│        │         │   - Installations          │     │
│        │         │   - Reviews                │     │
│        │         │   - ReviewComments         │     │
│        │         └────────────────────────────┘     │
│        │                                            │
│        │ Queue Task                                 │
│        ▼                                            │
│  ┌─────────────────┐                                │
│  │  Redis (Broker) │                                │
│  └────────┬────────┘                                │
└───────────┼─────────────────────────────────────────┘
            │
            │ Celery Task
            ▼
┌───────────────────────────────────────────────┐
│           Celery Worker                       │
│  ┌─────────────────────────────────────────┐  │
│  │     AI Agent System                     │  │
│  │  ┌────────────┐  ┌──────────────────┐   │  │
│  │  │  Agent     │  │  Daytona Sandbox │   │  │
│  │  │  Loop      │  │  (Isolated Env)  │   │  │
│  │  └─────┬──────┘  └────────┬─────────┘   │  │
│  │        │                  │             │  │
│  │        │ Execute Tools    │             │  │
│  │        ▼                  ▼             │  │
│  │  ┌──────────────────────────────────┐   │  │
│  │  │  Tools (23 total)                │   │  │
│  │  │  - File Ops (6)                  │   │  │
│  │  │  - Git Ops (8)                   │   │  │
│  │  │  - Process Execution (4)         │   │  │
│  │  │  - Review Posting (2)            │   │  │
│  │  │  - Completion (3)                │   │  │
│  │  └──────────────────────────────────┘   │  │
│  └─────────────────────────────────────────┘  │
│                    │                          │
│                    │ Post Review              │
│                    ▼                          │
│            ┌───────────────┐                  │
│            │  LiteLLM      │                  │
│            │  (Multi-LLM)  │                  │
│            └───────┬───────┘                  │
└────────────────────┼──────────────────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │   LLM Providers          │
         │   - Vertex AI (Gemini)   │
         │   - OpenAI (GPT)         │
         │   - Anthropic (Claude)   │
         │   - Mistral              │
         └──────────────────────────┘
```

## Tech Stack

### Core Framework
- **FastAPI** - Modern async web framework
- **Pydantic** - Data validation and settings management
- **SQLAlchemy 2.0** - Async ORM for database operations
- **Alembic** - Database migrations

### Data Layer
- **PostgreSQL** - Primary database
- **Redis** - Celery broker, result backend, and caching

### Task Queue
- **Celery** - Distributed task queue
- **Flower** - Celery monitoring UI

### AI & Agents
- **LiteLLM** - Multi-provider LLM client (Vertex AI, OpenAI, Anthropic, Mistral)
- **Daytona** - Sandbox runtime for safe code execution
- **LangSmith** - LLM observability and tracing

### Authentication & Security
- **GitHub OAuth 2.0** - User authentication
- **JWT (PyJWT)** - Token-based auth with HTTP-only cookies
- **Cryptography (Fernet)** - Token encryption at rest

### Code Quality
- **Ruff** - Fast Python linter and formatter
- **MyPy** - Static type checking
- **Pytest** - Testing framework
- **Pre-commit** - Git hooks for code quality

## Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app initialization, CORS, health checks
│   ├── api/                       # API route handlers
│   │   ├── auth.py                # OAuth, login, logout, /me
│   │   ├── installations.py       # Repository enrollment
│   │   ├── issues.py              # GitHub issues endpoints
│   │   ├── review_comments.py     # Review comment APIs
│   │   ├── analytics.py           # Analytics & metrics
│   │   └── webhooks.py            # GitHub webhook receiver
│   ├── core/                      # Core configuration & infrastructure
│   │   ├── config.py              # Pydantic Settings (env vars)
│   │   ├── client.py              # LiteLLM client factory
│   │   ├── security.py            # JWT + token encryption
│   │   ├── auth_deps.py           # get_current_user() dependency
│   │   ├── redis_client.py        # Redis singleton
│   │   └── celery_app.py          # Celery configuration
│   ├── db/                        # Database layer
│   │   ├── base.py                # Async engine & session factory
│   │   ├── session.py             # get_db() dependency
│   │   └── base_class.py          # Base model with UUID & timestamps
│   ├── models/                    # SQLAlchemy ORM models
│   │   ├── user.py                # User accounts
│   │   ├── installation.py        # GitHub App installations
│   │   ├── review.py              # Reviews & ReviewComments
│   │   └── metrics.py             # UsageMetrics & WebhookEvent
│   ├── repositories/              # Repository pattern (data access)
│   │   ├── user.py                # User CRUD
│   │   ├── installation.py        # Installation CRUD
│   │   └── review.py              # Review CRUD
│   ├── services/                  # Business logic
│   │   ├── github.py              # GitHub API client
│   │   ├── oauth.py               # OAuth flow
│   │   ├── webhook.py             # Webhook processing
│   │   └── pr_summary.py          # PR summary utilities
│   ├── agents/                    # AI Agent System
│   │   ├── base.py                # BaseAgent interface
│   │   ├── loop.py                # AgentLoop orchestrator
│   │   ├── implementation/        # Agent implementations
│   │   │   ├── review_agent.py    # Code review agent
│   │   │   ├── background_agent.py # Issue → PR agent
│   │   │   └── summary_agent.py   # PR summary agent
│   │   ├── prompts/               # System prompts
│   │   │   ├── reviewer_prompt.py
│   │   │   ├── coder_prompt.py
│   │   │   └── summary_prompt.py
│   │   ├── sandbox/               # Daytona integration
│   │   │   ├── client.py          # Daytona client wrapper
│   │   │   └── manager.py         # Sandbox lifecycle
│   │   └── tools/                 # Tool system (23 tools)
│   │       ├── base.py            # BaseTool interface
│   │       ├── file_tools.py      # 6 file operations
│   │       ├── git_tools.py       # 8 git operations
│   │       ├── process_tools.py   # 4 execution tools
│   │       ├── review_posting_tools.py # 2 review posting
│   │       ├── completion_tools.py     # 3 completion tools
│   │       └── manager.py         # ToolManager
│   ├── schemas/                   # Pydantic request/response models
│   │   ├── metis_config.py        # ReviewerConfig, SummaryConfig
│   │   └── installation.py        # Installation schemas
│   ├── tasks/                     # Celery background tasks
│   │   ├── agent_review_task.py   # PR review task
│   │   ├── summary_task.py        # PR summary task
│   │   └── background_agent_task.py # Issue → PR task
│   └── utils/                     # Utilities
│       ├── prompts.py             # Legacy prompts
│       └── agent_logger.py        # Structured logging
├── alembic/                       # Database migrations
│   ├── versions/                  # Migration files
│   └── env.py                     # Alembic config
├── logs/                          # Application logs
│   └── agents/                    # Agent execution logs
├── tests/                         # Test suite
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   └── fixtures/                  # Test fixtures
├── pyproject.toml                 # Dependencies & tool configs
├── alembic.ini                    # Alembic configuration
└── .env                           # Environment variables
```

## Key Components

### 1. API Layer (`app/api/`)

#### Authentication (`auth.py`)
- **`POST /api/auth/login`** - Initiates GitHub OAuth flow
- **`GET /api/auth/callback`** - Handles OAuth callback, creates JWT cookies
- **`POST /api/auth/refresh`** - Rotates refresh token, issues new access token
- **`POST /api/auth/logout`** - Clears auth cookies
- **`GET /api/auth/me`** - Returns current user info

#### Webhooks (`webhooks.py`)
- **`POST /webhooks/github`** - Receives GitHub webhook events
  - Validates HMAC-SHA256 signature
  - Processes `pull_request` events (opened, synchronize, reopened)
  - Creates pending Review in database
  - Queues Celery tasks for review and summary
  - Returns `202 Accepted` in <500ms

#### Installations (`installations.py`)
- **`GET /api/installations/github`** - Fetches installations from GitHub API
- **`POST /api/installations/sync`** - Syncs installations to database
- **`POST /api/installations/enable`** - Enables reviews for a repository
- **`PUT /api/installations/{id}/config`** - Updates review configuration

#### Analytics (`analytics.py`)
- **`GET /api/analytics/overview`** - Dashboard metrics
- **`GET /api/analytics/sidebar`** - Sidebar stats
- **`GET /api/analytics/dashboard`** - Detailed analytics

#### Review Comments (`review_comments.py`)
- **`GET /api/review-comments`** - Lists review comments with filters
- **`GET /api/review-comments/{id}`** - Gets single comment details

#### Issues (`issues.py`)
- **`GET /api/issues`** - Lists repository issues
- **`GET /api/issues/{number}`** - Gets issue details
- **`GET /api/issues/{number}/comments`** - Gets issue comments

### 2. Core Infrastructure (`app/core/`)

#### Configuration (`config.py`)
Pydantic Settings class loading configuration from environment:
```python
class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Redis
    REDIS_HOST: str
    REDIS_PORT: int

    # GitHub
    GITHUB_APP_ID: str
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_WEBHOOK_SECRET: str
    GITHUB_SECRET_KEY_PATH: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # LLM
    MODEL_NAME: str  # e.g., "vertex_ai/gemini-3-flash-preview"
    VERTEX_PROJECT: str | None
    VERTEX_LOCATION: str | None

    # Daytona
    DAYTONA_API_KEY: str
    DAYTONA_API_URL: str
    DAYTONA_TARGET: str

    # LangSmith (optional)
    LANGSMITH_TRACING: bool = False
    LANGSMITH_API_KEY: str | None
    LANGSMITH_PROJECT: str | None
```

#### Security (`security.py`)
- **JWT Generation/Verification**: Creates access and refresh tokens with type claims
- **Token Encryption**: Fernet symmetric encryption for OAuth tokens at rest
- **Password Hashing**: Bcrypt for secure password storage (if needed)

#### LiteLLM Client (`client.py`)
Multi-provider LLM client factory:
```python
client = LiteLLMClient()
response = await client.chat.completions.create(
    model=settings.MODEL_NAME,
    messages=[{"role": "user", "content": "Hello"}],
    tools=[...],  # Optional tool definitions
)
```

Supports providers via `MODEL_NAME` prefix:
- `vertex_ai/` → Google Vertex AI
- `gpt-4o` → OpenAI
- `claude-3-5-sonnet` → Anthropic
- `mistral/` → Mistral AI

#### Auth Dependency (`auth_deps.py`)
```python
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Validates JWT and returns current user."""
```

### 3. Database Layer (`app/db/`, `app/models/`)

#### Models

**User** (`models/user.py`)
```python
class User(Base):
    id: UUID
    github_id: int
    username: str
    email: str | None
    avatar_url: str | None
    access_token: str  # Encrypted
    created_at: datetime
    updated_at: datetime
```

**Installation** (`models/installation.py`)
```python
class Installation(Base):
    id: UUID
    github_installation_id: int
    repository: str  # Full name (owner/repo)
    is_active: bool
    config: dict  # ReviewerConfig as JSON
    user_id: UUID  # FK to User
    created_at: datetime
    updated_at: datetime

    # Composite unique constraint
    __table_args__ = (
        UniqueConstraint('github_installation_id', 'repository'),
    )
```

**Review** (`models/review.py`)
```python
class Review(Base):
    id: UUID
    pr_number: int
    status: ReviewStatus  # PENDING, PROCESSING, COMPLETED, FAILED
    installation_id: UUID  # FK to Installation
    celery_task_id: str | None
    head_branch: str
    base_branch: str
    language: str | None
    created_at: datetime
    updated_at: datetime

    # Relationships
    comments: list[ReviewComment]
```

**ReviewComment** (`models/review.py`)
```python
class ReviewComment(Base):
    id: UUID
    review_id: UUID  # FK to Review
    file_path: str
    line_number: int | None
    comment: str
    severity: Severity  # INFO, WARNING, ERROR, CRITICAL
    category: Category  # SECURITY, PERFORMANCE, STYLE, BUG, ...
    title: str | None
    github_comment_id: int | None  # bigint
    created_at: datetime
```

#### Repository Pattern (`app/repositories/`)

Encapsulates data access logic:
```python
class UserRepository:
    async def get_by_github_id(self, github_id: int) -> User | None
    async def create(self, **kwargs) -> User
    async def update(self, user: User, **kwargs) -> User

class InstallationRepository:
    async def get_by_repo(self, github_installation_id: int, repository: str) -> Installation | None
    async def activate(self, installation: Installation) -> Installation
    async def update_config(self, installation: Installation, config: dict) -> Installation

class ReviewRepository:
    async def create_pending_review(self, **kwargs) -> Review
    async def update_status(self, review: Review, status: ReviewStatus) -> Review
```

### 4. Services Layer (`app/services/`)

#### GitHub Service (`github.py`)

Handles GitHub API interactions:

```python
class GitHubService:
    async def _generate_jwt(self) -> str:
        """Creates 10-minute JWT for app authentication."""

    async def get_installation_token(self, installation_id: int) -> str:
        """Exchanges JWT for 1-hour installation token."""

    async def get_pr_diff(self, installation_id: int, owner: str, repo: str, pr_number: int) -> str:
        """Fetches PR diff."""

    async def create_pr_review(self, installation_id: int, owner: str, repo: str, pr_number: int, body: str, event: str) -> dict:
        """Posts review to PR."""

    async def post_review_comment(self, installation_id: int, owner: str, repo: str, pr_number: int, commit_sha: str, path: str, line: int, body: str) -> dict:
        """Posts inline review comment."""
```

#### OAuth Service (`oauth.py`)

```python
class OAuthService:
    async def get_access_token(self, code: str) -> str:
        """Exchanges OAuth code for access token."""

    async def get_user_info(self, access_token: str) -> dict:
        """Fetches user info from GitHub."""
```

#### Webhook Service (`webhook.py`)

```python
def verify_github_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verifies HMAC-SHA256 webhook signature."""

async def handle_pull_request(event: dict, db: AsyncSession) -> dict:
    """Processes pull_request webhook event."""
    # 1. Verify signature
    # 2. Lookup Installation
    # 3. Create Review (PENDING)
    # 4. Queue Celery tasks
    # 5. Return 202 Accepted
```

### 5. AI Agent System (`app/agents/`)

See [AI Agent System](#ai-agent-system) section below for detailed explanation.

### 6. Background Tasks (`app/tasks/`)

#### Agent Review Task (`agent_review_task.py`)

```python
@celery_app.task(bind=True, base=BaseTask)
def process_pr_review_with_agent(self, review_id: str):
    """
    Main Celery task for AI-powered PR reviews.

    Workflow:
    1. Load Review and Installation config
    2. Fetch installation token from GitHub
    3. Create Daytona sandbox
    4. Clone PR branch
    5. Initialize ReviewAgent with tools
    6. Run agent loop (agent posts findings progressively)
    7. Post final review summary to GitHub
    8. Update Review status
    9. Cleanup sandbox
    """
```

#### Summary Task (`summary_task.py`)

```python
@celery_app.task(bind=True, base=BaseTask)
def process_pr_summary_with_agent(self, review_id: str):
    """
    Generates and updates PR title and description.

    Workflow:
    1. Create sandbox with PR diff
    2. Run SummaryAgent
    3. Extract summary and title
    4. Update GitHub PR via API
    5. Store summary metadata on Review
    """
```

#### Background Agent Task (`background_agent_task.py`)

```python
@celery_app.task(bind=True, base=BaseTask)
def process_issue_with_agent(self, agent_run_id: str):
    """
    Autonomous Issue → PR workflow.

    Workflow:
    1. Load AgentRun and Installation
    2. Fetch issue context from GitHub
    3. Create sandbox from default branch
    4. Bootstrap git auth/identity
    5. Run BackgroundAgent (codes solution)
    6. Agent commits and pushes branch
    7. Create GitHub PR
    8. Update AgentRun with PR URL/number
    """
```

## Core Workflows

### 1. Webhook Reception (Async)

```
GitHub PR Event
      ↓
POST /webhooks/github
      ↓
Verify HMAC-SHA256 signature
      ↓
Lookup Installation by (github_installation_id, repository)
      ↓
Create Review (status=PENDING, head_branch, base_branch, language)
      ↓
Queue Celery tasks:
  - process_pr_review_with_agent.delay(review_id)
  - process_pr_summary_with_agent.delay(review_id)
      ↓
Return 202 Accepted (<500ms)
```

### 2. AI Agent Review Processing

```
Celery Worker picks task
      ↓
Update Review (status=PROCESSING)
      ↓
Fetch installation token from GitHub (1-hour TTL)
      ↓
Create Daytona sandbox (runtime based on language)
      ↓
Clone PR's head branch
      ↓
Initialize ReviewAgent with:
  - 11 tools (file ops + review posting)
  - System prompt (comprehensive review guidelines)
  - Installation token (for posting)
      ↓
Run AgentLoop.execute():
  ┌─────────────────────────────────────┐
  │ Loop until completion or limits:    │
  │                                     │
  │ 1. Plan (LLM decides tools to use)  │
  │        ↓                            │
  │ 2. Execute tools in parallel        │
  │        ↓                            │
  │ 3. Agent posts findings via:        │
  │    - post_inline_finding()          │
  │    - post_file_finding()            │
  │        ↓                            │
  │ 4. Evaluate (check limits)          │
  │        ↓                            │
  │ 5. Check if agent called            │
  │    finish_review()                  │
  │        ↓                            │
  │ If not done, repeat                 │
  └─────────────────────────────────────┘
      ↓
Extract final summary from finish_review()
      ↓
Post final review summary to GitHub
      ↓
Update Review (status=COMPLETED)
      ↓
Cleanup sandbox
```

### 3. PR Summary Processing (Parallel)

```
Webhook queues summary task (alongside review task)
      ↓
Create sandbox
      ↓
Initialize SummaryAgent with:
  - 5 tools (file ops + completion)
  - PR diff as context
      ↓
Run agent loop
      ↓
Agent analyzes diff and calls:
  finish_summary(summary_text, pr_title)
      ↓
Extract summary and title
      ↓
Update GitHub PR:
  - PATCH title
  - Append summary to body (\n---\n{summary})
      ↓
Store summary metadata on Review
      ↓
Cleanup sandbox
```

### 4. Issue → PR Workflow

```
User clicks "Launch Agent" on issue
      ↓
POST /api/agents/launch {issue_number, instructions}
      ↓
Create AgentRun (status=PENDING)
      ↓
Queue process_issue_with_agent.delay(agent_run_id)
      ↓
Return agent_run_id to frontend
      ↓
┌──────────────────────────────────────┐
│ Celery Worker:                       │
│                                      │
│ 1. Load AgentRun & Installation      │
│ 2. Fetch issue/repo from GitHub      │
│ 3. Create sandbox from default branch│
│ 4. Bootstrap git auth/identity       │
│ 5. Initialize BackgroundAgent with:  │
│    - 19 tools (file + git + process) │
│    - Issue description as task       │
│ 6. Run agent loop:                   │
│    - Agent codes solution            │
│    - Commits changes                 │
│    - Pushes to new branch            │
│    - Calls finish_task()             │
│ 7. Validate branch pushed to origin  │
│ 8. Create GitHub PR                  │
│ 9. Update AgentRun:                  │
│    - pr_number, pr_url               │
│    - status=COMPLETED                │
│    - changed_files                   │
│10. Cleanup sandbox                   │
└──────────────────────────────────────┘
      ↓
Frontend polls GET /api/agents/{agent_run_id}
      ↓
Displays progress in AgentProgressPage
```

### 5. GitHub App Authentication

```
Backend needs to call GitHub API
      ↓
Load private key (.pem file)
      ↓
Generate JWT (10-minute expiry):
  - iss: GITHUB_APP_ID
  - iat: current time
  - exp: current time + 10 minutes
      ↓
Sign JWT with private key (RS256)
      ↓
Call GitHub API:
  POST /app/installations/{installation_id}/access_tokens
  Authorization: Bearer {JWT}
      ↓
Receive installation token (1-hour expiry)
      ↓
Use installation token for subsequent API calls:
  Authorization: token {installation_token}
```

### 6. User OAuth Flow

```
User clicks "Login with GitHub"
      ↓
GET /api/auth/login
      ↓
Redirect to GitHub OAuth:
  https://github.com/login/oauth/authorize?
    client_id={GITHUB_CLIENT_ID}&
    redirect_uri={CALLBACK_URL}&
    scope=user:email,read:org
      ↓
User approves on GitHub
      ↓
GitHub redirects to callback:
  GET /api/auth/callback?code={CODE}
      ↓
Backend exchanges code for access token:
  POST https://github.com/login/oauth/access_token
      ↓
Fetch user info from GitHub:
  GET https://api.github.com/user
      ↓
Create or update User in database:
  - github_id, username, email, avatar_url
  - Encrypt and store access_token
      ↓
Generate JWT tokens:
  - Access token (30 min, type=access)
  - Refresh token (7 days, type=refresh)
      ↓
Set HTTP-only cookies:
  - access_token (httpOnly, secure, sameSite=lax)
  - refresh_token (httpOnly, secure, sameSite=lax)
      ↓
Redirect to dashboard
```

### 7. Protected Route Access

```
Frontend makes request to protected endpoint
      ↓
Backend extracts JWT from cookie
      ↓
Verify JWT signature
      ↓
Check token type claim (must be "access")
      ↓
Extract user_id from token payload
      ↓
Query User from database
      ↓
If User exists:
  - Inject into endpoint as dependency
  - Execute endpoint logic
Else:
  - Return 401 Unauthorized
      ↓
Frontend catches 401:
  - Attempt silent refresh (POST /api/auth/refresh)
  - If refresh succeeds, retry original request
  - If refresh fails, redirect to login
```

## AI Agent System

The AI agent system is the core of Metis's intelligence. It uses tool-augmented LLMs in isolated sandboxes to analyze code and post reviews.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Agent System                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    AgentLoop                             │  │
│  │                                                          │  │
│  │  while not agent.should_stop():                          │  │
│  │      agent.run()  # One iteration                        │  │
│  │                                                          │  │
│  │      1. Plan (LLM call with tools)                       │  │
│  │      2. Execute tools in parallel                        │  │
│  │      3. Handle results                                   │  │
│  │      4. Check completion (finish_* tool called?)         │  │
│  │      5. Check limits (iterations, tokens, time)          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    BaseAgent                             │  │
│  │                                                          │  │
│  │  - conversation: list[Message]                           │  │
│  │  - tools: list[Tool]                                     │  │
│  │  - sandbox: DaytonaWorkspace                             │  │
│  │  - iteration_count: int                                  │  │
│  │  - total_tokens: int                                     │  │
│  │                                                          │  │
│  │  Methods:                                                │  │
│  │  - run() -> bool                                         │  │
│  │  - should_stop() -> tuple[bool, str]                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
│  │ ReviewAgent │  │ BackgroundAgent  │  │ SummaryAgent    │   │
│  │             │  │                  │  │                 │   │
│  │ 11 tools    │  │ 19 tools         │  │ 5 tools         │   │
│  │ (read-only  │  │ (full CRUD +     │  │ (read + finish) │   │
│  │ + posting)  │  │ git + process)   │  │                 │   │
│  └─────────────┘  └──────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  Daytona Sandbox    │
                    │  - Isolated env     │
                    │  - Git cloned repo  │
                    │  - Runtime (py/ts)  │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  LiteLLM            │
                    │  (Multi-provider)   │
                    └─────────────────────┘
```

### Components

#### 1. BaseAgent (`agents/base.py`)

Abstract base class for all agents:

```python
class BaseAgent:
    def __init__(
        self,
        sandbox: DaytonaWorkspace,
        tools: list[Tool],
        system_prompt: str,
        task_description: str,
    ):
        self.sandbox = sandbox
        self.tools = tools
        self.conversation: list[Message] = []
        self.iteration_count = 0
        self.total_tokens = 0
        self.tool_call_count = 0
        self.start_time = time.time()
        self.consecutive_failures = 0

    async def run(self) -> bool:
        """
        Execute one iteration of the agent loop.

        Returns:
            bool: True if agent should continue, False if done
        """
        # 1. Call LLM with tools
        response = await self.llm_client.chat.completions.create(
            model=settings.MODEL_NAME,
            messages=self.conversation,
            tools=self.tool_definitions,
        )

        # 2. Update token count
        self.total_tokens += response.usage.total_tokens

        # 3. Execute tool calls in parallel
        if response.choices[0].message.tool_calls:
            results = await self._execute_tools(response.choices[0].message.tool_calls)

            # Check for completion tools
            if self._check_completion(results):
                return False  # Agent is done

        # 4. Increment iteration
        self.iteration_count += 1

        return True  # Continue

    def should_stop(self) -> tuple[bool, str]:
        """
        Check soft limits.

        Returns:
            (should_stop, reason)
        """
        # Iteration limit
        if self.iteration_count >= 50:
            return (True, "Iteration limit reached")

        # Token limit
        if self.total_tokens >= 200_000:
            return (True, "Token limit reached")

        # Time limit (5 minutes)
        if time.time() - self.start_time >= 300:
            return (True, "Time limit reached")

        # Circuit breaker (3 consecutive failures)
        if self.consecutive_failures >= 3:
            return (True, "Circuit breaker triggered")

        return (False, "")
```

#### 2. AgentLoop (`agents/loop.py`)

Orchestrates the agent execution:

```python
class AgentLoop:
    async def execute(self, agent: BaseAgent) -> dict:
        """
        Run agent loop until completion or limits.

        Returns:
            dict: Final state (status, iterations, tokens, etc.)
        """
        while True:
            # Check limits first
            should_stop, reason = agent.should_stop()
            if should_stop:
                return {
                    "status": "stopped",
                    "reason": reason,
                    "iterations": agent.iteration_count,
                    "tokens": agent.total_tokens,
                }

            # Run one iteration
            continue_loop = await agent.run()

            if not continue_loop:
                # Agent signaled completion
                return {
                    "status": "completed",
                    "iterations": agent.iteration_count,
                    "tokens": agent.total_tokens,
                }
```

#### 3. ReviewAgent (`agents/implementation/review_agent.py`)

Specialized agent for code review:

**Tools (11 total)**:
- **File Tools (4)**: read_file, list_files, search_files, replace_in_files (read-only for verification)
- **Process Tools (3)**: run_command, run_tests, run_linter
- **Review Posting Tools (2)**: post_inline_finding, post_file_finding
- **Completion Tools (2)**: finish_review, finish_task

**Workflow**:
1. Reads PR diff and changed files
2. Searches for relevant code patterns
3. Runs tests/linters for verification
4. **Posts findings progressively** as it discovers them
5. Calls `finish_review(summary)` when done

**Key Features**:
- Progressive posting (findings appear on GitHub in real-time)
- Context-aware analysis (understands project structure)
- Severity classification (INFO, WARNING, ERROR, CRITICAL)
- Category tagging (SECURITY, PERFORMANCE, BUG, STYLE, etc.)

#### 4. BackgroundAgent (`agents/implementation/background_agent.py`)

Autonomous coder for Issue → PR:

**Tools (19 total)**:
- **File Tools (6)**: Full CRUD (read, list, search, replace, create, delete)
- **Git Tools (8)**: status, branches, create_branch, checkout, add, commit, push, pull
- **Process Tools (4)**: command, code, tests, linter
- **Completion Tools (1)**: finish_task

**Workflow**:
1. Reads issue description
2. Explores codebase to understand context
3. Codes solution
4. Runs tests to verify
5. Commits and pushes to new branch
6. Calls `finish_task(branch_name, changed_files)`

#### 5. SummaryAgent (`agents/implementation/summary_agent.py`)

Generates PR summaries and titles:

**Tools (5 total)**:
- **File Tools (4)**: read_file, list_files, search_files, replace_in_files (read-only)
- **Completion Tools (1)**: finish_summary

**Workflow**:
1. Analyzes PR diff
2. Identifies key changes
3. Generates concise title (<70 chars)
4. Writes summary with bullet points
5. Calls `finish_summary(summary_text, pr_title)`

### Tool System (`agents/tools/`)

#### Tool Categories

**1. File Tools (6)** (`file_tools.py`)
```python
- read_file(file_path: str) -> str
- list_files(directory: str = ".", pattern: str = "*") -> list[str]
- search_files(pattern: str, file_pattern: str = "*") -> dict[str, list[str]]
- replace_in_files(file_path: str, old_text: str, new_text: str) -> bool
- create_file(file_path: str, content: str) -> bool
- delete_file(file_path: str) -> bool
```

**2. Git Tools (8)** (`git_tools.py`)
```python
- git_status() -> str
- git_branches() -> list[str]
- git_create_branch(branch_name: str) -> bool
- git_checkout_branch(branch_name: str) -> bool
- git_add(file_path: str) -> bool
- git_commit(message: str) -> bool
- git_push(branch_name: str) -> bool
- git_pull() -> bool
```

**3. Process Tools (4)** (`process_tools.py`)
```python
- run_command(command: str) -> str
- run_code(code: str, language: str) -> str
- run_tests(test_path: str = "") -> str
- run_linter(file_path: str = "") -> str
```

**4. Review Posting Tools (2)** (`review_posting_tools.py`)
```python
- post_inline_finding(
    file_path: str,
    line_number: int,
    finding_text: str,
    severity: str,
    category: str,
    title: str,
  ) -> bool

- post_file_finding(
    file_path: str,
    finding_text: str,
    severity: str,
    category: str,
    title: str,
  ) -> bool
```

**5. Completion Tools (3)** (`completion_tools.py`)
```python
- finish_review(summary: str) -> str
- finish_task(branch_name: str, changed_files: list[str]) -> str
- finish_summary(summary_text: str, pr_title: str) -> str
```

#### Tool Execution

All tools execute via Daytona SDK with:
- **Parallel execution**: Multiple tools run concurrently
- **Auto path prefixing**: Relative paths → `workspace/repo/{path}`
- **Error handling**: Each tool returns `ToolResult(success, data, error)`
- **Timeouts**: Configurable per tool type

```python
class ToolResult:
    success: bool
    data: Any
    error: str | None
```

### Daytona Sandbox (`agents/sandbox/`)

Isolated code execution environment:

#### Features
- **Safe execution**: Isolated from host system
- **Git authentication**: Pre-configured with GitHub tokens
- **Branch cloning**: Automatically clones PR branch
- **Multi-language support**: Python, TypeScript, JavaScript runtimes
- **Auto-cleanup**: Destroys sandbox after task completion

#### Lifecycle

```python
# 1. Create sandbox
sandbox_manager = SandboxManager(settings.DAYTONA_API_KEY)
workspace = await sandbox_manager.create_workspace(
    runtime="python",  # or "typescript", "javascript"
    git_url=f"https://github.com/{owner}/{repo}",
    branch=pr_head_branch,
    token=installation_token,
)

# 2. Use sandbox
result = await workspace.execute_command("pytest tests/")

# 3. Cleanup
await sandbox_manager.destroy_workspace(workspace.id)
```

### Limits & Safety

#### Soft Limits
- **50 iterations** max per agent run
- **200K tokens** max (context + completions)
- **100 tool calls** max
- **5 minutes** max duration

#### Circuit Breaker
Stops agent after **3 consecutive tool failures** (all tools in iteration failed).

#### Token Counting
Uses `response.usage.total_tokens` from LiteLLM response for accurate tracking across providers.

### Observability

#### LangSmith Tracing
Full conversation tracking via LiteLLM native callbacks:
- Tool calls and results
- Token usage per iteration
- Latency metrics
- Error traces

View at: `https://smith.langchain.com`

#### File Logging
Structured JSON logs saved to:
```
backend/logs/agents/{agent_id}_{timestamp}.log
```

Log format:
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "INFO",
  "iteration": 3,
  "tool_calls": ["read_file", "search_files"],
  "tokens_used": 1250,
  "total_tokens": 3750,
  "message": "Iteration 3 completed"
}
```

## Getting Started

### Prerequisites

- **Python 3.10+**
- **PostgreSQL 14+**
- **Redis 6+**
- **Docker & Docker Compose** (for local infrastructure)
- **GitHub App** (see `docs/GITHUB_APP_SETUP.md`)
- **Daytona Account** (https://app.daytona.io) or self-hosted instance
- **UV** package manager (https://github.com/astral-sh/uv)

### Installation

1. **Clone repository**:
```bash
git clone https://github.com/yourusername/metis.git
cd metis/backend
```

2. **Install dependencies**:
```bash
uv sync
```

This installs all dependencies defined in `pyproject.toml`.

3. **Start infrastructure**:
```bash
docker-compose -f ../docker-compose.dev.yml up -d
```

Services started:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- pgAdmin: `http://localhost:5050` (admin@example.com / admin)
- Redis Insight: `http://localhost:5540`

4. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your credentials
```

Required variables:
```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/metis

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# GitHub App
GITHUB_APP_ID=your_app_id
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_SECRET_KEY_PATH=./your-app.private-key.pem

# JWT
JWT_SECRET_KEY=your_secret_key_here

# LLM (Vertex AI example)
MODEL_NAME=vertex_ai/gemini-3-flash-preview
VERTEX_PROJECT=your-gcp-project-id
VERTEX_LOCATION=global

# Daytona
DAYTONA_API_KEY=your_daytona_api_key
DAYTONA_API_URL=https://api.daytona.io
DAYTONA_TARGET=eu

# LangSmith (optional)
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=your_langsmith_key
LANGSMITH_PROJECT=metis
```

5. **Run migrations**:
```bash
alembic upgrade head
```

6. **Start backend**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend available at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

7. **Start Celery worker** (in separate terminal):
```bash
cd backend
celery -A app.core.celery_app worker --loglevel=info
```

8. **Start Flower** (optional, for monitoring):
```bash
celery -A app.core.celery_app flower --port=5555
```

Flower UI: `http://localhost:5555`

## Development

### Project Standards

This is a **production-grade codebase**. All code must meet:

- **Code quality**: Clean, readable, well-structured
- **Performance**: Async where it matters, efficient queries
- **Security**: Input validation, no secrets in code, OWASP awareness
- **Type safety**: Full type hints, no `Any` unless unavoidable
- **Error handling**: Graceful degradation, meaningful errors
- **Testing**: Write testable code with clear interfaces

### Code Quality Tools

#### Linting
```bash
ruff check .
```

Ruff is configured in `pyproject.toml` with 100+ rules enabled.

#### Formatting
```bash
ruff format .
```

100-character line length, black-compatible.

#### Type Checking
```bash
mypy app/
```

Strict mode enabled (`disallow_untyped_defs = true`).

#### Pre-commit Hooks
```bash
pre-commit install
pre-commit run --all-files
```

Runs on every commit:
- Ruff linting
- Ruff formatting
- MyPy type checking
- Trailing whitespace removal
- YAML/JSON validation

### Development Workflow

1. **Create feature branch**:
```bash
git checkout -b feature/your-feature
```

2. **Make changes** and ensure quality:
```bash
ruff check .
ruff format .
mypy app/
pytest
```

3. **Create migration** (if models changed):
```bash
alembic revision --autogenerate -m "Add new field to User"
alembic upgrade head
```

4. **Commit and push**:
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature
```

5. **Open pull request** on GitHub

### Hot Reloading

Backend auto-reloads on file changes when running with `--reload`:
```bash
uvicorn app.main:app --reload
```

Celery worker must be manually restarted after code changes.

### Debugging

#### FastAPI Debug Mode
Set in `.env`:
```bash
DEBUG=true
```

Enables:
- Detailed error traces
- Hot reloading
- Debug logs

#### Celery Task Debugging
Add breakpoints in task code:
```python
import pdb; pdb.set_trace()
```

Run Celery with single worker:
```bash
celery -A app.core.celery_app worker --loglevel=debug --concurrency=1
```

#### Agent Debugging
Check agent logs:
```bash
tail -f logs/agents/*.log
```

View LangSmith traces:
```bash
# Ensure LANGSMITH_TRACING=true in .env
# Visit https://smith.langchain.com
```

## Database Management

### Migrations

#### Create Migration
After modifying models:
```bash
alembic revision --autogenerate -m "Description of change"
```

Review generated migration in `alembic/versions/`, then apply:
```bash
alembic upgrade head
```

#### Rollback Migration
```bash
alembic downgrade -1  # Go back one migration
alembic downgrade base  # Reset to empty database
```

#### View Migration History
```bash
alembic history
alembic current  # Show current migration
```

### Database Access

#### pgAdmin
Web UI for database management:
- URL: `http://localhost:5050`
- Email: `admin@example.com`
- Password: `admin`

Add server:
- Host: `postgres` (Docker network) or `localhost`
- Port: `5432`
- Database: `metis`
- Username: `postgres`
- Password: `postgres`

#### psql CLI
```bash
docker exec -it metis-postgres psql -U postgres -d metis
```

Common commands:
```sql
\dt                    -- List tables
\d users               -- Describe table
SELECT * FROM users;   -- Query data
```

### Backup & Restore

#### Backup
```bash
docker exec metis-postgres pg_dump -U postgres metis > backup.sql
```

#### Restore
```bash
docker exec -i metis-postgres psql -U postgres metis < backup.sql
```

### Database Seeding

For development, seed with test data:
```bash
python -m app.scripts.seed_db
```

## Task Queue & Workers

### Celery Configuration

Configured in `app/core/celery_app.py`:
- **Broker**: Redis DB 0 (`redis://localhost:6379/0`)
- **Result backend**: Redis DB 1 (`redis://localhost:6379/1`)
- **Serialization**: JSON (for security)
- **Task acks late**: True (reliability)
- **Prefetch multiplier**: 1 (fair distribution)

### Running Workers

#### Single Worker (Development)
```bash
celery -A app.core.celery_app worker --loglevel=info
```

#### Multiple Workers (Production)
```bash
celery -A app.core.celery_app worker --loglevel=info --concurrency=4
```

#### Named Worker Pools
```bash
# Reviews worker
celery -A app.core.celery_app worker -Q reviews --loglevel=info

# Summaries worker
celery -A app.core.celery_app worker -Q summaries --loglevel=info
```

### Monitoring

#### Flower Web UI
```bash
celery -A app.core.celery_app flower --port=5555
```

Visit: `http://localhost:5555`

Features:
- Real-time task monitoring
- Worker status
- Task history
- Rate limiting controls

#### CLI Monitoring
```bash
# Worker status
celery -A app.core.celery_app inspect active

# Registered tasks
celery -A app.core.celery_app inspect registered

# Task stats
celery -A app.core.celery_app inspect stats
```

### Task Retry Logic

Configured with exponential backoff:
```python
@celery_app.task(
    bind=True,
    max_retries=3,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True,
)
def my_task(self):
    ...
```

Retry schedule:
- 1st retry: ~5 seconds
- 2nd retry: ~25 seconds
- 3rd retry: ~125 seconds

### Purging Tasks

```bash
# Purge all tasks
celery -A app.core.celery_app purge

# Purge specific queue
celery -A app.core.celery_app purge -Q reviews
```

## Testing

### Running Tests

#### All Tests
```bash
pytest
```

#### Unit Tests Only
```bash
pytest tests/unit
```

#### Integration Tests Only
```bash
pytest tests/integration
```

#### Specific Test
```bash
pytest tests/unit/test_github_service.py::test_generate_jwt
```

#### With Coverage
```bash
pytest --cov=app --cov-report=html
```

View coverage report:
```bash
open htmlcov/index.html
```

### Test Structure

```
tests/
├── unit/                      # Unit tests (no external deps)
│   ├── test_github_service.py
│   ├── test_oauth_service.py
│   └── test_webhook_service.py
├── integration/               # Integration tests (DB, Redis)
│   ├── test_auth_endpoints.py
│   ├── test_webhook_endpoints.py
│   └── test_installation_endpoints.py
└── fixtures/                  # Shared test fixtures
    ├── database.py
    ├── redis.py
    └── mocks.py
```

### Writing Tests

#### Unit Test Example
```python
import pytest
from app.services.github import GitHubService

@pytest.mark.asyncio
async def test_generate_jwt():
    """Test JWT generation for GitHub App auth."""
    service = GitHubService()
    jwt = await service._generate_jwt()

    assert jwt is not None
    assert len(jwt.split('.')) == 3  # Header.Payload.Signature
```

#### Integration Test Example
```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_login_endpoint(client: AsyncClient):
    """Test OAuth login redirect."""
    response = await client.get("/api/auth/login")

    assert response.status_code == 302
    assert "github.com" in response.headers["location"]
```

### Test Fixtures

Shared fixtures in `tests/fixtures/`:

```python
@pytest.fixture
async def db_session():
    """Async database session for tests."""
    async with async_session_maker() as session:
        yield session
        await session.rollback()

@pytest.fixture
async def client():
    """Async HTTP client for API tests."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
def mock_github_api():
    """Mock GitHub API responses."""
    with patch("app.services.github.httpx.AsyncClient") as mock:
        yield mock
```

## Configuration

### Environment Variables

All configuration loaded from `.env` via `app/core/config.py`:

#### Database
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/metis
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
```

#### Redis
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional
REDIS_DB=0
REDIS_MAX_CONNECTIONS=50
```

#### GitHub App
```bash
GITHUB_APP_ID=123456
GITHUB_CLIENT_ID=Iv1.abc123
GITHUB_CLIENT_SECRET=secret
GITHUB_WEBHOOK_SECRET=webhook_secret
GITHUB_SECRET_KEY_PATH=./app.private-key.pem
```

#### JWT Tokens
```bash
JWT_SECRET_KEY=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENCRYPTION_KEY=your-fernet-key-base64-encoded
```

Generate Fernet key:
```python
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

#### LLM Provider (Vertex AI)
```bash
MODEL_NAME=vertex_ai/gemini-3-flash-preview
VERTEX_PROJECT=your-gcp-project
VERTEX_LOCATION=global
```

For Vertex AI, authenticate:
```bash
gcloud auth application-default login
```

#### LLM Provider (OpenAI)
```bash
MODEL_NAME=gpt-4o
OPENAI_API_KEY=sk-...
```

#### LLM Provider (Anthropic)
```bash
MODEL_NAME=claude-3-5-sonnet-20241022
ANTHROPIC_API_KEY=sk-ant-...
```

#### Daytona Sandbox
```bash
DAYTONA_API_KEY=your_api_key
DAYTONA_API_URL=https://api.daytona.io  # Cloud
# DAYTONA_API_URL=http://localhost:3000/api  # Self-hosted
DAYTONA_TARGET=eu  # eu, us, or local
```

#### LangSmith (Optional)
```bash
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_pt_...
LANGSMITH_PROJECT=metis
```

#### Application
```bash
DEBUG=false
ENVIRONMENT=development  # development, staging, production
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Switching LLM Providers

Change `MODEL_NAME` in `.env`:

```bash
# Vertex AI (Google)
MODEL_NAME=vertex_ai/gemini-3-flash-preview

# OpenAI
MODEL_NAME=gpt-4o

# Anthropic
MODEL_NAME=claude-3-5-sonnet-20241022

# Mistral
MODEL_NAME=mistral/mistral-large-latest
```

No code changes required. LiteLLM handles provider differences.

## Deployment

### Docker

#### Build Image
```bash
docker build -t metis-backend:latest .
```

#### Run Container
```bash
docker run -d \
  --name metis-backend \
  -p 8000:8000 \
  --env-file .env \
  metis-backend:latest
```

### Production Considerations

#### Database
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- Enable SSL connections
- Set up connection pooling (PgBouncer)
- Regular backups with point-in-time recovery

#### Redis
- Use managed Redis (AWS ElastiCache, Google Memorystore, etc.)
- Enable persistence (AOF + RDB)
- Set up replication for high availability

#### Celery Workers
- Run multiple workers across different machines
- Use supervisor or systemd for process management
- Set up separate queues for different task types
- Monitor with Flower + Prometheus

#### Security
- Use HTTPS only (TLS 1.3+)
- Rotate JWT secrets regularly
- Store secrets in vault (AWS Secrets Manager, HashiCorp Vault)
- Enable CORS only for trusted origins
- Rate limiting on public endpoints
- Database connection encryption

#### Monitoring
- Application logs: Structured JSON to stdout
- Metrics: Prometheus + Grafana
- Tracing: LangSmith + OpenTelemetry
- Error tracking: Sentry
- Uptime monitoring: Pingdom, UptimeRobot

#### Performance
- Enable Redis caching for PR diffs and GitHub tokens
- Use CDN for static assets
- Database query optimization (EXPLAIN ANALYZE)
- Connection pooling tuning
- Horizontal scaling of Celery workers

#### Health Checks
Endpoints available:
- `GET /health` - Basic health check
- `GET /health/db` - Database connectivity
- `GET /health/redis` - Redis connectivity
- `GET /health/celery` - Celery worker status

### Kubernetes Deployment

See `infrastructure/k8s/` for Kubernetes manifests:
- Deployment for FastAPI app
- StatefulSet for Celery workers
- Service definitions
- ConfigMaps and Secrets
- Ingress with TLS

Deploy:
```bash
kubectl apply -f infrastructure/k8s/
```

---

## License

MIT License - See LICENSE file for details.

## Support

- **Documentation**: See `docs/` directory
- **Issues**: GitHub Issues
- **Contributing**: See `CONTRIBUTING.md`
