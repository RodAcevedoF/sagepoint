"use client";

import { lazy, Suspense } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { Plus, FileUp, Compass, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useModal, Loader } from "@/shared/components";
import { toneColor, type AuroraTone } from "@/shared/components";
import { aurora, auroraTint } from "@/shared/theme";
import { CreateRoadmapModal } from "@/features/roadmap";

const LazyUploadDocumentModal = lazy(() =>
  import("@/features/document/components/UploadDocumentModal").then((m) => ({
    default: m.UploadDocumentModal,
  })),
);

interface QuickAction {
  title: string;
  desc: string;
  icon: LucideIcon;
  tone: AuroraTone;
  onClick: () => void;
}

const secHeadSx = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "22px",
} as const;

const secBarSx = {
  width: "6px",
  height: "36px",
  borderRadius: "999px",
  background: `linear-gradient(180deg, ${aurora.teal}, ${aurora.status.concept})`,
  flex: "none",
} as const;

const secTitleSx = {
  fontFamily: aurora.font.display,
  fontWeight: 800,
  fontSize: "26px",
  letterSpacing: "-0.025em",
  margin: 0,
  background: `linear-gradient(115deg, ${aurora.txHi} 40%, ${aurora.teal} 110%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
} as const;

const secSubSx = {
  margin: "4px 0 0",
  fontSize: "14.5px",
  color: aurora.txMid,
} as const;

const gridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
  gap: "20px",
} as const;

const cardSx = (color: string) =>
  ({
    position: "relative",
    overflow: "hidden",
    borderRadius: aurora.radii.card,
    border: `1px solid ${aurora.line}`,
    padding: { xs: "22px 22px 24px", md: "26px 26px 28px" },
    cursor: "pointer",
    background:
      "linear-gradient(168deg, oklch(0.225 0.026 262 / 0.85), oklch(0.16 0.026 262 / 0.78))",
    boxShadow: aurora.shadow.card,
    transition: "transform .2s, border-color .2s, box-shadow .2s",
    display: "flex",
    flexDirection: "column",
    minHeight: 196,
    "& .qa-aura": {
      position: "absolute",
      top: "-40%",
      left: "-10%",
      width: "55%",
      height: "80%",
      background: `radial-gradient(closest-side, ${auroraTint(color, 0.26)}, transparent)`,
      filter: "blur(22px)",
      opacity: 0,
      transition: "opacity .25s",
      pointerEvents: "none",
    },
    "&:hover": {
      transform: "translateY(-5px)",
      borderColor: auroraTint(color, 0.42),
      boxShadow: aurora.shadow.pop,
    },
    "&:hover .qa-aura": { opacity: 0.6 },
  }) as const;

const iconSx = (color: string) =>
  ({
    width: 56,
    height: 56,
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: `color-mix(in oklch, ${color} 16%, ${aurora.surface2})`,
    border: `1px solid ${auroraTint(color, 0.28)}`,
    color,
    boxShadow: `0 0 26px -8px ${auroraTint(color, 0.7)}`,
    position: "relative",
    zIndex: 1,
  }) as const;

const arrowSx = (color: string) =>
  ({
    color,
    opacity: 0.7,
    position: "relative",
    zIndex: 1,
  }) as const;

const titleH3Sx = {
  position: "relative",
  zIndex: 1,
  fontFamily: aurora.font.display,
  fontWeight: 700,
  fontSize: "20px",
  color: aurora.txHi,
  margin: "22px 0 0",
  letterSpacing: "-0.015em",
} as const;

const descPSx = {
  position: "relative",
  zIndex: 1,
  margin: "10px 0 0",
  fontSize: "14px",
  lineHeight: 1.55,
  color: aurora.txMid,
} as const;

export function DashboardQuickActions() {
  const router = useRouter();
  const { openModal } = useModal();

  const handleCreate = () => {
    openModal(<CreateRoadmapModal />, {
      title: "Create Roadmap",
      showCloseButton: true,
      maxWidth: "sm",
    });
  };

  const handleUpload = () => {
    openModal(
      <Suspense fallback={<Loader />}>
        <LazyUploadDocumentModal />
      </Suspense>,
      {
        title: "Upload Document",
        showCloseButton: true,
        maxWidth: "sm",
      },
    );
  };

  const actions: ReadonlyArray<QuickAction> = [
    {
      title: "Create Roadmap",
      desc: "Generate a personalized learning path from any topic using AI.",
      icon: Plus,
      tone: "teal",
      onClick: handleCreate,
    },
    {
      title: "Analyze Document",
      desc: "Upload files to extract concepts and generate targeted roadmaps.",
      icon: FileUp,
      tone: "concept",
      onClick: handleUpload,
    },
    {
      title: "Explore",
      desc: "Discover curated topics and trending paths from the community.",
      icon: Compass,
      tone: "proc",
      onClick: () => router.push("/explore"),
    },
  ];

  return (
    <Box component="section">
      <Box sx={secHeadSx}>
        <Box sx={secBarSx} />
        <Box>
          <Box component="h2" sx={secTitleSx}>
            Quick Actions
          </Box>
          <Box component="p" sx={secSubSx}>
            Jump back in or start something new with AI.
          </Box>
        </Box>
      </Box>
      <Box sx={gridSx}>
        {actions.map((action) => {
          const Icon = action.icon;
          const color = toneColor(action.tone);
          return (
            <Box
              key={action.title}
              component="article"
              onClick={action.onClick}
              sx={cardSx(color)}
            >
              <Box className="qa-aura" />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={iconSx(color)}>
                  <Icon size={24} />
                </Box>
                <Box sx={arrowSx(color)}>
                  <ArrowUpRight size={20} />
                </Box>
              </Box>
              <Box component="h3" sx={titleH3Sx}>
                {action.title}
              </Box>
              <Box component="p" sx={descPSx}>
                {action.desc}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
