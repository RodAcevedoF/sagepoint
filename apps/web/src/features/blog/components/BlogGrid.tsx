"use client";

import React from "react";
import {
  Grid,
  Typography,
  CardMedia,
  Stack,
  SxProps,
  Theme,
} from "@mui/material";
import { Card } from "@/shared/components";
import { palette } from "@/shared/theme";
import type { BlogPostDto } from "@/infrastructure/api/blogApi";
import { resolveImage, humanizeSlug } from "../constants/categoryAssets";

const postCardStyles: SxProps<Theme> = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  textDecoration: "none",
};

const cardMediaStyles: SxProps<Theme> = {
  objectFit: "cover",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
};

const cardContentStyles: SxProps<Theme> = {
  p: 4,
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
};

const categoryTextStyles: SxProps<Theme> = {
  color: palette.primary.light,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: "uppercase",
};

const dateTextStyles: SxProps<Theme> = {
  color: "text.disabled",
  fontWeight: 500,
};

const postTitleStyles: SxProps<Theme> = {
  fontWeight: 700,
  mb: 2,
  lineHeight: 1.3,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const postExcerptStyles: SxProps<Theme> = {
  mb: 3,
  lineHeight: 1.6,
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  flexGrow: 1,
};

interface PostCardProps {
  post: BlogPostDto;
}

interface BlogGridProps {
  posts: BlogPostDto[];
}

const PostCard = ({ post }: PostCardProps) => {
  const image = resolveImage(post.heroImageUrl, post.categorySlug);
  const category = humanizeSlug(post.categorySlug);
  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card href={`/blog/${post.slug}`} variant="glass" sx={postCardStyles}>
      <CardMedia<"img">
        component="img"
        height="220"
        image={image}
        alt={post.title}
        sx={cardMediaStyles}
      />
      <Card.Content sx={cardContentStyles}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="caption" sx={categoryTextStyles}>
            {category}
          </Typography>
          <Typography variant="caption" sx={dateTextStyles}>
            {date}
          </Typography>
        </Stack>

        <Typography variant="h5" sx={postTitleStyles}>
          {post.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={postExcerptStyles}
        >
          {post.excerpt}
        </Typography>
      </Card.Content>
    </Card>
  );
};

export const BlogGrid = ({ posts }: BlogGridProps) => {
  return (
    <Grid container spacing={4}>
      {posts.map((post) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={post.id}>
          <PostCard post={post} />
        </Grid>
      ))}
    </Grid>
  );
};
