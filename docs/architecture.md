# Sagepoint (Final Degree Project — TFG)

## 1. Overview

**Sagepoint** is a full‑stack platform focused on the automatic generation of learning roadmaps from documents (PDF, DOCX, XLSX), using asynchronous processing, large language models, and knowledge graphs (Neo4j).

The goal of the Final Degree Project is to demonstrate the design and implementation of a modern, scalable, and maintainable architecture, applying principles of **Clean Architecture**, **DDD**, **Vertical Slice**, and **Screaming Architecture**.

---

## 2. Monorepo Architecture

### 2.1 General structure

```
sagepoint/
 ├─ apps/
 │   ├─ api/        # Backend (NestJS)
 │   ├─ web/        # Frontend (Next.js)
 │   └─ worker/     # Asynchronous processing
 ├─ packages/
 │   ├─ domain/     # Shared domain core
 │   ├─ parsing/    # Document normalization
 │   ├─ llm/        # Language model abstraction
 │   └─ graph/      # Neo4j access and logic
 └─ tooling/
```

---

## 3. Backend (NestJS)

### 3.1 Architectural approach

- **Clean Architecture**
- **Tactical DDD**
- **Vertical Slice**
- **Screaming Architecture** (the structure screams the domain)

### 3.2 Structure by feature

```
features/
 └─ roadmap/
    ├─ domain/
    │   ├─ concept.entity.ts
    │   ├─ roadmap.aggregate.ts
    │   └─ repository.ts
    ├─ app/
    │   ├─ generate-roadmap.usecase.ts
    │   └─ dto/
    ├─ infra/
    │   ├─ driven/        # Output adapters (Repositories, etc.)
    │   │   └─ neo4j.repository.ts
    │   └─ driver/        # Input adapters (Service Impl, Controllers)
    │       ├─ http/
    │       │   └─ roadmap.controller.ts
    │       └─ roadmap.service.ts
    └─ dependencies.ts
```

### 3.3 Key principles

- The **domain does not depend** on NestJS
- `dependencies.ts` resolves wiring
- Each feature is autonomous
- **Shared Infrastructure**: Common ports (like `IFileStorage`) are defined in `core` and injected into features, allowing generic handling of resources (Files, Events) without duplicating logic.

---

## 4. Frontend (Next.js)

### 4.1 Approach

- Clean Architecture **at the use-case level**
- Less strict than the backend

### 4.2 Structure

```
features/
 └─ roadmap/
    ├─ application/
    │   └─ useGenerateRoadmap.ts
    ├─ ui/
    │   ├─ RoadmapGraph.tsx
    │   └─ RoadmapSteps.tsx
    └─ infra/
       └─ roadmap.api.ts
```

### 4.3 Responsibilities

- UI decoupled from the API
- Use cases consumed from hooks

---

## 5. Workers and Data Pipelines

### 5.1 The Worker's role

- Heavy and asynchronous processing
- Isolation from the API

### 5.2 Pipeline

1. Receive document
2. Parsing by type (PDF/DOCX/XLSX)
3. Normalization to a common structure
4. Semantic chunking
5. LLM: extraction of concepts and relationships
6. Persistence in Neo4j

> Cloud Functions are not mandatory; the worker covers the use case for the TFG.

---

## 6. Neo4j — Knowledge Graph

### 6.1 Nodes

- `Document`
- `Concept`
- `Topic`

### 6.2 Relationships

- `(Document)-[:CONTAINS]->(Concept)`
- `(Concept)-[:DEPENDS_ON]->(Concept)`
- `(Concept)-[:BELONGS_TO]->(Topic)`
- `(Concept)-[:NEXT_STEP]->(Concept)`

### 6.3 Rationale

- Natural representation of knowledge
- Roadmaps generated through graph traversals

---

## 7. Application Features

### Core

