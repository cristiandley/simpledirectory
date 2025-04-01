.PHONY: all dev-client dev-platform build-client build-platform test test-client test-platform lint lint-client lint-platform clean help

all: build

dev-client:
	cd client && npm run dev

dev-platform:
	cd platform && npm run start:dev

dev: dev-platform dev-client

build-client:
	cd client && npm run build

build-platform:
	cd platform && npm run build

build: build-client build-platform

test-client:
	cd client && npm test

test-platform:
	cd platform && npm test

test-platform-e2e:
	cd platform && npm run test:e2e

test: test-client test-platform

lint-client:
	cd client && npm run lint

lint-platform:
	cd platform && npm run lint

lint: lint-client lint-platform

clean-client:
	cd client && rm -rf .next out node_modules

clean-platform:
	cd platform && rm -rf dist node_modules

clean: clean-client clean-platform

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

help:
	@echo "URL Shortener Makefile"
	@echo "----------------------"
	@echo "Available targets:"
	@echo "  all             : Default target - builds both applications"
	@echo "  dev             : Run both applications in development mode"
	@echo "  dev-client      : Run only Next.js client in development mode"
	@echo "  dev-platform    : Run only NestJS platform in development mode"
	@echo "  build           : Build both applications"
	@echo "  build-client    : Build only the Next.js client"
	@echo "  build-platform  : Build only the NestJS platform"
	@echo "  test            : Run tests for both applications"
	@echo "  test-client     : Run tests for Next.js client"
	@echo "  test-platform   : Run tests for NestJS platform"
	@echo "  test-platform-e2e : Run e2e tests for NestJS platform"
	@echo "  lint            : Run linting for both applications"
	@echo "  lint-client     : Run linting for Next.js client"
	@echo "  lint-platform   : Run linting for NestJS platform"
	@echo "  clean           : Clean build artifacts for both applications"
	@echo "  docker-up       : Start Docker containers using docker-compose"
	@echo "  docker-down     : Stop Docker containers"
	@echo "  docker-build    : Build Docker images"
	@echo "  help            : Display this help information"