"use client";

import React from "react";
import { Box, Container, Grid, Skeleton } from "@mui/material";
import { PublicLayout } from "@/shared/components";
import { EmptyState } from "@/shared/components/ui/States/EmptyState";
import { useGetBlogPostsQuery } from "@/infrastructure/api/blogApi";
import { BlogHeader, FeaturedPost, BlogGrid } from "./index";
import { Newspaper } from "lucide-react";

function BlogSkeleton() {
  return (
    <>
      <Skeleton
        variant="rounded"
        height={420}
        sx={{ mb: 8, borderRadius: 2 }}
        animation="wave"
      />
      <Grid container spacing={4}>
        {[0, 1, 2].map((i) => (
          <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
            <Skeleton
              variant="rounded"
              height={360}
              animation="wave"
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export const BlogPage = () => {
  const { data: posts, isLoading } = useGetBlogPostsQuery({ limit: 13 });

  const [featured, rest] = React.useMemo(() => {
    if (!posts || posts.length === 0) return [undefined, []];
    return [posts[0], posts.slice(1)];
  }, [posts]);

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

          {isLoading ? (
            <BlogSkeleton />
          ) : posts && posts.length > 0 ? (
            <>
              {featured && <FeaturedPost post={featured} />}
              <BlogGrid posts={rest} />
            </>
          ) : (
            <EmptyState
              icon={Newspaper}
              title="No posts yet"
              description="Check back soon — new articles are on their way."
            />
          )}
        </Container>
      </Box>
    </PublicLayout>
  );
};
