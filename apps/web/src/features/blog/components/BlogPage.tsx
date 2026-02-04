import React from "react";
import { Box, Container } from "@mui/material";
import { PublicLayout } from "@/common/components";
import { BlogHeader, FeaturedPost, BlogGrid, type BlogPost } from "./index";

const posts: BlogPost[] = [
  {
    id: "1",
    title: "Introducing Sagepoint AI: The Future of Workflow Automation",
    excerpt:
      "Discover how our new LLM-powered engine can transform your daily development tasks and increase productivity by 40%.",
    category: "Product",
    author: "Alex Rivers",
    date: "May 15, 2024",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    title: "Fine-tuning Small Language Models for Domain Tasks",
    excerpt:
      "A deep dive into how we optimized local models to run efficiently within the Sagepoint ecosystem without sacrificing accuracy.",
    category: "Technical",
    author: "Sarah Chen",
    date: "May 12, 2024",
    readTime: "12 min read",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "3",
    title: "Top 5 AI Design Patterns for Modern Web Apps",
    excerpt:
      "From streaming responses to optimistic UI updates, learn the patterns that make AI feel snappy and intuitive.",
    category: "Design",
    author: "Marcus Thorne",
    date: "May 10, 2024",
    readTime: "8 min read",
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
            subtitle="Insights into the intersection of artificial intelligence, software engineering, and the future of collaborative workspaces."
          />

          {featuredPost && <FeaturedPost post={featuredPost} />}

          <BlogGrid posts={remainingPosts} />
        </Container>
      </Box>
    </PublicLayout>
  );
};