- Upload documents (PDF, DOCX, XLSX)
- Asynchronous processing
- Automatic extraction of concepts
- Construction of the knowledge graph

### Roadmap Builder

- Generation of learning itineraries
- Dependencies between concepts
- Roadmap visualization

### Interaction

- Concept navigation
- Asking questions about the content


---

## 8. Authentication & Security

### 8.1 Strategy: Hybrid (JWT + Redis) & Multi-Provider
We use a **Hybrid Approach** to balance performance and security, supporting both **Google OAuth** and **Local (Email/Password)** authentication.
-   **Access Token (JWT)**: Short-lived (e.g., 15m). Stateless verification by API.
-   **Refresh Token**: Long-lived (e.g., 7d). Stored in **Redis** (`refresh:{userId}`). Stateful revocation.
-   **Password Security**: Bcrypt hashing for local accounts.

### 8.2 Flow
1.  **Registration (Local)**:
    - User signs up with Email/Password.
    - Account created with `isVerified: false`, `passwordHash` stored.
    - Setup `verificationToken` (UUID) and send email via `IEmailService`.
2.  **Verification**:
    - User clicks link (`/auth/verify?token=...`).
    - API validates token, marks user as `isVerified: true`.
3.  **Login (Local)**:
    - User sends Email/Password.
    - API validates credentials (`bcrypt.compare`) AND `isVerified` status.
    - Returns Access + Refresh tokens.
4.  **Login (Google)**:
    - OAuth flow. Account auto-created if new and marked `isVerified: true`.
    - Returns Access + Refresh tokens.
5.  **Access**: Client sends Access Token. API verifies signature.
6.  **Refresh**: Client sends Refresh Token. API checks Redis. If valid, issues new Access Token.
7.  **Logout**: API deletes key from Redis. Both tokens become useless.

### 8.3 Decorators & Guards
-   `@CurrentUser()`: Injects the authenticated user entity into the controller method.
-   `LocalAuthGuard`: Uses Passport Local Strategy for login.
-   `JwtAuthGuard`: Protects private routes.
-   `GoogleAuthGuard`: Handles OAuth redirects.

### 8.4 Module Structure (Refactored)
To maintain consistency with the Hexagonal Architecture, the Auth module is structured as follows:
```
features/auth/
 ├── domain/
 │    ├── inbound/        # Input Ports (UseCase interfaces? No, Auth often uses Service facade)
 │    └── outbound/       # Output Ports
 │         └── email.service.port.ts  # IEmailService
 ├── app/
 │    └── usecases/       # (Optional) Specific Use Cases if logic grows
 ├── infra/
 │    ├── driver/         # Driving Adapters (Input)
 │    │    ├── http/
 │    │    │    ├── auth.controller.ts
 │    │    │    └── dto/
 │    │    └── auth.service.ts  # Implements Inbound Logic (Facade)
 │    ├── driven/         # Driven Adapters (Output)
 │    │    └── nodemailer-email.service.ts
 │    ├── strategies/     # Passport Strategies (Local, JWT, Google)
 │    ├── guards/         # NestJS Guards
 │    └── decorators/     # Custom Decorators
 └── dependencies.ts      # DI Wiring
```

### 8.5 Decision Log
- **Why UUID for Verification?**: Simple, random, and low collision probability. Stateless verification (lookup in DB/Redis).
- **Why Nodemailer?**: Standard Node.js library, easy to mock for dev (`Ethereal Email`), supports implementing the `IEmailService` port easily.
- **Why Bcrypt?**: Industry standard for password hashing.
-   **Why Redis?**: To manage Refresh Token lifecycle (Revocation) which JWT cannot do natively without state.

---

## 9. Controlled Scope (Design Decisions)

### Included

- A single main domain (roadmaps)
- One LLM model
- One graph type

### Excluded (for now)

- External integrations (YouTube, Semantic Scholar, etc.)
- Complex multi‑tenant support
- Advanced recommendation systems

---

