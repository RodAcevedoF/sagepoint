import React from "react";
import { Box, Container } from "@mui/material";
import { PublicLayout } from "@/common/components";
import { BlogHeader, FeaturedPost, BlogGrid, type BlogPost } from "./index";

const posts: BlogPost[] = [
  {
    id: "1",
    title: "How Sagepoint Transforms Documents into Learning Roadmaps",
    excerpt:
      "From a single PDF upload to a complete, personalized learning path — discover how Sagepoint leverages LLMs and knowledge graphs to break down complex documents into structured, step-by-step roadmaps with curated resources and assessments.",
    category: "Product",
    author: "Sagepoint Team",
    date: "April 2026",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    title: "Clean Architecture in a Full-Stack TypeScript Monorepo",
    excerpt:
      "A deep dive into Sagepoint's architecture: how Domain-Driven Design, Ports & Adapters, and Vertical Slices work together in a pnpm monorepo with NestJS, Next.js, and shared domain packages.",
    category: "Architecture",
    author: "Sagepoint Team",
    date: "March 2026",
    readTime: "10 min read",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "3",
    title: "Knowledge Graphs Meet AI: Concept Mapping with Neo4j",
    excerpt:
      "How Sagepoint uses Neo4j to build semantic concept graphs from documents, enabling cross-document concept linking, ontology enrichment, and smarter roadmap generation.",
    category: "Technical",
    author: "Sagepoint Team",
    date: "March 2026",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "4",
    title: "Building an AI-Powered Quiz Engine for Adaptive Learning",
    excerpt:
      "From document analysis to auto-generated assessments — how Sagepoint creates contextual quizzes using GPT-4o-mini, covering multiple choice and true/false questions with detailed explanations.",
    category: "AI & Education",
    author: "Sagepoint Team",
    date: "February 2026",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "5",
    title:
      "From Local Dev to Production: Deploying a Monorepo with Docker and CI/CD",
    excerpt:
      "The journey of deploying Sagepoint to production — Docker multi-stage builds, GitHub Actions pipelines, VPS orchestration, Vercel frontend, and the lessons learned along the way.",
    category: "DevOps",
    author: "Sagepoint Team",
    date: "February 2026",
    readTime: "9 min read",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
  },
];

/**
 * BlogPage component refactored to be a Server Component.
 * It coordinates the layout and passes static/fetched data to specialized client components.
 */
export const BlogPage = () => {
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <PublicLayout>
      <Box
        sx={{
          pt: { xs: 12, md: 16 },
          pb: 8,
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="lg">
          <BlogHeader
            title="The Sagepoint Blog"
            subtitle="Behind the scenes of building an AI-powered learning platform — architecture decisions, technical deep dives, and lessons learned."
          />

          {featuredPost && <FeaturedPost post={featuredPost} />}

          <BlogGrid posts={remainingPosts} />
        </Container>
      </Box>
    </PublicLayout>
  );
};
