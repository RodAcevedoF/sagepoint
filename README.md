<div align="center">

# Sagepoint

**AI-powered learning roadmap generation from your own documents.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-5-4581C3?logo=neo4j&logoColor=white)](https://neo4j.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Overview

Sagepoint is a full-stack platform that turns static documents — PDFs, DOCX, XLSX — into interactive, AI-generated learning roadmaps backed by a knowledge graph. Upload a document, and the system extracts its concepts, structures them into a graph of topics and subtopics, discovers up-to-date resources, and lets you track your progress step by step.

Built as a university thesis project (TFG), it serves as a practical demonstration of **Clean Architecture**, **Domain-Driven Design**, **Vertical Slice**, and **Screaming Architecture** applied in a modern TypeScript monorepo.

---

## Key Features

| Feature                       | Description                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| **Document ingestion**        | Upload PDF, DOCX or XLSX; the worker parses, normalises and analyses them asynchronously |
| **AI roadmap generation**     | LLM (GPT-4o) generates a structured concept graph stored in Neo4j                        |
| **Knowledge graph explorer**  | Interactive visualisation of the roadmap as a graph of nodes and edges                   |
| **Step-level quizzes**        | Auto-generated quizzes per roadmap step, with attempt tracking                           |
| **Document quizzes**          | Quiz generation directly from uploaded documents                                         |
| **Resource discovery**        | Perplexity/OpenAI-powered resource discovery refreshed on a schedule                     |
| **Concept expansion**         | Drill deeper into any concept with one click                                             |
| **Insights dashboard**        | AI-curated news feed and resource suggestions per topic                                  |
| **Progress tracking**         | Per-step completion state persisted and visualised                                       |
| **Public / private roadmaps** | Share roadmaps publicly or keep them private                                             |
| **Google OAuth + JWT auth**   | Email/password and Google login, JWT refresh-token rotation                              |
| **Role-based admin panel**    | Manage users, categories and content                                                     |

---

## Architecture

Sagepoint is organised as a **pnpm monorepo** with strict package boundaries. Three runnable apps consume a set of shared packages.

```
sagepoint/
├── apps/
│   ├── api/        # REST API — NestJS 11 (Clean / Hexagonal Architecture)
│   ├── web/        # SPA / SSR — Next.js 16, MUI v7, Redux Toolkit
│   └── worker/     # Async processor — NestJS + BullMQ
└── packages/
    ├── domain/     # Pure-TS entities, ports, value objects (zero runtime deps)
    ├── ai/         # LLM adapters — LangChain + OpenAI / Perplexity
    ├── storage/    # File storage — Google Cloud Storage adapter
    ├── parsing/    # Document normalisation — PDF, DOCX, XLSX
    ├── database/   # Prisma schema + generated client (PostgreSQL + pgvector)
    └── graph/      # Neo4j driver + graph query logic
```

### Backend layers (`apps/api`)

```
Domain  ──▶  Application  ──▶  Infrastructure
 (ports)      (use cases)       (adapters, controllers, Prisma repos)
```

- **Domain** lives in `packages/domain` — no framework dependencies.
- **Application** (`src/features/*/app`) orchestrates use cases against injected ports.
- **Infrastructure** (`src/features/*/infra`) contains driven adapters (repositories, queues) and driver adapters (controllers).
- Dependency Injection always targets interface tokens — never concrete classes.

### Frontend layers (`apps/web`)

```
app/            # Next.js App Router — routing only
features/       # Business logic grouped by domain (auth, roadmap, document, …)
infrastructure/ # RTK Query slices, axios base, Redux store
application/    # Application-layer hooks consumed by features
common/         # Shared UI primitives, hooks, theme
```

### Async pipeline

```
HTTP upload ──▶ API enqueues job ──▶ BullMQ (Redis)
                                         │
                          ┌──────────────┴──────────────┐
                          ▼                             ▼
               document-processor              roadmap-processor
          (parse → AI analysis → DB)    (LLM → concept graph → Neo4j)
```

---

## Tech Stack

| Layer             | Technology                                                                        |
| ----------------- | --------------------------------------------------------------------------------- |
| **API**           | NestJS 11, Passport (JWT + Google OAuth), class-validator, Pino, BullMQ           |
| **Frontend**      | Next.js 16, React 19, MUI v7, Redux Toolkit v2, Framer Motion, Three.js, Recharts |
| **Worker**        | NestJS 11, BullMQ 5, @nestjs/schedule                                             |
| **AI / LLM**      | LangChain v1, OpenAI GPT-4o, Perplexity                                           |
| **Databases**     | PostgreSQL 17 + pgvector, Neo4j 5 (APOC), Redis 8                                 |
| **ORM / Graph**   | Prisma 7, neo4j-driver 6                                                          |
| **File storage**  | Google Cloud Storage                                                              |
| **Observability** | Sentry (frontend), Pino structured logging (API + worker)                         |
| **Tooling**       | pnpm workspaces, TypeScript 5, ESLint, Husky, tsx                                 |

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 10 — `npm install -g pnpm`
- **Docker** + **Docker Compose** (for Postgres, Redis, Neo4j)
- A `.env` file in each app (see `.env.example` if provided)

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/RodAcevedoF/sagepoint.git
cd sagepoint
pnpm install
```

### 2. Start infrastructure services

```bash
docker compose up -d
# Starts: PostgreSQL :5440, Redis :6379, Neo4j :7474/:7687
```

### 3. Apply database schema & seed

```bash
pnpm db:push          # Push Prisma schema to Postgres
pnpm sagepoint:init   # Seed default categories + create admin user
```

### 4. Run all apps in development mode

```bash
pnpm dev
# Kills zombie dev ports, starts services, then launches api + web + worker in parallel
```

Individual apps:

```bash
pnpm --filter @sagepoint/api    start:dev   # API    → http://localhost:3001
pnpm --filter @sagepoint/web    dev         # Web    → http://localhost:3000
pnpm --filter @sagepoint/worker start:dev   # Worker (BullMQ consumer)
```

> **Note:** After editing `packages/domain` or `packages/ai`, run `pnpm build` inside the package so that `dist/` is up to date.

---

## Scripts

| Command                 | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `pnpm dev`              | Start all apps + services in development mode   |
| `pnpm build`            | Build all packages and apps                     |
| `pnpm check`            | Run `typecheck` + `lint` across the entire repo |
| `pnpm typecheck`        | `tsc --noEmit` across all packages              |
| `pnpm lint`             | ESLint across all packages                      |
| `pnpm test`             | Unit tests across all packages                  |
| `pnpm test:e2e`         | End-to-end tests (API)                          |
| `pnpm test:integration` | Integration tests against real Postgres         |
| `pnpm db:push`          | Push Prisma schema                              |
| `pnpm sagepoint:init`   | Seed categories + create admin user             |
| `pnpm services:up`      | `docker compose up -d`                          |
| `pnpm services:down`    | `docker compose down --remove-orphans`          |

---

## Project Structure (detailed)

<details>
<summary><strong>apps/api/src/features/</strong></summary>

| Feature    | Key use cases                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| `auth`     | login, register, logout, refresh-token, Google OAuth, verify-email                                     |
| `document` | upload, list, delete, summary, quiz, quiz-attempts, submit-quiz                                        |
| `roadmap`  | generate, list (user / public), get-graph, step-progress, expand-concept, relate, step-quiz, resources |
| `insights` | get-insights (news + resources per topic)                                                              |
| `user`     | profile, onboarding                                                                                    |
| `category` | CRUD                                                                                                   |
| `admin`    | platform administration                                                                                |

</details>

<details>
<summary><strong>packages/domain/src/ports/</strong></summary>

Ports (interfaces) injected throughout the application layer:

`IRoadmapGenerationPort`, `IDocumentAnalysisPort`, `IContentAnalysisPort`, `IConceptExpansionPort`, `IQuizGenerationPort`, `IResourceDiscoveryPort`, `INewsPort`, `IImageTextExtractionPort`, `ICachePort`, `IFileStoragePort`

</details>

---

## Testing

```bash
# Unit tests (all packages)
pnpm test

# API unit tests only
pnpm --filter @sagepoint/api test

# Integration tests (requires Postgres running)
pnpm test:integration

# E2E tests
pnpm test:e2e
```

Tests follow a **ports & adapters** approach: use-cases are tested against in-memory fakes, not `jest.fn()` mocks. Integration tests run against a real `sagepoint_test` database with `TRUNCATE CASCADE` between each test.

---

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — Architectural guidelines and layer contracts
- [d-docs/](t-docs/) — Development session notes and decisions

---

## License

This project is licensed under the **MIT License**.
