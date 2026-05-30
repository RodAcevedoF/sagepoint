"use client";

import { Box, Typography, alpha, useTheme } from "@mui/material";
import { Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReviewSource } from "@sagepoint/domain";
import { Button } from "@/shared/components";
import {
  ButtonVariants,
  ButtonSizes,
  ButtonIconPositions,
} from "@/shared/types";
import { useReviewCountQuery } from "@/application/review";

interface ReviewCallToActionProps {
  source: ReviewSource;
  sourceId: string;
}

export function ReviewCallToAction({
  source,
  sourceId,
}: ReviewCallToActionProps) {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading } = useReviewCountQuery({ source, sourceId });
  const count = data?.count ?? 0;

  if (isLoading || count === 0) return null;

  const href = `/review?source=${encodeURIComponent(source)}&sourceId=${encodeURIComponent(sourceId)}`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        p: 2,
        borderRadius: 3,
        bgcolor: alpha(theme.palette.info.main, 0.08),
        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Sparkles size={20} color={theme.palette.info.light} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {count} card{count === 1 ? "" : "s"} due for review
        </Typography>
      </Box>
      <Button
        label="Review now"
        icon={ArrowRight}
        iconPos={ButtonIconPositions.END}
        variant={ButtonVariants.OUTLINED}
        size={ButtonSizes.SMALL}
        onClick={() => router.push(href)}
      />
    </Box>
  );
}
