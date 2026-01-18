# SagePoint Architecture Guidelines

This document outlines the architectural principles and patterns used in the SagePoint monorepo.

## 1. General Principles

- **Monorepo Structure**: We use `pnpm` workspaces.
- **Strict Boundaries**: Packages should not import from other packages unless explicitly defined in `package.json`.
- **Type Safety**: strict TypeScript configuration must be enabled.

## 2. Backend Architecture (`apps/api`)

We follow **Clean Architecture** (Hexagonal Architecture) principles.

### Key Layers
1.  **Domain (`packages/domain`)**:
    - Pure TypeScript. No dependencies on frameworks (NestJS, Prisma, etc.).
    - Contains `Entities`, `Ports` (Interfaces for Repositories/Services), and `Value Objects`.
    - **Rule**: Changes here trickle down; this is the core truth.

2.  **Application (`src/features/*/app`)**:
    - Contains `UseCases` (e.g., `CreateUserUseCase`).
    - orchestrates Domain logic.
    - **Rule**: Injects generic interfaces (Ports), not specific implementations.

3.  **Infrastructure (`src/features/*/infra`)**:
    - **Driven Adapters**: Implementations of Ports (e.g., `PrismaUserRepository`).
    - **Driver Adapters**: Entry points (e.g., `UserController`, `Resolvers`).
    - **Rule**: This is the only layer that knows about Frameworks/Libraries (NestJS, Prisma, etc.).

### Dependency Injection
- Use `dependencies.ts` factories or standard NestJS modules to wire Ports to Adapters.
- Always inject strict interfaces tokens (Symbol or String), never the concrete class.

## 3. Frontend Architecture (`apps/web`)

We use **Screaming Architecture** organized by Features.

### Directory Structure
```
src/
  app/          # Next.js App Router (Routing layer only)
  common/       # Shared utilities, generic UI components, hooks
  features/     # Business logic grouped by domain
    auth/
    roadmap/
    onboarding/
```

### Feature Structure
Each feature folder (e.g., `src/features/auth`) should contain:
- `api/`: RTK Query endpoints (`authApi.ts`).
- `components/`: Feature-specific UI components (`LoginForm.tsx`).
- `slices/`: Redux slices (`authSlice.ts`).
- `hooks/`: Feature-specific hooks.

### State Management (Redux)
- **RTK Query**: Use for ALL async data fetching. Do not use `useEffect` + `fetch` manually.
- **Slices**: Use for global UI state (auth token, sidebar open/close).
- **Base API**: All features inject endpoints into `src/common/api/baseApi.ts`.

### UI Component Library
- **Material UI (MUI) v6**: Primary Design System.
- **Styling**: `sx` prop or `styled()` components. Avoid global CSS or Tailwind utils.
- **Theme**: Defined in `src/app/providers.tsx` (or `src/common/theme`).

## 4. Workflows & Rules
- **Entities vs DTOs**: 
    - Frontend: API responses are DTOs. Map them if necessary, but keep it simple.
    - Backend: Controllers receive DTOs, convert to Domain Entities, pass to UseCase.
- **Linting**: No `any`. Fix warnings before committing.
