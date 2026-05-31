"use client";

import { useState } from "react";
import { Box, Grid, Pagination, Skeleton } from "@mui/material";
import { Newspaper } from "lucide-react";
import { PublicLayout, RootWrapper } from "@/shared/components";
import { EmptyState } from "@/shared/components/ui/States/EmptyState";
import { useGetBlogPostsQuery } from "@/infrastructure/api/blogApi";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { BlogHeader, FeaturedPost, BlogGrid } from "./index";

const PAGE_SIZE = 12;

const styles = {
  pagination: {
    mt: 6,
    display: "flex",
    justifyContent: "center",
    "& .MuiPaginationItem-root": {
      color: auroraPalette.txMid,
      fontFamily: auroraPalette.font.mono,
      fontWeight: 600,
      border: `1px solid ${auroraPalette.line}`,
      background: auroraPalette.surface2,
      "&:hover": {
        background: auroraPalette.surface3,
        color: auroraPalette.txHi,
      },
      "&.Mui-selected": {
        background: auroraTint(auroraPalette.teal, 0.15),
        borderColor: auroraTint(auroraPalette.teal, 0.4),
        color: auroraPalette.teal,
        "&:hover": { background: auroraTint(auroraPalette.teal, 0.22) },
      },
    },
  },
} as const;

function BlogSkeleton() {
  return (
    <>
      <Skeleton
        variant="rounded"
        height={420}
        sx={{
          mb: 8,
          borderRadius: auroraPalette.radii.card,
          bgcolor: auroraPalette.surface2,
        }}
        animation="wave"
      />
      <Grid container spacing={3}>
        {[0, 1, 2].map((i) => (
          <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
            <Skeleton
              variant="rounded"
              height={360}
              animation="wave"
              sx={{
                borderRadius: auroraPalette.radii.card,
                bgcolor: auroraPalette.surface2,
              }}
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
      <RootWrapper paddingTop={96} paddingBottom={64}>
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
      </RootWrapper>
    </PublicLayout>
  );
};
