import type { Client } from "pg";
import { randomUUID } from "crypto";

const STATIC_BLOG_POSTS = [
  {
    slug: "how-sagepoint-transforms-documents-into-learning-roadmaps",
    title: "How Sagepoint Transforms Documents into Learning Roadmaps",
    excerpt:
      "From a single PDF upload to a complete, personalized learning path — how Sagepoint uses LLMs and knowledge graphs to build structured roadmaps.",
    categorySlug: "web-development",
    contentMarkdown: `Learning from a textbook has always had the same problem: the knowledge is there, but the path through it isn't. You open a 400-page PDF, and within minutes you're lost in a sea of concepts with no clear order of operations. Sagepoint exists to solve exactly this.

## From Upload to Roadmap

When you upload a document to Sagepoint, the platform doesn't just store it — it reads it. Using GPT-4o-mini with structured output, the document analysis pipeline extracts the key concepts embedded in the text: the entities, ideas, dependencies, and themes that make up the subject matter.

These concepts aren't treated as a flat list. Instead, they're organized into a graph. Each concept becomes a node, and the relationships between them — what depends on what, what leads naturally to what — become edges. This graph lives in Neo4j, where Sagepoint can traverse it to determine the most logical learning sequence.

## Building the Roadmap

Once the concept graph is built, the roadmap generation phase begins. A second LLM call synthesizes the concept graph into a structured sequence of learning steps: ordered, estimated for time, and paced with a recommended weekly cadence.

Each step in the roadmap is associated with its source concept, which means everything stays grounded in your original document. You're not getting generic internet advice about a topic — you're getting a path through your specific material.

## Resources and Quizzes

Learning doesn't end at reading. For each step, Sagepoint discovers curated external resources — articles, videos, courses, documentation — using Perplexity's research API. These resources are ranked and filtered to match the concept's depth and your experience level.

At the end of each step, Sagepoint generates a short quiz using GPT-4o-mini. Questions are concept-linked, so each one traces back to a specific idea from your document. Multiple choice and true/false formats keep assessment varied while staying tightly scoped to what you've actually studied.

## Progress You Can Measure

Every step you complete, every quiz you submit, every concept you mark as understood feeds into a progress model that persists across sessions. Sagepoint tracks completion percentages, time spent, and assessment scores at the roadmap level — so you always know where you are and what comes next.

The result is a learning experience that feels handcrafted for your material, because in a real sense it is. The structure, the sequence, the resources, the quizzes — all derived from the document you uploaded, not from a generic curriculum someone else designed.

## What's Next

Sagepoint is actively expanding the pipeline. Concept expansion lets you dive deeper into any step, generating sub-concepts and additional resources on demand. Cross-document roadmaps — paths that synthesize multiple uploads into a unified learning journey — are on the roadmap. And the quiz engine is evolving toward adaptive difficulty, adjusting question complexity based on your performance over time.

The underlying insight driving all of this is simple: structure unlocks learning. Give a learner a document and they'll read it. Give them a roadmap through it, and they'll understand it.`,
    heroImageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2026-04-01T00:00:00Z",
  },
  {
    slug: "clean-architecture-in-a-full-stack-typescript-monorepo",
    title: "Clean Architecture in a Full-Stack TypeScript Monorepo",
    excerpt:
      "How Domain-Driven Design, Ports & Adapters, and Vertical Slices work together in a pnpm monorepo with NestJS, Next.js, and shared domain packages.",
    categorySlug: "system-design",
    contentMarkdown: `Building Sagepoint required making a foundational bet early: that the complexity of a proper architecture would pay off faster than the simplicity of a monolith. Here's how that decision shaped everything.

## The Monorepo Backbone

Sagepoint lives in a pnpm workspace monorepo with four packages and two applications. The packages — \`domain\`, \`ai\`, \`database\`, and \`storage\` — are shared libraries. The applications — an API (NestJS) and a worker (also NestJS) — consume them.

This separation enforces a rule that matters: the domain knows nothing about infrastructure. \`packages/domain\` contains pure TypeScript — entities, port interfaces, and value objects. No Prisma imports. No LangChain imports. No framework decorators. It compiles and runs without any external dependency beyond TypeScript itself.

## Hexagonal Architecture in the API

The API follows hexagonal (ports and adapters) architecture with vertical slices. Each feature — \`roadmap\`, \`document\`, \`auth\`, \`user\`, \`insights\` — lives in its own folder under \`apps/api/src/features/\`. Within each feature:

- **\`domain/inbound/\`** defines the feature's service interface: the contract the outside world calls.
- **\`app/usecases/\`** contains individual use case classes: one class, one responsibility, no framework decorators.
- **\`infra/driver/http/\`** holds the NestJS controller, which injects only the inbound service symbol — never use cases directly.
- **\`dependencies.ts\`** wires everything together with plain constructor injection.

The controller never knows that a use case exists. It talks to an interface. The interface is implemented by a service that delegates to use cases. The use cases talk to port interfaces. Port interfaces are implemented by adapters in \`packages/database\` or \`packages/ai\`. No layer imports below it.

## The Worker

The worker handles background processing: document parsing, roadmap generation, and daily cron tasks. It uses BullMQ for queue-backed jobs and \`@nestjs/schedule\` for scheduled work.

The worker consumes the same domain entities and port interfaces as the API. The \`packages/ai\` adapters, the \`packages/database\` repositories — all bound via the same Symbol tokens, just wired differently.

## Shared AI Adapters

\`packages/ai\` is a LangChain-backed library of adapters, each implementing a domain port. The \`OpenAiQuizGenerationAdapter\` implements \`IQuizGenerationService\`. The \`TavilyNewsAdapter\` implements \`INewsService\`. Each adapter follows the same shape: structured output with a Zod schema, typed results, automatic retry on schema mismatch.

## Frontend: Screaming Architecture

The Next.js frontend mirrors the backend's vertical slice philosophy. Features live under \`apps/web/src/features/\`, each owning its own components, hooks, and types. Infrastructure (RTK Query API slices, the Redux store) is isolated. MUI v7 provides the component system with compound components that enforce design consistency.

## The Payoff

Six months in, the architectural investment has paid off. Adding a new feature means adding a new folder. Swapping an AI provider means swapping one adapter class. Writing tests means instantiating use cases with in-memory fakes — no mocking framework required. The codebase is larger than a quick prototype, but every part of it is navigable.`,
    heroImageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2026-03-15T00:00:00Z",
  },
  {
    slug: "knowledge-graphs-meet-ai-concept-mapping-with-neo4j",
    title: "Knowledge Graphs Meet AI: Concept Mapping with Neo4j",
    excerpt:
      "How Sagepoint uses Neo4j to build semantic concept graphs from documents, enabling intelligent roadmap ordering and on-demand concept expansion.",
    categorySlug: "machine-learning",
    contentMarkdown: `Most learning tools treat knowledge as a list. Sagepoint treats it as a graph — and that difference changes everything about how a roadmap is built.

## Why a Graph?

When you learn a technical subject, concepts don't arrive in isolation. Understanding Docker requires knowing what a process is. Understanding Kubernetes requires knowing Docker. Understanding RBAC requires knowing Kubernetes. These dependencies form a directed graph, and the correct order to learn them is a topological sort of that graph.

A flat list of topics can't represent this. SQL can, but querying multi-hop paths is painful. A vector database finds similar content but can't express "this concept must come before that one." Neo4j, a native graph database, is the right tool.

## The Concept Entity

In Sagepoint, a \`Concept\` is a node in Neo4j. It has an id, a name, a description, a difficulty level, and links back to the source document. The relationships between concepts are typed edges: \`DEPENDS_ON\` (prerequisite) and \`NEXT_STEP\` (natural continuation).

When the document analysis pipeline processes an upload, it extracts these concepts and relationships using GPT-4o-mini with structured output. The output is a list of concept objects and a list of \`(from, to, type)\` triples — saved atomically into Neo4j.

## Traversal for Roadmap Ordering

Once the concept graph is in Neo4j, roadmap generation traverses it to produce a learning sequence. The traversal respects the \`DEPENDS_ON\` edges: no concept appears in the roadmap before its prerequisites. The \`NEXT_STEP\` edges suggest groupings and pacing.

The roadmap's steps are stored as JSON in PostgreSQL alongside the roadmap record. This is a deliberate tradeoff: Neo4j for graph traversal and relationship queries, Postgres for entity storage and transactional operations.

## Concept Expansion

One of Sagepoint's most useful features is on-demand concept expansion. When a learner encounters a step that feels too broad, they can trigger expansion. A second LLM call generates sub-concepts and their relationships, which are added to the Neo4j graph and surfaced as a deeper sub-roadmap within the step.

This expansion is bounded: sub-concepts link back to their parent, and the UI surfaces them as a drill-down rather than flattening them into the main sequence.

## What the Graph Enables

The concept graph makes several things possible that would be difficult with a flat model: intelligent ordering where prerequisites always come first, gap detection when a user skips a concept, adaptive expansion to drill into any concept without restructuring the roadmap, and cross-material synthesis where concepts from multiple documents are unified into one learning path.

The graph isn't just a data structure. It's the model of how knowledge itself is organized — and making that model explicit is what lets Sagepoint build learning paths that actually make sense.`,
    heroImageUrl:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2026-03-01T00:00:00Z",
  },
  {
    slug: "building-an-ai-powered-quiz-engine-for-adaptive-learning",
    title: "Building an AI-Powered Quiz Engine for Adaptive Learning",
    excerpt:
      "How Sagepoint generates contextual quizzes from document concepts using GPT-4o-mini structured output, closing the loop between reading and understanding.",
    categorySlug: "artificial-intelligence",
    contentMarkdown: `Comprehension without verification is just reading. Sagepoint's quiz engine closes the loop between learning and understanding — generating assessments directly from the concepts in your documents, automatically, every time.

## The Design Constraint

The quiz engine had one non-negotiable constraint: questions must be grounded in source material. Generic trivia about a topic is noise. A question about the specific definition, example, or argument that appeared in your document is signal.

This constraint ruled out retrieval-based approaches and simple topic-matching. Instead, every quiz is generated from the actual text of the document, with the concept it tests explicitly linked.

## Structured Output with Zod

The quiz generation pipeline uses GPT-4o-mini with LangChain's \`withStructuredOutput()\`. The output schema, defined with Zod, specifies an array of questions — each with type (MULTIPLE_CHOICE or TRUE_FALSE), text, options with correctness flags, an explanation, a concept name, and a difficulty level.

By declaring the output schema, Sagepoint eliminates an entire category of failure: LLM responses that are almost-correct JSON, or that include the right content in the wrong structure. LangChain retries automatically if the model's output doesn't conform. The application receives a typed object or throws — never a string that needs parsing.

## Question Types

Two question types are supported. **Multiple choice** provides four options labeled A through D, exactly one correct, with distractors based on common misconceptions. **True/False** covers definitional claims and concept relationships that can be verified in binary terms.

The generation prompt targets a 70/30 split: roughly seven multiple choice for every three true/false questions. The ratio is configurable per quiz session.

## Concept Linking

Every question carries a \`conceptName\` field linking it to one of the roadmap's concepts. A learner who consistently misses questions linked to "dependency injection" knows exactly what to review. A learner who scores well across all machine learning concepts can move forward with confidence.

## Step-Level Attempts

Quizzes in Sagepoint are attached to roadmap steps, not to documents as a whole. A \`StepQuizAttempt\` records the learner's answers, score, and completion timestamp. This granularity matters for the learning loop: progress is tracked at the step level, quiz performance informs concept mastery at the step level, and future adaptive features will operate at the same granularity.

## What's Next

The current implementation generates quizzes on demand at a fixed difficulty. Planned evolution includes adaptive difficulty adjusting based on past performance, spaced repetition prompts surfacing previously-missed questions after a delay, and explanation expansion generating longer re-explanations for wrong answers using different language from the document.

The quiz engine isn't just a checkbox at the end of a step. It's the feedback loop that transforms passive reading into active learning — and the structured output architecture makes it reliable enough to trust as part of that loop.`,
    heroImageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
    publishedAt: "2026-02-15T00:00:00Z",
  },
];

export async function seedBlogPosts(client: Client): Promise<void> {
  console.log("Seeding static blog posts...");
  let created = 0;
  let skipped = 0;

  for (const post of STATIC_BLOG_POSTS) {
    const { rows: existing } = await client.query(
      'SELECT 1 FROM "blog_posts" WHERE slug = $1',
      [post.slug],
    );

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const { rows: catRows } = await client.query<{ id: string }>(
      "SELECT id FROM categories WHERE slug = $1",
      [post.categorySlug],
    );

    if (catRows.length === 0) {
      console.log(
        `  Skipped "${post.slug}" — category "${post.categorySlug}" not found`,
      );
      continue;
    }

    await client.query(
      `INSERT INTO "blog_posts" (id, slug, title, excerpt, "contentMarkdown", "heroImageUrl", "categoryId", author, source, sources, "publishedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Sagepoint Team', 'STATIC', '[]', $8, now(), now())`,
      [
        randomUUID(),
        post.slug,
        post.title,
        post.excerpt,
        post.contentMarkdown,
        post.heroImageUrl,
        catRows[0].id,
        post.publishedAt,
      ],
    );
    created++;
  }

  console.log(`  Created: ${created}, Skipped: ${skipped}\n`);
}
