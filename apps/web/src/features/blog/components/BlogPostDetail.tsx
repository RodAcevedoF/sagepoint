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
import { Clock } from "lucide-react";
import { AuthorAvatar } from "./AuthorAvatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PublicLayout } from "@/shared/components";
import { palette } from "@/shared/theme";
import type { BlogPostDto } from "@/infrastructure/api/blogApi";
import { resolveImage, humanizeSlug } from "../constants/categoryAssets";
import { readingTimeMinutes } from "../utils/readingTime";

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
  const minutes = readingTimeMinutes(post.contentMarkdown);

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
        <Container maxWidth="md" sx={{ maxWidth: { md: 760 } }}>
          <Chip
            label={category}
            size="small"
            sx={{
              mb: 3,
              bgcolor: "transparent",
              color: "text.secondary",
              border: `1px solid ${alpha(palette.primary.light, 0.4)}`,
              fontWeight: 700,
              letterSpacing: 0.5,
              borderRadius: 1,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              fontSize: { xs: "2rem", md: "2.75rem" },
            }}
          >
            {post.title}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 4,
              lineHeight: 1.6,
              fontWeight: 400,
              fontSize: { xs: "1.05rem", md: "1.2rem" },
            }}
          >
            {post.excerpt}
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            divider={
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  bgcolor: "text.disabled",
                }}
              />
            }
            sx={{ mb: 5, flexWrap: "wrap", rowGap: 1 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <AuthorAvatar author={post.author} size={40} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {post.author}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {date}
                </Typography>
              </Box>
            </Stack>
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ color: "text.disabled" }}
            >
              <Clock size={14} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {minutes} min read
              </Typography>
            </Stack>
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
                mt: 5,
                mb: 2,
                color: "text.primary",
                letterSpacing: "-0.005em",
              },
              "& h2": { fontSize: "1.625rem" },
              "& h3": { fontSize: "1.25rem" },
              "& p": {
                mb: 2.5,
                lineHeight: 1.85,
                fontSize: "1.05rem",
                color: "text.secondary",
              },
              "& ul,& ol": { pl: 3, mb: 2.5, color: "text.secondary" },
              "& li": { mb: 0.75, lineHeight: 1.85, fontSize: "1.05rem" },
              "& blockquote": {
                borderLeft: `3px solid ${alpha(palette.primary.main, 0.6)}`,
                pl: 2.5,
                ml: 0,
                my: 3,
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
                mb: 2.5,
                "& code": { bgcolor: "transparent", p: 0 },
              },
              "& a": {
                color: "text.primary",
                textDecoration: "underline",
                textDecorationColor: alpha(palette.primary.light, 0.5),
                textUnderlineOffset: "3px",
                transition: "text-decoration-color 0.2s",
                "&:hover": {
                  textDecorationColor: palette.primary.light,
                },
              },
              "& strong": { color: "text.primary", fontWeight: 700 },
              "& hr": {
                border: 0,
                borderTop: `1px solid ${alpha(palette.text.primary, 0.08)}`,
                my: 4,
              },
              "& img": {
                maxWidth: "100%",
                borderRadius: 1,
                my: 3,
              },
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
                sx={{ letterSpacing: 1.5 }}
              >
                Sources
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                {post.sources.map((s, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    component="a"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "text.secondary",
                      textDecoration: "none",
                      transition: "color 0.2s",
                      "&:hover": {
                        color: "text.primary",
                        textDecoration: "underline",
                        textDecorationColor: palette.primary.light,
                        textUnderlineOffset: "3px",
                      },
                    }}
                  >
                    {s.title}{" "}
                    <Box
                      component="span"
                      sx={{ color: "text.disabled", ml: 0.5 }}
                    >
                      — {s.source}
                    </Box>
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
