"use client";

import { Box } from "@mui/material";
import { BookOpen, Clock, Map, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Pill, ProgressRing } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { RoadmapTitleEditor } from "./RoadmapTitleEditor/RoadmapTitleEditor";
import { LikeButton } from "./LikeButton";
import { CategorySelector } from "./Category/CategorySelector";

const MotionBox = motion.create(Box);

function formatDuration(minutes?: number): string {
  if (!minutes) return "Flexible";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

interface RoadmapDetailHeroProps {
  roadmapId: string;
  title: string;
  description?: string;
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  estimatedDuration?: number;
  recommendedPace?: string;
  categoryId?: string | null;
  isOwner: boolean;
}

export function RoadmapDetailHero({
  roadmapId,
  title,
  description,
  totalSteps,
  completedSteps,
  progressPercentage,
  estimatedDuration,
  recommendedPace,
  categoryId,
  isOwner,
}: RoadmapDetailHeroProps) {
  const ringAccent =
    progressPercentage === 100
      ? auroraPalette.status.ready
      : auroraPalette.teal;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "24px",
        border: `1px solid ${auroraPalette.line}`,
        background:
          "linear-gradient(168deg, oklch(0.235 0.026 262 / 0.92), oklch(0.165 0.026 262 / 0.85))",
        boxShadow: auroraPalette.shadow.card,
        padding: { xs: "28px 22px 26px", md: "38px 40px 34px" },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "0 0 auto 0",
          height: "4px",
          background: `linear-gradient(90deg, ${auroraPalette.teal}, ${auroraPalette.status.concept} 70%, ${auroraPalette.status.enrich})`,
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "-30%",
          right: "-6%",
          width: "46%",
          height: "90%",
          background: `radial-gradient(closest-side, ${auroraTint(auroraPalette.teal, 0.22)}, transparent)`,
          filter: "blur(26px)",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "flex-start",
          gap: { xs: "20px", md: "28px" },
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              width: "fit-content",
              alignItems: "center",
              gap: "9px",
              whiteSpace: "nowrap",
              marginBottom: "16px",
              fontFamily: auroraPalette.font.mono,
              fontSize: "11.5px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: auroraPalette.txLow,
            }}
          >
            <Box
              component="span"
              sx={{
                width: "30px",
                height: "30px",
                borderRadius: "9px",
                display: "grid",
                placeItems: "center",
                background: `color-mix(in oklch, ${auroraPalette.teal} 14%, ${auroraPalette.surface2})`,
                border: `1px solid ${auroraTint(auroraPalette.teal, 0.24)}`,
                color: auroraPalette.teal,
              }}
            >
              <Map size={16} />
            </Box>
            Roadmap · {totalSteps} step{totalSteps === 1 ? "" : "s"}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <RoadmapTitleEditor
              roadmapId={roadmapId}
              title={title}
              editable={isOwner}
            />
            <LikeButton roadmapId={roadmapId} />
          </Box>

          {description && (
            <Box
              component="p"
              sx={{
                margin: "16px 0 0",
                maxWidth: "88ch",
                fontSize: "15.5px",
                lineHeight: 1.66,
                color: auroraPalette.txMid,
                textWrap: "pretty",
              }}
            >
              {description}
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "12px 22px",
              marginTop: "22px",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13.5px",
                color: auroraPalette.txMid,
                whiteSpace: "nowrap",
              }}
            >
              <BookOpen size={16} color={auroraPalette.txLow} />
              <Box
                component="b"
                sx={{
                  fontFamily: auroraPalette.font.mono,
                  color: auroraPalette.txHi,
                  fontWeight: 600,
                }}
              >
                {completedSteps}/{totalSteps}
              </Box>
              steps completed
            </Box>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13.5px",
                color: auroraPalette.txMid,
                whiteSpace: "nowrap",
              }}
            >
              <Clock size={16} color={auroraPalette.txLow} />
              Est.{" "}
              <Box
                component="b"
                sx={{
                  fontFamily: auroraPalette.font.mono,
                  color: auroraPalette.txHi,
                  fontWeight: 600,
                }}
              >
                {formatDuration(estimatedDuration)}
              </Box>
            </Box>
            {recommendedPace && (
              <Pill tone="concept" icon={<Zap size={13} />}>
                {recommendedPace}
              </Pill>
            )}
            <CategorySelector
              roadmapId={roadmapId}
              currentCategoryId={categoryId}
              editable={isOwner}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            position: "relative",
            zIndex: 1,
            alignItems: "flex-start",
          }}
        >
          <ProgressRing
            value={progressPercentage}
            size={96}
            stroke={6}
            accent={ringAccent}
            caption="complete"
          />
        </Box>
      </Box>
    </MotionBox>
  );
}
