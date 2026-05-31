"use client";

import { Box, Stack } from "@mui/material";
import { Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BackLink, Pill, PublicLayout, RootWrapper } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { toneColor } from "@/shared/components/ui/Aurora/tones";
import type { BlogPostDto } from "@/infrastructure/api/blogApi";
import { AuthorAvatar } from "./AuthorAvatar";
import {
  resolveImage,
  humanizeSlug,
  categoryTone,
} from "../constants/categoryAssets";
import { readingTimeMinutes } from "../utils/readingTime";

interface BlogPostDetailProps {
  post: BlogPostDto;
}

export const BlogPostDetail = ({ post }: BlogPostDetailProps) => {
  const image = resolveImage(post.heroImageUrl, post.categorySlug);
  const category = humanizeSlug(post.categorySlug);
  const tone = categoryTone(post.categorySlug);
  const accent = toneColor(tone);
  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const minutes = readingTimeMinutes(post.contentMarkdown);

  return (
    <PublicLayout>
      <RootWrapper paddingTop={80} paddingBottom={64}>
        <Box sx={{ maxWidth: 760, mx: "auto" }}>
          <Box sx={{ mb: 4, mt: 4 }}>
            <BackLink href="/blog" label="Back to blog" />
          </Box>

          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "5px 12px",
              borderRadius: auroraPalette.radii.pill,
              fontFamily: auroraPalette.font.mono,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              background: auroraTint(accent, 0.12),
              border: `1px solid ${auroraTint(accent, 0.3)}`,
              color: accent,
            }}
          >
            {category}
          </Box>

          <Box
            component="h1"
            sx={{
              fontFamily: auroraPalette.font.display,
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.875rem" },
              lineHeight: 1.1,
              letterSpacing: "-0.028em",
              margin: "16px 0 0",
              background: `linear-gradient(150deg, ${auroraPalette.txHi} 22%, ${accent} 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {post.title}
          </Box>

          <Box
            component="p"
            sx={{
              margin: "20px 0 0",
              lineHeight: 1.6,
              fontSize: { xs: "1.05rem", md: "1.2rem" },
              color: auroraPalette.txMid,
              textWrap: "pretty",
            }}
          >
            {post.excerpt}
          </Box>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            useFlexGap
            sx={{ mt: 4, flexWrap: "wrap", rowGap: 1.25 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <AuthorAvatar author={post.author} size={40} />
              <Box>
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: auroraPalette.txHi,
                  }}
                >
                  {post.author}
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontFamily: auroraPalette.font.mono,
                    fontSize: "11.5px",
                    color: auroraPalette.txLow,
                  }}
                >
                  {date}
                </Box>
              </Box>
            </Stack>
            <Pill tone={tone} icon={<Clock size={13} />}>
              {minutes} min read
            </Pill>
          </Stack>

          <Box
            component="img"
            src={image}
            alt={post.title}
            sx={{
              width: "100%",
              borderRadius: auroraPalette.radii.card,
              border: `1px solid ${auroraPalette.line}`,
              mt: 5,
              mb: 6,
              maxHeight: 480,
              objectFit: "cover",
              display: "block",
            }}
          />

          <Box
            sx={{
              fontFamily: auroraPalette.font.ui,
              "& h1,& h2,& h3,& h4": {
                fontFamily: auroraPalette.font.display,
                fontWeight: 700,
                mt: 5,
                mb: 2,
                color: auroraPalette.txHi,
                letterSpacing: "-0.018em",
                lineHeight: 1.2,
              },
              "& h2": { fontSize: "1.75rem" },
              "& h3": { fontSize: "1.3rem" },
              "& h4": { fontSize: "1.1rem" },
              "& p": {
                mb: 2.5,
                lineHeight: 1.8,
                fontSize: "1.05rem",
                color: auroraPalette.tx,
              },
              "& ul,& ol": {
                pl: 3,
                mb: 2.5,
                color: auroraPalette.tx,
              },
              "& li": {
                mb: 0.75,
                lineHeight: 1.8,
                fontSize: "1.05rem",
              },
              "& blockquote": {
                borderLeft: `3px solid ${auroraTint(accent, 0.6)}`,
                pl: 2.5,
                ml: 0,
                my: 3,
                fontStyle: "italic",
                color: auroraPalette.txMid,
                background: auroraTint(accent, 0.05),
                py: 1.5,
                borderRadius: auroraPalette.radii.sm,
              },
              "& code": {
                background: auroraPalette.surface2,
                border: `1px solid ${auroraPalette.line}`,
                px: 0.75,
                py: 0.25,
                borderRadius: auroraPalette.radii.sm,
                fontFamily: auroraPalette.font.mono,
                fontSize: "0.875em",
                color: auroraPalette.txHi,
              },
              "& pre": {
                background: auroraPalette.surface2,
                border: `1px solid ${auroraPalette.line}`,
                p: 2,
                borderRadius: auroraPalette.radii.md,
                overflowX: "auto",
                mb: 2.5,
                "& code": {
                  background: "transparent",
                  border: 0,
                  p: 0,
                },
              },
              "& a": {
                color: auroraPalette.txHi,
                textDecoration: "underline",
                textDecorationColor: auroraTint(accent, 0.55),
                textUnderlineOffset: "3px",
                transition:
                  "text-decoration-color 0.15s ease, color 0.15s ease",
                "&:hover": {
                  color: accent,
                  textDecorationColor: accent,
                },
              },
              "& strong": {
                color: auroraPalette.txHi,
                fontWeight: 700,
              },
              "& hr": {
                border: 0,
                borderTop: `1px solid ${auroraPalette.line}`,
                my: 5,
              },
              "& img": {
                maxWidth: "100%",
                borderRadius: auroraPalette.radii.md,
                border: `1px solid ${auroraPalette.line}`,
                my: 3,
                display: "block",
              },
              "& table": {
                width: "100%",
                borderCollapse: "collapse",
                mb: 2.5,
                fontSize: "0.95rem",
              },
              "& th,& td": {
                textAlign: "left",
                padding: "10px 12px",
                borderBottom: `1px solid ${auroraPalette.line}`,
              },
              "& th": {
                color: auroraPalette.txHi,
                fontWeight: 700,
                fontFamily: auroraPalette.font.mono,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.contentMarkdown}
            </ReactMarkdown>
          </Box>

          {post.sources.length > 0 && (
            <>
              <Box
                sx={{
                  height: "1px",
                  background: auroraPalette.line,
                  my: 5,
                }}
              />
              <Box
                component="span"
                sx={{
                  display: "block",
                  fontFamily: auroraPalette.font.mono,
                  fontSize: "11.5px",
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: auroraPalette.txLow,
                  mb: 2,
                }}
              >
                Sources
              </Box>
              <Stack spacing={1.25}>
                {post.sources.map((s, i) => (
                  <Box
                    key={i}
                    component="a"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontSize: "0.9rem",
                      color: auroraPalette.tx,
                      textDecoration: "none",
                      transition: "color 0.15s ease",
                      "&:hover": {
                        color: accent,
                        textDecoration: "underline",
                        textDecorationColor: accent,
                        textUnderlineOffset: "3px",
                      },
                    }}
                  >
                    {s.title}{" "}
                    <Box
                      component="span"
                      sx={{
                        color: auroraPalette.txLow,
                        ml: 0.5,
                        fontFamily: auroraPalette.font.mono,
                        fontSize: "0.85em",
                      }}
                    >
                      — {s.source}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </Box>
      </RootWrapper>
    </PublicLayout>
  );
};
