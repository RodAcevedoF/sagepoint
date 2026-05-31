"use client";

import { Box, Stack } from "@mui/material";
import { AuthorAvatar } from "./AuthorAvatar";
import { Card } from "@/shared/components";
import { aurora as auroraPalette } from "@/shared/theme";
import { toneColor } from "@/shared/components/ui/Aurora/tones";
import type { BlogPostDto } from "@/infrastructure/api/blogApi";
import {
  resolveImage,
  humanizeSlug,
  categoryTone,
} from "../constants/categoryAssets";

interface FeaturedPostProps {
  post: BlogPostDto;
}

export const FeaturedPost = ({ post }: FeaturedPostProps) => {
  const image = resolveImage(post.heroImageUrl, post.categorySlug);
  const category = humanizeSlug(post.categorySlug);
  const tone = categoryTone(post.categorySlug);
  const accent = toneColor(tone);
  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card
      href={`/blog/${post.slug}`}
      variant="aurora"
      tone={tone}
      sx={{
        mb: 8,
        flexDirection: { xs: "column", md: "row" },
        textDecoration: "none",
      }}
    >
      <Box
        component="img"
        src={image}
        alt={post.title}
        sx={{
          position: "relative",
          zIndex: 1,
          width: { xs: "100%", md: "50%" },
          height: { xs: 240, md: "auto" },
          minHeight: { md: 340 },
          objectFit: "cover",
          display: "block",
          borderRight: { md: `1px solid ${auroraPalette.line}` },
          borderBottom: { xs: `1px solid ${auroraPalette.line}`, md: 0 },
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          padding: { xs: "26px 24px 28px", md: "40px 44px" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "14px",
        }}
      >
        <Box
          component="span"
          sx={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "5px 12px",
            borderRadius: auroraPalette.radii.pill,
            fontFamily: auroraPalette.font.mono,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            background: "color-mix(in oklch, var(--accent) 14%, transparent)",
            border:
              "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
            color: accent,
          }}
        >
          {category}
        </Box>
        <Box
          component="h2"
          sx={{
            fontFamily: auroraPalette.font.display,
            fontWeight: 800,
            fontSize: { xs: "1.75rem", md: "2.5rem" },
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            margin: 0,
            background: `linear-gradient(150deg, ${auroraPalette.txHi} 18%, ${accent} 100%)`,
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
            margin: 0,
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            lineHeight: 1.6,
            color: auroraPalette.txMid,
            textWrap: "pretty",
          }}
        >
          {post.excerpt}
        </Box>

        <Stack
          direction="row"
          spacing={2.5}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: "8px" }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <AuthorAvatar author={post.author} size={32} />
            <Box
              component="span"
              sx={{
                fontWeight: 600,
                fontSize: "0.875rem",
                color: auroraPalette.txHi,
              }}
            >
              {post.author}
            </Box>
          </Stack>
          <Box
            component="span"
            sx={{
              fontFamily: auroraPalette.font.mono,
              fontSize: "12px",
              color: auroraPalette.txLow,
            }}
          >
            {date}
          </Box>
        </Stack>
      </Box>
    </Card>
  );
};
