# CLAUDE.md

DON'T WASTE TOKENS IN UNNECESSARY/EXPENSIVE TOKENS

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sagepoint is a full-stack platform for automatic generation of learning roadmaps from documents (PDF, DOCX, XLSX) using LLMs and knowledge graphs (Neo4j). This is a university thesis project (TFG) demonstrating Clean Architecture, DDD, Vertical Slice, and Screaming Architecture principles.

## Monorepo Structure

```
sagepoint/
├── apps/
│   ├── api/        # Backend (NestJS)
│   ├── web/        # Frontend (Next.js 15, MUI, Redux)
│   └── worker/     # Async processing (BullMQ)
├── packages/
│   ├── domain/     # Shared domain core (Pure TS) — entities, types, ports
│   ├── parsing/    # Document normalization
│   ├── llm/        # LLM abstraction (LangChain)
│   └── graph/      # Neo4j access and logic
└── tooling/
```

Package manager: **pnpm** (v10.15.1)
_Note: Always use `pnpm` for package management._

## Common Commands

```bash
# Install dependencies
pnpm install

# Run all apps in development mode (API, Web, Worker, DBs)
pnpm dev

# Build all packages & apps
pnpm build

# Lint all packages
pnpm lint

# Database
pnpm db:push          # Push Prisma schema
docker-compose up -d  # Start Postgres, Redis, Neo4j
```

### API-specific commands (from apps/api)

```bash
pnpm start:dev    # Watch mode
pnpm test         # Unit tests
pnpm test:e2e     # E2E tests
```

### Web-specific commands (from apps/web)

```bash
pnpm dev          # Next.js dev server
pnpm build        # Next.js build
```

## Architecture

### Shared Domain (`packages/domain`)

Pure TypeScript — no framework dependencies. Source of truth for entities and shared types.

**Modules:** `user/`, `auth/`, `category/`, `document/`, `roadmap/`

- **Entities**: `User`, `Category`, `Document`, `Roadmap`, `Concept` (immutable, factory methods)
- **Auth types** (shared): `RegisterInput`, `LoginResult`, `TokenPayload`, `RequestUser`
- **Ports**: `IUserRepository`, `ICategoryRepository`, `IDocumentRepository`, etc.
- Service interfaces (`IAuthService`, `ITokenService`, `ITokenStore`, `IPasswordHasher`, `IEmailService`) stay **backend-only** in `apps/api/src/features/auth/domain/`.

### Backend (NestJS) - Hexagonal/Clean Architecture

1.  **Domain Layer** (`packages/domain`): Pure TS entities & interfaces. Source of truth.
2.  **Application Layer** (`src/features/*/app`): Use Cases orchestrating domain logic.
3.  **Infrastructure Layer** (`src/features/*/infra`): Implementations (Prisma, Controllers).

**Key Principles:**

- **Strict Boundaries**: Domain knows nothing of NestJS or Prisma.
- **Dependency Injection**: Standard NestJS DI (`@Injectable`) with Symbol tokens for Ports.
- **Modules**: `User`, `Auth`, `Roadmap`, `Category`.

### Frontend (Next.js) - Clean Architecture + Screaming Architecture

```
apps/web/src/
├── domain/              # Re-exports from @sagepoint/domain
├── application/         # Use Cases as Command/Query hooks
│   ├── auth/
│   │   ├── commands/    # useLoginCommand, useRegisterCommand, useLogoutCommand
│   │   └── queries/     # useProfileQuery
│   └── onboarding/
│       ├── commands/    # useSubmitOnboardingCommand
│       └── queries/     # useCategoriesQuery
├── infrastructure/      # RTK Query APIs + Redux store (implementation details)
│   ├── api/             # baseApi, authApi, onboardingApi, roadmapApi
│   └── store/           # store.ts, slices/authSlice.ts
├── features/            # UI-only (components consume application layer hooks)
│   ├── landing/         # LandingPage
│   ├── auth/            # LoginPage, RegisterPage, AuthInitializer
│   ├── onboarding/      # OnboardingFlow
│   └── dashboard/       # Dashboard
├── common/              # Shared hooks (useAppDispatch, useAppSelector), theme
├── components/          # Shared UI components (graph-visualization)
└── app/                 # Next.js App Router (thin wrappers only)
```

**Key Pattern**: Components never import RTK Query hooks directly. They use Command/Query hooks from `application/` which encapsulate business logic (navigation, state updates, orchestration). This keeps components pure UI.

**Tech Stack:**
- **UI**: Material UI (MUI) v6.
- **State**: Redux Toolkit + RTK Query (wrapped via application layer commands/queries).
- **Forms**: Controlled components.

## Neo4j Graph Model

**Nodes:** `Document`, `Concept`, `Topic`, `Category`
**Relationships:**

- `(Document)-[:CONTAINS]->(Concept)`
- `(Concept)-[:DEPENDS_ON]->(Concept)`
- `(User)-[:INTERESTED_IN]->(Category)`

## Completed (Phase 2)

- [x] Frontend Overhaul: MUI + Redux + Screaming Arch.
- [x] Onboarding: Multi-step wizard for Goal/Interests.
- [x] Graph: Interactive Force-Directed Graph visualization.
- [x] Backend: Clean Architecture enforced for Category and User modules.
- [x] Auth & Infrastructure: Redis + HttpOnly Cookie architecture.
- [x] Auth Module: Migrated to standard NestJS DI.
- [x] Database: Postgres 17, explicit junction tables, comprehensive indexing.
- [x] **Frontend Clean Architecture**: Extracted shared auth types to `packages/domain`. Restructured frontend into `domain/`, `application/`, `infrastructure/`, `features/` layers. Implemented Command/Query pattern for use cases. Created professional landing page. Deleted legacy files.

## Next Steps (Phase 3)

1.  **Consistency Check**: Verify backend API responses match frontend DTOs. Test full Landing → Login → Dashboard and Register → Verify → Login flows end-to-end.
2.  **Polish UI**: Improve landing page, add error toasts, loading states.
3.  **Roadmap Generation**: Integrate Perplexity API + LLM Agent.
4.  **Social Features**: Likes, Follows, Public profiles.
5.  **Admin Dashboard**: User management & stats.

## Coding Standards

1.  **Imports**: Use absolute paths (`@/...`) in frontend. Use `@sagepoint/domain` for shared types.
2.  **Naming**: `IUserRepository` (Interface), `PrismaUserRepository` (Impl), `CreateUserUseCase`. Frontend commands: `useLoginCommand`, queries: `useProfileQuery`.
3.  **State**: Async data → RTK Query (via application hooks). Global UI → Redux Slice. Local UI → `useState`.
4.  **Architecture boundaries**: Components import from `application/`, never directly from `infrastructure/`. The only exception is Dashboard which still directly uses roadmap API (TODO: extract roadmap commands/queries).
