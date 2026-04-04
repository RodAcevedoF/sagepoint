"use client";

import { Box, Typography, alpha } from "@mui/material";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useToggleLikeCommand, useLikeStatusQuery } from "@/application/social";
import { useAppSelector } from "@/common/hooks";
import { palette } from "@/common/theme";

interface LikeButtonProps {
  roadmapId: string;
  compact?: boolean;
}

export function LikeButton({ roadmapId, compact = false }: LikeButtonProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: likeStatus } = useLikeStatusQuery(
    isAuthenticated ? roadmapId : null,
  );
  const [toggleLike, { isLoading }] = useToggleLikeCommand();

  const liked = likeStatus?.liked ?? false;
  const count = likeStatus?.likeCount ?? 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || isLoading) return;
    toggleLike(roadmapId);
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        cursor: isAuthenticated ? "pointer" : "default",
        px: compact ? 0.75 : 1,
        py: 0.5,
        borderRadius: 2,
        transition: "all 0.2s ease",
        "&:hover": isAuthenticated
          ? {
              bgcolor: alpha(palette.error.main, 0.08),
            }
          : {},
      }}
    >
      <motion.div
        animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: "flex" }}
      >
        <Heart
          size={compact ? 16 : 18}
          fill={liked ? palette.error.main : "none"}
          color={liked ? palette.error.main : palette.text.secondary}
          strokeWidth={2}
        />
      </motion.div>
      {count > 0 && (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: liked ? palette.error.main : palette.text.secondary,
            fontSize: compact ? "0.7rem" : "0.75rem",
            lineHeight: 1,
          }}
        >
          {count}
        </Typography>
      )}
    </Box>
  );
}
