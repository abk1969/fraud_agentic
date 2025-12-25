.PHONY: help install dev build start stop logs clean test

# Default target
help:
	@echo "FraudShield AI - Makefile Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install      - Install all dependencies"
	@echo "  make dev          - Start development servers"
	@echo "  make dev-backend  - Start backend only (with hot-reload)"
	@echo "  make dev-frontend - Start frontend only (with hot-reload)"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build - Build Docker images"
	@echo "  make docker-up    - Start all containers"
	@echo "  make docker-down  - Stop all containers"
	@echo "  make docker-dev   - Start development containers"
	@echo "  make docker-logs  - View container logs"
	@echo ""
	@echo "Testing:"
	@echo "  make test         - Run all tests"
	@echo "  make test-backend - Run backend tests"
	@echo "  make lint         - Run linters"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make format       - Format code"

# Installation
install:
	pip install -r requirements.txt
	pip install -r backend/requirements.txt
	cd frontend && npm install

# Development
dev:
	@echo "Starting development servers..."
	@make dev-backend &
	@make dev-frontend

dev-backend:
	cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm run dev

# Docker commands
docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-dev:
	docker-compose -f docker-compose.dev.yml up

docker-logs:
	docker-compose logs -f

# Testing
test:
	pytest tests/ -v

test-backend:
	pytest backend/tests/ -v

lint:
	ruff check fraudshield/ backend/
	cd frontend && npm run lint

# Code formatting
format:
	ruff format fraudshield/ backend/
	cd frontend && npm run format

# Cleanup
clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	find . -type d -name .ruff_cache -exec rm -rf {} +
	rm -rf frontend/.next
	rm -rf frontend/node_modules/.cache
