"use client";

import React from "react";
import {
  Typography,
  CardMedia,
  Chip,
  Stack,
  Avatar,
  alpha,
  SxProps,
  Theme,
} from "@mui/material";
import { Clock } from "lucide-react";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
}

/**
 * Styles for FeaturedPost
 */
const featuredCardStyles: SxProps<Theme> = {
  mb: 8,
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  overflow: "hidden",
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

const metaContainerStyles: SxProps<Theme> = {
  alignItems: "center",
  flexWrap: "wrap",
  gap: 2,
};

const avatarStyles: SxProps<Theme> = {
  width: 40,
  height: 40,
  bgcolor: palette.primary.main,
  fontSize: "0.9rem",
  fontWeight: 600,
  border: `2px solid ${alpha(palette.primary.light, 0.2)}`,
};

const clockIconStyles: SxProps<Theme> = {
  color: "text.disabled",
};

interface FeaturedPostProps {
  post: BlogPost;
}

export const FeaturedPost = ({ post }: FeaturedPostProps) => {
  const authorInitials = post.author
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card variant="glass" sx={featuredCardStyles}>
      <CardMedia<"img">
        component="img"
        sx={imageStyles}
        image={post.image}
        alt={post.title}
      />
      <Card.Content sx={contentStyles}>
        <Chip label={post.category} size="small" sx={categoryChipStyles} />
        <Typography variant="h3" sx={titleStyles}>
          {post.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={excerptStyles}>
          {post.excerpt}
        </Typography>
        <Stack direction="row" spacing={3} sx={metaContainerStyles} useFlexGap>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={avatarStyles}>{authorInitials}</Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {post.author}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={clockIconStyles}
          >
            <Clock size={16} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {post.readTime}
            </Typography>
          </Stack>
        </Stack>
      </Card.Content>
    </Card>
  );
};
