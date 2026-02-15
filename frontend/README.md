# Metis Frontend

Modern React dashboard for AI-powered GitHub code review platform. Built with React 19, TypeScript, Vite, and a neo-brutalist design system.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Development](#development)
- [State Management](#state-management)

## Overview

The Metis frontend is a React application that provides:

- **Landing Page** - Hero section, features, code preview terminal
- **Authentication Flow** - GitHub OAuth integration with JWT cookies
- **Dashboard** - Repository management, analytics, AI review configuration
- **Issues & Agent Runs** - Track GitHub issues and autonomous coding agents
- **Agent Updates** - Agent progress monitoring with polling
- **Analytics** - Charts, metrics, and review comment insights

**Design Philosophy**: Neo-brutalist aesthetic with bold borders, hard shadows, and high-contrast colors. Optimized for performance with React Compiler and Rolldown-based Vite.

## Tech Stack

### Core Framework
- **React 19** - Latest React with automatic memoization
- **TypeScript 5.9** - Strict type checking
- **Vite (Rolldown)** - `rolldown-vite@7.2.5` for blazing-fast builds
- **React Router v7** - Client-side routing

### UI & Styling
- **Tailwind CSS v4** - Utility-first CSS with Vite plugin
- **shadcn/ui** - Radix UI-based component library
- **Radix UI Primitives** - Accessible, unstyled components
- **Lucide Icons** - Beautiful icon set
- **React Icons** - Additional icons (simple-icons for language logos)

### State Management
- **React Context API** - No external state library needed
  - `AuthContext` - User authentication state
  - `RepositoryContext` - Workspace/repository selection
  - `ToastContext` - Toast notifications

### Code Quality
- **ESLint** - TypeScript-aware linting
- **Prettier** - Code formatting with Tailwind plugin
- **TypeScript** - Full type safety
- **Husky + Lint-staged** - Pre-commit hooks

## Design System

### Neo-Brutalist Aesthetic

The frontend uses a distinctive neo-brutalist design:

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx                    # Application entry point
│   ├── App.tsx                     # Root component with providers
│   ├── assets/                     # Static assets
│   │   ├── lechat.gif              # LeChat AI agent animation
│   │   └── Handshake-with-AI.png   # Landing hero visual
│   ├── components/
│   │   ├── ProtectedRoute.tsx      # Auth guard for dashboard routes
│   │   ├── UnsavedChangesBar.tsx   # Floating save bar
│   │   ├── dashboard/              # Dashboard-specific components
│   │   │   ├── DashboardLayout.tsx # Main layout wrapper
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   ├── analytics/          # Analytics components
│   │   │   │   ├── AnalyticsStatisticsTab.tsx
│   │   │   │   ├── AnalyticsIssuesTab.tsx
│   │   │   │   └── AnalyticsCommentSheet.tsx
│   │   │   └── agent-progress/     # Agent run components
│   │   │       ├── AgentRunHeader.tsx
│   │   │       ├── AgentRunStatsCards.tsx
│   │   │       ├── AgentRunTimeline.tsx
│   │   │       ├── AgentRunMetadataPanel.tsx
│   │   │       ├── types.ts
│   │   │       └── utils.tsx
│   │   ├── issues/                 # Issues & agent runs
│   │   │   ├── IssuesTable.tsx
│   │   │   ├── AgentRunsTable.tsx
│   │   │   ├── AgentStatusBadge.tsx
│   │   │   ├── LaunchAgentDialog.tsx
│   │   │   ├── IssueCommentCard.tsx
│   │   │   └── LabelBadge.tsx
│   │   ├── landing/                # Landing page sections
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Marquee.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── CodeTerminal.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                     # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── PixelBlast.tsx     # Animated background
│   │       └── ...
│   ├── contexts/                   # React Context providers
│   │   ├── AuthContext.tsx         # Authentication state
│   │   ├── RepositoryContext.tsx   # Workspace state
│   │   └── ToastContext.tsx        # Toast notifications
│   ├── hooks/                      # Custom React hooks
│   │   └── use-mobile.ts           # Mobile detection
│   ├── lib/                        # Utility libraries
│   │   ├── api-client.ts           # Backend API client
│   │   ├── language-icons.tsx      # Language logo utilities
│   │   └── utils.ts                # Helper functions (cn, truncateText)
│   ├── pages/                      # Route pages
│   │   ├── LandingPage.tsx         # Marketing landing
│   │   ├── LoginPage.tsx           # GitHub OAuth login
│   │   ├── CallbackPage.tsx        # OAuth callback handler
│   │   ├── NotFoundPage.tsx        # 404 page
│   │   └── dashboard/              # Dashboard pages
│   │       ├── DashboardPage.tsx
│   │       ├── AnalyticsPage.tsx
│   │       ├── AIReviewPage.tsx
│   │       ├── RepositoriesPage.tsx
│   │       ├── IssuesPage.tsx
│   │       ├── IssueDetailPage.tsx
│   │       └── AgentProgressPage.tsx
│   └── types/                      # TypeScript definitions
│       └── api.ts                  # Backend API types
├── public/                         # Static files
├── index.html                      # HTML entry point
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript config
├── tsconfig.app.json               # App-specific TS config
├── tsconfig.node.json              # Node-specific TS config
├── vite.config.ts                  # Vite configuration
├── tailwind.config.ts              # Tailwind configuration
├── eslint.config.js                # ESLint configuration
└── .prettierrc                     # Prettier configuration
```

## Key Features

### 1. Authentication System

**GitHub OAuth Integration**:
- Redirects to GitHub for authorization
- Receives callback with code
- Backend exchanges for tokens
- Sets HTTP-only cookies
- Automatic silent refresh on 401

### 2. Repository Management

**Features**:
- Sync installations from GitHub
- Enable/disable repositories for review
- Configure AI review settings per repository
- Language-specific icons (17+ languages)

### 3. Analytics Dashboard

**Components**:
- **Statistics Tab**: Charts for reviews, comments, trends
- **AI Issues Tab**: Review comments table with filters
- **Comment Sheet**: Detailed view of individual findings

**Data Visualization**:
- Line charts (Recharts)
- Stat cards with metrics

### 4. Issues & Agent Runs

**Features**:
- List GitHub issues with filters
- Launch autonomous agents on issues
- Track agent progress in real-time
- View agent run history and metrics

**Key Components**:
- `IssuesTable` - Paginated issue list with labels
- `AgentRunsTable` - Agent run history with PR links
- `LaunchAgentDialog` - Configure and start agents
- `AgentProgressPage` - Real-time progress monitoring

### 5. AI Review Configuration

**Config Editor**:
- Sensitivity levels (INFO, WARNING, ERROR, CRITICAL)
- Custom instructions for AI reviewers
- Ignore patterns (files/paths to skip)

**Dirty Tracking**:
- Unsaved changes bar appears when config modified
- Save/Discard actions
- Prevents data loss

### 6. Toast Notifications

**Custom Toast System**:
- Uses Alert component (not external library)
- Bottom-left position
- Auto-dismiss after 5 seconds
- Success (emerald) and error (rose) variants

## Getting Started

### Prerequisites

- **Node.js 20+**
- **pnpm** (recommended) or npm
- **Backend running** at `http://localhost:8000`

### Installation

1. **Install dependencies**:
```bash
cd frontend
pnpm install
```

2. **Configure environment** (if needed):

Frontend uses relative paths, so no `.env` required for local development. Backend URL is hardcoded as `/api`.

If you need to override backend URL:
```bash
# Create .env.local (optional)
VITE_API_URL=http://localhost:8000
```

3. **Start dev server**:
```bash
pnpm dev
```

Frontend available at: `http://localhost:5173`

## Development

### Available Scripts

```bash
# Development server (with hot reload)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint

# Lint and fix
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Environment Variables

**Build-time Variables**:
```bash
# .env.production
VITE_API_URL=https://api.metis.example.com
```

## License

MIT License - See LICENSE file for details.