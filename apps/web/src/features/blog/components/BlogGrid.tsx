"use client";

import { Box, Grid } from "@mui/material";
import { Card } from "@/shared/components";
import { aurora as auroraPalette } from "@/shared/theme";
import { toneColor } from "@/shared/components/ui/Aurora/tones";
import type { BlogPostDto } from "@/infrastructure/api/blogApi";
import {
  resolveImage,
  humanizeSlug,
  categoryTone,
} from "../constants/categoryAssets";

interface PostCardProps {
  post: BlogPostDto;
}

interface BlogGridProps {
  posts: BlogPostDto[];
}

const PostCard = ({ post }: PostCardProps) => {
  const image = resolveImage(post.heroImageUrl, post.categorySlug);
  const category = humanizeSlug(post.categorySlug);
  const tone = categoryTone(post.categorySlug);
  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card
      href={`/blog/${post.slug}`}
      variant="aurora"
      tone={tone}
      sx={{ textDecoration: "none", height: "100%" }}
    >
      <Box
        component="img"
        src={image}
        alt={post.title}
        loading="lazy"
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: 200,
          objectFit: "cover",
          display: "block",
          borderBottom: `1px solid ${auroraPalette.line}`,
        }}
      />
      <Card.Body>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: auroraPalette.radii.pill,
              fontFamily: auroraPalette.font.mono,
              fontSize: "10.5px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "color-mix(in oklch, var(--accent) 13%, transparent)",
              border:
                "1px solid color-mix(in oklch, var(--accent) 28%, transparent)",
              color: "var(--accent)",
            }}
          >
            <Box
              component="span"
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: toneColor(tone),
              }}
            />
            {category}
          </Box>
          <Card.FootDate>{date}</Card.FootDate>
        </Box>

        <Card.Title>{post.title}</Card.Title>
        <Card.Desc
          sx={{
            WebkitLineClamp: 3,
            fontSize: "13.5px",
          }}
        >
          {post.excerpt}
        </Card.Desc>
      </Card.Body>
    </Card>
  );
};

export const BlogGrid = ({ posts }: BlogGridProps) => (
  <Grid container spacing={3}>
    {posts.map((post) => (
      <Grid size={{ xs: 12, md: 6, lg: 4 }} key={post.id}>
        <PostCard post={post} />
      </Grid>
    ))}
  </Grid>
);
