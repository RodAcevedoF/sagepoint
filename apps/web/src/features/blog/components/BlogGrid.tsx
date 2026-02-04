"use client";

import React from "react";
import {
  Grid,
  Typography,
  CardMedia,
  Stack,
  Button,
  SxProps,
  Theme,
} from "@mui/material";
import { ArrowRight } from "lucide-react";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import { BlogPost } from "./FeaturedPost";

/**
 * Styles for BlogGrid components
 */
const postCardStyles: SxProps<Theme> = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
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

const readMoreButtonStyles: SxProps<Theme> = {
  p: 0,
  width: "fit-content",
  color: palette.primary.light,
  fontWeight: 600,
  textTransform: "none",
  "&:hover": {
    bgcolor: "transparent",
    textDecoration: "underline",
    "& .lucide": {
      transform: "translateX(4px)",
    },
  },
  "& .lucide": {
    transition: "transform 0.2s",
  },
};

interface PostCardProps {
  post: BlogPost;
}

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <Card variant="glass" sx={postCardStyles}>
      <CardMedia<"img">
        component="img"
        height="220"
        image={post.image}
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
            {post.category}
          </Typography>
          <Typography variant="caption" sx={dateTextStyles}>
            {post.date}
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

        <Button endIcon={<ArrowRight size={16} />} sx={readMoreButtonStyles}>
          Read More
        </Button>
      </Card.Content>
    </Card>
  );
};

interface BlogGridProps {
  posts: BlogPost[];
}

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
