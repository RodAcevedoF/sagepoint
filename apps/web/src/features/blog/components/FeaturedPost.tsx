"use client";

import React from "react";
import {
  Typography,
  CardMedia,
  Chip,
  Stack,
  alpha,
  SxProps,
  Theme,
} from "@mui/material";
import { AuthorAvatar } from "./AuthorAvatar";
import { Card } from "@/shared/components";
import { palette } from "@/shared/theme";
import type { BlogPostDto } from "@/infrastructure/api/blogApi";
import { resolveImage, humanizeSlug } from "../constants/categoryAssets";

const featuredCardStyles: SxProps<Theme> = {
  mb: 8,
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  overflow: "hidden",
  textDecoration: "none",
};

const imageStyles: SxProps<Theme> = {
  width: { md: "50%" },
  height: { xs: 240, md: "auto" },
  objectFit: "cover",
};

const contentStyles: SxProps<Theme> = {
  p: { xs: 4, md: 6 },
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  flex: 1,
};

const categoryChipStyles: SxProps<Theme> = {
  width: "fit-content",
  mb: 2,
  bgcolor: alpha(palette.primary.light, 0.1),
  color: palette.primary.light,
  fontWeight: 700,
  borderRadius: 1,
};

const titleStyles: SxProps<Theme> = {
  fontWeight: 800,
  mb: 2,
  fontSize: { xs: "1.75rem", md: "2.5rem" },
  lineHeight: 1.2,
};

const excerptStyles: SxProps<Theme> = {
  mb: 4,
  fontSize: "1.1rem",
  lineHeight: 1.6,
};

interface FeaturedPostProps {
  post: BlogPostDto;
}

export const FeaturedPost = ({ post }: FeaturedPostProps) => {
  const image = resolveImage(post.heroImageUrl, post.categorySlug);
  const category = humanizeSlug(post.categorySlug);
  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card href={`/blog/${post.slug}`} variant="glass" sx={featuredCardStyles}>
      <CardMedia<"img">
        component="img"
        sx={imageStyles}
        image={image}
        alt={post.title}
      />
      <Card.Content sx={contentStyles}>
        <Chip label={category} size="small" sx={categoryChipStyles} />
        <Typography variant="h3" sx={titleStyles}>
          {post.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={excerptStyles}>
          {post.excerpt}
        </Typography>
        <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AuthorAvatar author={post.author} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {post.author}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ fontWeight: 600 }}
          >
            {date}
          </Typography>
        </Stack>
      </Card.Content>
    </Card>
  );
};
