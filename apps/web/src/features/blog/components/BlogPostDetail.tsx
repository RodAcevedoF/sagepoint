"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  alpha,
  Divider,
} from "@mui/material";
import { AuthorAvatar } from "./AuthorAvatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PublicLayout } from "@/shared/components";
import { palette } from "@/shared/theme";
import type { BlogPostDto } from "@/infrastructure/api/blogApi";
import { resolveImage, humanizeSlug } from "../constants/categoryAssets";

interface BlogPostDetailProps {
  post: BlogPostDto;
}

export const BlogPostDetail = ({ post }: BlogPostDetailProps) => {
  const image = resolveImage(post.heroImageUrl, post.categorySlug);
  const category = humanizeSlug(post.categorySlug);
  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <PublicLayout>
      <Box
        sx={{
          pt: { xs: 10, md: 14 },
          pb: 8,
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="md">
          <Chip
            label={category}
            size="small"
            sx={{
              mb: 3,
              bgcolor: alpha(palette.primary.light, 0.1),
              color: palette.primary.light,
              fontWeight: 700,
              borderRadius: 1,
            }}
          />
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, mb: 3, lineHeight: 1.2 }}
          >
            {post.title}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, lineHeight: 1.6 }}
          >
            {post.excerpt}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 5 }}>
            <AuthorAvatar author={post.author} size={44} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {post.author}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {date}
              </Typography>
            </Box>
          </Stack>

          <Box
            component="img"
            src={image}
            alt={post.title}
            sx={{
              width: "100%",
              borderRadius: 2,
              mb: 6,
              maxHeight: 480,
              objectFit: "cover",
            }}
          />

          <Box
            sx={{
              "& h1,& h2,& h3,& h4": {
                fontWeight: 700,
                mt: 4,
                mb: 2,
                color: "text.primary",
              },
              "& h2": { fontSize: "1.5rem" },
              "& h3": { fontSize: "1.25rem" },
              "& p": { mb: 2, lineHeight: 1.8, color: "text.secondary" },
              "& ul,& ol": { pl: 3, mb: 2, color: "text.secondary" },
              "& li": { mb: 0.5, lineHeight: 1.8 },
              "& blockquote": {
                borderLeft: `4px solid ${palette.primary.main}`,
                pl: 2,
                ml: 0,
                fontStyle: "italic",
                color: "text.secondary",
              },
              "& code": {
                bgcolor: "action.hover",
                px: 0.75,
                py: 0.25,
                borderRadius: 0.5,
                fontFamily: "monospace",
                fontSize: "0.875em",
              },
              "& pre": {
                bgcolor: "action.hover",
                p: 2,
                borderRadius: 1,
                overflowX: "auto",
                mb: 2,
                "& code": { bgcolor: "transparent", p: 0 },
              },
              "& a": { color: palette.primary.light },
              "& strong": { color: "text.primary", fontWeight: 700 },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.contentMarkdown}
            </ReactMarkdown>
          </Box>

          {post.sources.length > 0 && (
            <>
              <Divider sx={{ my: 5 }} />
              <Typography
                variant="overline"
                color="text.disabled"
                sx={{ letterSpacing: 1 }}
              >
                Sources
              </Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                {post.sources.map((s, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    component="a"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: palette.primary.light,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {s.title} — {s.source}
                  </Typography>
                ))}
              </Stack>
            </>
          )}
        </Container>
      </Box>
    </PublicLayout>
  );
};
