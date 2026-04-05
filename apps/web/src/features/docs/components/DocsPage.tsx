"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Container, Grid, Toolbar } from "@mui/material";
import {
  FileUp,
  Map,
  Compass,
  LayoutDashboard,
  ShieldCheck,
  BookOpen,
  Sparkles,
  GitBranch,
} from "lucide-react";
import { PublicLayout } from "@/common/components";
import { DocsHeader } from "./DocsHeader";
import {
  DocsSection,
  DocsProse,
  DocsList,
  DocsCallout,
  DocsSteps,
} from "./DocsSection";
import { DocsSidebar, type DocsSidebarItem } from "./DocsSidebar";

const sidebarItems: DocsSidebarItem[] = [
  { id: "overview", label: "Overview" },
  { id: "documents", label: "Documents" },
  { id: "roadmaps", label: "Roadmaps" },
  { id: "explore", label: "Explore & Community" },
  { id: "dashboard", label: "Dashboard & Profile" },
  { id: "ai", label: "AI Pipeline" },
  { id: "admin", label: "Administration" },
  { id: "architecture", label: "Architecture" },
];

export const DocsPage = () => {
  const [activeId, setActiveId] = useState("overview");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );

    const sections = sidebarItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    sections.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const handleNavigate = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <PublicLayout>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Grid container spacing={0}>
            {/* Sidebar */}
            <Grid size={{ xs: 12, md: 2.5 }}>
              <DocsSidebar
                items={sidebarItems}
                activeId={activeId}
                onNavigate={handleNavigate}
              />
            </Grid>

            {/* Content */}
            <Grid size={{ xs: 12, md: 9.5 }}>
              <Box sx={{ pl: { md: 4 } }}>
                <DocsHeader />

                {/* Overview */}
                <DocsSection
                  id="overview"
                  icon={<Sparkles size={22} />}
                  title="Overview"
                >
                  <DocsProse>
                    Sagepoint is a platform that transforms study materials into
                    personalized learning roadmaps. Upload a document — PDF,
                    DOCX, or XLSX — and the AI extracts concepts, maps their
                    relationships, and generates a structured path from
                    fundamentals to mastery.
                  </DocsProse>
                  <DocsSteps
                    steps={[
                      {
                        label: "Upload a document",
                        detail:
                          "Drag and drop or select a file. Supported formats: PDF, DOCX, XLSX.",
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
                    ]}
                  />
                  <DocsCallout variant="tip">
                    You can also explore public roadmaps created by other users
                    without uploading anything — head to the Explore page to
                    browse the community library.
                  </DocsCallout>
                </DocsSection>

                {/* Documents */}
                <DocsSection
                  id="documents"
                  icon={<FileUp size={22} />}
                  title="Documents"
                >
                  <DocsProse>
                    Every uploaded document goes through a multi-stage
                    processing pipeline. You can track its progress in real time
                    from the documents page.
                  </DocsProse>
                  <DocsList
                    items={[
                      "Processing stages: Uploaded → Parsing → Analyzing → Summarized → Ready.",
                      "AI-generated summaries include key points, topic area, and difficulty level.",
                      "Estimated reading time is calculated automatically.",
                      "Auto-generated quizzes let you test your understanding — multiple choice and true/false.",
                      "A concept map visualizes the relationships between extracted topics.",
                    ]}
                  />
                  <DocsProse>
                    Once processing completes, you can generate a roadmap
                    directly from the document detail page, or create one
                    separately from the roadmap creation form.
                  </DocsProse>
                </DocsSection>

                {/* Roadmaps */}
                <DocsSection
                  id="roadmaps"
                  icon={<Map size={22} />}
                  title="Roadmaps"
                >
                  <DocsProse>
                    Roadmaps are the core of Sagepoint. Each one is an ordered
                    sequence of concepts with learning objectives, difficulty
                    levels, time estimates, and curated external resources.
                  </DocsProse>
                  <DocsList
                    items={[
                      "Each step has a learning objective, estimated duration, and difficulty (beginner → expert).",
                      "Resources are curated per concept — articles, videos, courses, tutorials, and books.",
                      "Track progress step by step. Mark concepts as completed or skipped.",
                      "Per-step quizzes validate your understanding before moving on.",
                      "Toggle visibility to share your roadmap publicly with the community.",
                      "Adopt public roadmaps into your own library to track progress independently.",
                    ]}
                  />
                  <DocsCallout variant="info">
                    When creating a roadmap, the system searches for existing
                    public roadmaps on similar topics. You can adopt one instead
                    of generating from scratch.
                  </DocsCallout>
                </DocsSection>

                {/* Explore */}
                <DocsSection
                  id="explore"
                  icon={<Compass size={22} />}
                  title="Explore & Community"
                >
                  <DocsProse>
                    The Explore page is where you discover learning content
                    created by other users. Browse, search, filter by category,
                    and build on the collective knowledge of the community.
                  </DocsProse>
                  <DocsList
                    items={[
                      "Browse all public roadmaps with search and category filters.",
                      "Like roadmaps to bookmark them for later.",
                      "Adopt a roadmap to add it to your library with independent progress tracking.",
                      "Category rooms group related roadmaps by topic — browse rooms to find content in a specific subject area.",
                      "Featured roadmaps are highlighted by administrators for quality content.",
                    ]}
                  />
                </DocsSection>

                {/* Dashboard */}
                <DocsSection
                  id="dashboard"
                  icon={<LayoutDashboard size={22} />}
                  title="Dashboard & Profile"
                >
                  <DocsProse>
                    Your dashboard is the personal learning hub — it shows your
                    active roadmaps, recent documents, progress statistics, and
                    a news feed tailored to your interests.
                  </DocsProse>
                  <DocsList
                    items={[
                      "Active roadmaps with completion percentage and quick-resume links.",
                      "Recent documents with processing status.",
                      "Learning insights — news articles matched to your selected interests.",
                      "Profile page for managing your name, avatar, interests, and learning preferences.",
                      "Set a weekly hours goal and preferred learning schedule.",
                    ]}
                  />
                  <DocsProse>
                    New users go through an onboarding flow that configures
                    learning goals, interests, experience level, and schedule
                    preferences. These can be changed at any time from the
                    profile page.
                  </DocsProse>
                </DocsSection>

                {/* AI Pipeline */}
                <DocsSection
                  id="ai"
                  icon={<BookOpen size={22} />}
                  title="AI Pipeline"
                >
                  <DocsProse>
                    Sagepoint uses a combination of large language models and
                    graph databases to process documents and generate roadmaps.
                    The pipeline is designed for quality and cost efficiency.
                  </DocsProse>
                  <DocsList
                    items={[
                      "Document summaries and quizzes use GPT-4o-mini for fast, cost-effective generation.",
                      "Roadmap generation uses GPT-4o for deeper concept analysis and step ordering.",
                      "Resource discovery leverages the Perplexity API with Redis caching (7-day TTL).",
                      "Concepts are persisted to a Neo4j graph with SAME_AS cross-linking across documents.",
                      "Existing graph context is fed back to the LLM for ontology-enriched generation.",
                      "Processing runs asynchronously via BullMQ workers — no blocking on the main API.",
                    ]}
                  />
                  <DocsCallout variant="info">
                    The document pipeline is split: summaries and quizzes are
                    generated as independent jobs, so the summary arrives faster
                    while the quiz processes in the background.
                  </DocsCallout>
                </DocsSection>

                {/* Admin */}
                <DocsSection
                  id="admin"
                  icon={<ShieldCheck size={22} />}
                  title="Administration"
                >
                  <DocsProse>
                    Administrators have access to a dedicated panel for managing
                    users, content, and platform health. The admin panel is only
                    visible to users with the admin role.
                  </DocsProse>
                  <DocsList
                    items={[
                      "User management — activate, deactivate, change roles.",
                      "Document and roadmap moderation — review, delete, toggle featured status.",
                      "Analytics dashboard with charts for user growth, uploads, and generation stats.",
                      "Invitation system — send email invitations or create users directly with assigned passwords.",
                      "Invited users skip email verification and are pre-approved.",
                    ]}
                  />
                </DocsSection>

                {/* Architecture */}
                <DocsSection
                  id="architecture"
                  icon={<GitBranch size={22} />}
                  title="Architecture"
                  showDivider={false}
                >
                  <DocsProse>
                    Sagepoint is built as a TypeScript monorepo following Clean
                    Architecture, Domain-Driven Design, and the Ports & Adapters
                    pattern. The domain layer is pure and framework-agnostic.
                  </DocsProse>
                  <DocsList
                    items={[
                      "Backend: NestJS REST API with vertical slice feature organization.",
                      "Frontend: Next.js with MUI v7, Redux Toolkit, and RTK Query.",
                      "Worker: BullMQ processors for async document and roadmap generation.",
                      "Shared packages: domain (entities + ports), database (Prisma), ai (LangChain), graph (Neo4j), storage (GCS), parsing.",
                      "Infrastructure: PostgreSQL, Redis, Neo4j, Google Cloud Storage.",
                      "Deployment: Docker multi-stage builds, GitHub Actions CI/CD, VPS backend + Vercel frontend.",
                    ]}
                  />
                  <DocsCallout variant="tip">
                    Sagepoint is a university thesis project (TFG) built to
                    demonstrate production-grade architecture in a full-stack AI
                    application.
                  </DocsCallout>
                </DocsSection>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </PublicLayout>
  );
};
