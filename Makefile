SHELL := /bin/bash
.DEFAULT_GOAL := help

COMPOSE_FILE ?= docker-compose.dev.yml
COMPOSE := docker compose -f $(COMPOSE_FILE)

.PHONY: help setup dev dev-detached down infra-up infra-down build logs ps \
	backend-setup frontend-setup backend-dev worker-dev frontend-dev migrate \
	lint lint-backend lint-frontend format format-backend format-frontend \
	typecheck typecheck-backend typecheck-frontend test test-backend test-frontend ci-local

help: ## Show available commands
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "%-22s %s\n", $$1, $$2}'

setup: backend-setup frontend-setup ## Install backend/frontend dependencies locally

backend-setup: ## Install backend dependencies with uv
	cd backend && uv sync

frontend-setup: ## Install frontend dependencies with pnpm
	cd frontend && pnpm install

infra-up: ## Start only infrastructure services (postgres, redis, pgadmin)
	$(COMPOSE) up -d postgres redis pgadmin

infra-down: ## Stop only infrastructure services
	$(COMPOSE) stop postgres redis pgadmin

dev: ## Run full stack in foreground via Docker Compose
	$(COMPOSE) up --build

dev-detached: ## Run full stack in background via Docker Compose
	$(COMPOSE) up --build -d

down: ## Stop and remove compose stack
	$(COMPOSE) down

build: ## Build Docker images for API, worker, and frontend
	$(COMPOSE) build api worker frontend

logs: ## Tail logs for all services
	$(COMPOSE) logs -f --tail=200

ps: ## Show compose service status
	$(COMPOSE) ps

backend-dev: ## Run backend API locally (requires infra-up)
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

worker-dev: ## Run celery worker locally (requires infra-up)
	cd backend && uv run celery -A app.core.celery_app worker --loglevel=info

frontend-dev: ## Run frontend locally
	cd frontend && pnpm dev --host 0.0.0.0 --port 5173

migrate: ## Run alembic migrations locally
	cd backend && uv run alembic upgrade head

lint: lint-backend lint-frontend ## Run lint checks for backend + frontend

lint-backend: ## Run backend linting
	cd backend && uv run ruff check .

lint-frontend: ## Run frontend linting
	cd frontend && pnpm lint

format: format-backend format-frontend ## Format backend + frontend

format-backend: ## Format backend code
	cd backend && uv run ruff format .

format-frontend: ## Format frontend code
	cd frontend && pnpm format

typecheck: typecheck-backend typecheck-frontend ## Run type checks for backend + frontend

typecheck-backend: ## Run backend mypy
	cd backend && uv run mypy app/

typecheck-frontend: ## Run frontend TypeScript check/build
	cd frontend && pnpm build

test: test-backend test-frontend ## Run backend tests and frontend build verification

test-backend: ## Run backend tests
	cd backend && uv run pytest

test-frontend: ## Run frontend production build
	cd frontend && pnpm build

ci-local: lint typecheck test ## Run local CI-equivalent checks
