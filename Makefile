PYTHON ?= python3
DOCKER_COMPOSE ?= docker-compose

.PHONY: dev up down lint test format migrate seed-admin backend-shell

dev: ## start full stack in dev mode
	$(DOCKER_COMPOSE) up --build

up: ## start containers without rebuild
	$(DOCKER_COMPOSE) up

down: ## stop containers
	$(DOCKER_COMPOSE) down

lint: ## run linters for backend and frontend
	cd backend && $(PYTHON) -m pip install -q -r requirements-dev.txt && $(PYTHON) -m ruff check .
	cd frontend && npm install && npm run lint

test: ## run backend and cv tests
	cd backend && $(PYTHON) -m pytest
	cd cv && $(PYTHON) -m pytest

format: ## apply formatters
	cd backend && $(PYTHON) -m ruff format .
	cd frontend && npm run format

migrate: ## apply alembic migrations
	cd backend && alembic upgrade head

seed-admin: ## seed default admin user
	cd backend && $(PYTHON) -m app.scripts.seed_admin

backend-shell: ## open a shell inside backend container
	$(DOCKER_COMPOSE) exec backend /bin/sh

.PHONY: help
help: ## show help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "%-20s %s\n", $$1, $$2}'
