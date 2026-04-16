import type { LucideIcon } from "lucide-react";
import {
  FileUp,
  Map,
  Compass,
  LayoutDashboard,
  ShieldCheck,
  BookOpen,
  Sparkles,
  GitBranch,
  Coins,
  KeyRound,
} from "lucide-react";

// ── Block types ────────────────────────────────────────────────────────────

type ProseBlock = { type: "prose"; text: string };
type ListBlock = { type: "list"; items: string[] };
type StepsBlock = {
  type: "steps";
  steps: { label: string; detail: string }[];
};
type CalloutBlock = {
  type: "callout";
  variant: "tip" | "info";
  text: string;
};

export type DocBlock = ProseBlock | ListBlock | StepsBlock | CalloutBlock;

export type DocSectionConfig = {
  id: string;
  label: string;
  icon: LucideIcon;
  title: string;
  showDivider?: boolean;
  blocks: DocBlock[];
};

// ── Section data ───────────────────────────────────────────────────────────

export const DOCS_SECTIONS: DocSectionConfig[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Sparkles,
    title: "Overview",
    blocks: [
      {
        type: "prose",
        text: "Sagepoint is a platform that transforms study materials into personalized learning roadmaps. Upload a document — PDF, DOCX, or XLSX — and the AI extracts concepts, maps their relationships, and generates a structured path from fundamentals to mastery.",
      },
      {
        type: "steps",
        steps: [
          {
            label: "Upload a document",
            detail:
              "Drag and drop or select a file. Supported formats: PDF, DOCX, XLSX, and images (PNG, JPG).",
          },
          {
            label: "AI processes your content",
            detail:
              "The system parses, analyzes, and summarizes your document, extracting key concepts and their relationships.",
          },
          {
            label: "Get your roadmap",
            detail:
              "A personalized learning path is generated with ordered steps, curated resources, and quizzes.",
          },
          {
            label: "Learn and track progress",
            detail:
              "Work through each step, take concept quizzes, and watch your progress grow on the dashboard.",
          },
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "You can also explore public roadmaps created by other users without uploading anything — head to the Explore page to browse the community library.",
      },
    ],
  },

  {
    id: "documents",
    label: "Documents",
    icon: FileUp,
    title: "Documents",
    blocks: [
      {
        type: "prose",
        text: "Every uploaded document goes through a multi-stage processing pipeline. You can track its progress in real time from the documents page.",
      },
      {
        type: "list",
        items: [
          "Supported formats: PDF, DOCX, XLSX, and images (PNG, JPG). Image files go through OCR via a vision model before analysis.",
          "Processing stages: Uploaded → Parsing → Analyzing → Ready.",
          "AI-generated summaries include key points, topic area, difficulty level, and estimated reading time.",
          "Auto-generated quizzes test your understanding — multiple choice and true/false with per-option explanations.",
          "Quiz attempts are saved — you can review your answers and explanations after completing.",
          "A concept map visualizes extracted topics as a graph: nodes are concepts, edges show hierarchical and cross-document relationships powered by Neo4j.",
        ],
      },
      {
        type: "prose",
        text: "Once processing completes, you can generate a roadmap directly from the document detail page, or create one separately from the roadmap creation form.",
      },
    ],
  },

  {
    id: "roadmaps",
    label: "Roadmaps",
    icon: Map,
    title: "Roadmaps",
    blocks: [
      {
        type: "prose",
        text: "Roadmaps are the core of Sagepoint. Each one is an ordered sequence of concepts with learning objectives, difficulty levels, time estimates, and curated external resources.",
      },
      {
        type: "list",
        items: [
          "Two creation modes: topic-based (enter any subject directly) or document-based (generate from an uploaded file with an experience level and optional goal).",
          "Generation is asynchronous — a skeleton roadmap appears immediately (~100ms) and stages fill in via real-time updates: concepts → path → resources → done.",
          "Each step has a learning objective, estimated duration, and difficulty (beginner → expert).",
          "Resources are curated per concept — articles, videos, courses, tutorials, and books — sourced via Perplexity and cached for 7 days.",
          "Step quizzes are AI-generated gates: 3 questions, ≥2/3 correct required to auto-complete the step.",
          "Track progress step by step. Mark concepts as completed or skipped.",
          "Toggle visibility to share your roadmap publicly with the community.",
          "Adopt public roadmaps into your own library to track progress independently.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "When creating a roadmap, the system searches for existing public roadmaps on similar topics. You can adopt one instead of generating from scratch.",
      },
    ],
  },

  {
    id: "explore",
    label: "Explore & Community",
    icon: Compass,
    title: "Explore & Community",
    blocks: [
      {
        type: "prose",
        text: "The Explore page is where you discover learning content created by other users. Browse, search, filter by category, and build on the collective knowledge of the community.",
      },
      {
        type: "list",
        items: [
          "Browse all public roadmaps with full-text search and category filters.",
          "Like roadmaps to bookmark them for later.",
          "Adopt a roadmap to add it to your library with independent progress tracking.",
          "Category rooms group related roadmaps by subject area — each room shows member count and top roadmaps.",
          "Featured roadmaps are curated by administrators for quality and relevance.",
        ],
      },
    ],
  },

  {
    id: "dashboard",
    label: "Dashboard & Profile",
    icon: LayoutDashboard,
    title: "Dashboard & Profile",
    blocks: [
      {
        type: "prose",
        text: "Your dashboard is the personal learning hub — it shows your active roadmaps, recent documents, progress statistics, and a news feed tailored to your interests.",
      },
      {
        type: "list",
        items: [
          "Active roadmaps with completion percentage and quick-resume links.",
          "Recent documents with processing status.",
          "Learning insights — news articles matched to your selected interests, refreshed daily via a BullMQ cron job powered by Perplexity.",
          "Token balance widget showing remaining and total granted credits.",
          "Profile page for managing your name, avatar, interests, and learning preferences.",
          "Set a weekly hours goal and preferred learning schedule.",
        ],
      },
      {
        type: "prose",
        text: "New users go through an onboarding flow that configures learning goals, interests, experience level, and schedule preferences. These can be changed at any time from the profile page.",
      },
    ],
  },

  {
    id: "ai",
    label: "AI Pipeline",
    icon: BookOpen,
    title: "AI Pipeline",
    blocks: [
      {
        type: "prose",
        text: "Sagepoint uses a combination of large language models and a concept graph to process documents and generate roadmaps. The pipeline is designed for quality and cost efficiency.",
      },
      {
        type: "list",
        items: [
          "Document summaries and quizzes use GPT-4o-mini for fast, cost-effective generation.",
          "Roadmap generation uses GPT-4o for deeper concept analysis and step ordering.",
          "All AI adapters are built with LangChain using withStructuredOutput() + Zod schemas for reliable, typed responses.",
          "Resource discovery leverages the Perplexity API with Redis caching (7-day TTL) — parallel requests per concept.",
          "Concepts are extracted and persisted to a Neo4j graph. HAS_SUBCONCEPT edges model hierarchy; SAME_AS edges cross-link equivalent concepts across different documents.",
          "Existing graph context is fed back to the LLM during generation for ontology-enriched, non-redundant roadmaps.",
          "Processing runs asynchronously via BullMQ workers — the main API returns immediately with a skeleton while the worker fills in content.",
          "Real-time stage updates are streamed to the client via SSE (Server-Sent Events): concepts → path → resources → done.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "The document pipeline runs summary and quiz as independent BullMQ jobs — the summary arrives faster while the quiz continues processing in the background.",
      },
    ],
  },

  {
    id: "tokens",
    label: "Token System",
    icon: Coins,
    title: "Token System",
    blocks: [
      {
        type: "prose",
        text: "Sagepoint uses a token balance to govern AI operations. Every account starts with a granted balance; each action deducts a fixed cost. Tokens are non-refundable and do not reset — they represent lifetime usage capacity.",
      },
      {
        type: "list",
        items: [
          "Upload a document: 10 tokens.",
          "Generate a roadmap from a document: 15 tokens.",
          "Generate a topic-based roadmap: 20 tokens.",
          "Token balance is visible in the quota widget on the dashboard and document/roadmap creation flows.",
          "When your balance reaches zero, a modal explains the situation and provides a contact-admin CTA.",
          "Administrators can grant additional tokens to any user directly from the user management panel.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "Tokens are deducted on successful operation start, not on completion. If a generation job fails after deduction, an admin can manually restore the balance.",
      },
    ],
  },

  {
    id: "admin",
    label: "Administration",
    icon: ShieldCheck,
    title: "Administration",
    blocks: [
      {
        type: "prose",
        text: "Administrators have access to a dedicated panel for managing users, content, and platform health. The admin panel is only visible to users with the admin role.",
      },
      {
        type: "list",
        items: [
          "User management — activate, deactivate, change roles, and grant token credits directly from the user panel.",
          "Document and roadmap moderation — review, delete, toggle featured status.",
          "Analytics dashboard with Recharts time-series charts for user growth, uploads, and generation volume.",
          "Queue monitor (bull-board) — real-time view of BullMQ job queues: active, waiting, delayed, failed, and completed jobs.",
          "Invitation system — generate email invitation links or create users directly with assigned passwords.",
          "Invited users bypass email verification and the admin-only registration guard automatically.",
          "Platform health endpoint — live status of PostgreSQL, Redis, and Neo4j connections at GET /health.",
        ],
      },
    ],
  },

  {
    id: "auth",
    label: "Authentication",
    icon: KeyRound,
    title: "Authentication",
    blocks: [
      {
        type: "prose",
        text: "Sagepoint uses a dual-token session system with HttpOnly cookies — no tokens are ever exposed to JavaScript.",
      },
      {
        type: "list",
        items: [
          "Access token (15-minute TTL) and refresh token (7-day TTL) stored as HttpOnly cookies.",
          "The frontend automatically retries failed requests on 401 and refreshes the session transparently via baseQueryWithReauth.",
          "Registration requires email verification before access is granted.",
          "Invited users (created via admin invitation links) bypass email verification and are pre-approved on first login.",
          "Google OAuth is supported in local development. Production requires admin approval to enable for all users.",
          "A RESTRICT_AUTH_TO_ADMIN environment flag limits registration to invited users only — used during closed beta.",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Cross-subdomain sessions (e.g. staging vs. production) require matching domain and path attributes on both the set and delete cookie operations.",
      },
    ],
  },

  {
    id: "architecture",
    label: "Architecture",
    icon: GitBranch,
    title: "Architecture",
    showDivider: false,
    blocks: [
      {
        type: "prose",
        text: "Sagepoint is built as a TypeScript monorepo following Clean Architecture, Domain-Driven Design, and the Ports & Adapters pattern. The domain layer is pure and framework-agnostic.",
      },
      {
        type: "list",
        items: [
          "TypeScript monorepo (pnpm workspaces) following Clean Architecture and Ports & Adapters. The domain layer is pure TS with no framework dependencies.",
          "Backend: NestJS REST API organized by vertical feature slices (domain → application → infrastructure).",
          "Frontend: Next.js with MUI v7, Redux Toolkit, RTK Query, Server Actions, and Framer Motion animations.",
          "Worker: two BullMQ processors — document-processing and roadmap-generation — each with their own PrismaClient and AI module.",
          "Shared packages: domain (entities + ports), database (Prisma), ai (LangChain adapters), graph (Neo4j), storage (GCS), parsing.",
          "Infrastructure: PostgreSQL (primary store), Redis (cache + queues), Neo4j (concept graph), Google Cloud Storage (file uploads).",
          "Deployment: VPS runs API (port 3001) + staging (3002) + workers via docker compose. Frontend on Vercel at sagepoint.online (prod) and staging.sagepoint.online.",
          "CI/CD: ci.yml runs lint + typecheck + 328+ tests on every PR. deploy.yml pushes to staging or production on merge, runs migrations automatically.",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Sagepoint is a university thesis project (TFG) built to demonstrate production-grade architecture in a full-stack AI application.",
      },
    ],
  },
];
