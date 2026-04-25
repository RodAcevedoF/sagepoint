"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Pagination,
  Skeleton,
  alpha,
} from "@mui/material";
import { PublicLayout } from "@/shared/components";
import { EmptyState } from "@/shared/components/ui/States/EmptyState";
import { useGetBlogPostsQuery } from "@/infrastructure/api/blogApi";
import { palette } from "@/shared/theme";
import { BlogHeader, FeaturedPost, BlogGrid } from "./index";
import { Newspaper } from "lucide-react";

const PAGE_SIZE = 12;

const styles = {
  pagination: {
    mt: 6,
    display: "flex",
    justifyContent: "center",
    "& .MuiPaginationItem-root": {
      color: palette.text.secondary,
      fontWeight: 600,
      "&.Mui-selected": {
        bgcolor: alpha(palette.primary.main, 0.15),
        color: palette.primary.light,
        "&:hover": { bgcolor: alpha(palette.primary.main, 0.25) },
      },
    },
  },
};

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
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetBlogPostsQuery({
    page,
    limit: PAGE_SIZE,
  });

  const posts = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 0;
  const isFirstPage = page === 1;
  const featured = isFirstPage ? posts[0] : undefined;
  const rest = isFirstPage ? posts.slice(1) : posts;
  const showSkeleton = isLoading || (isFetching && !data);

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

          {showSkeleton ? (
            <BlogSkeleton />
          ) : posts.length > 0 ? (
            <>
              {featured && <FeaturedPost post={featured} />}
              <BlogGrid posts={rest} />
              {totalPages > 1 && (
                <Box sx={styles.pagination}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_e, value) => {
                      setPage(value);
                      if (typeof window !== "undefined") {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    shape="rounded"
                    size="large"
                  />
                </Box>
              )}
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
