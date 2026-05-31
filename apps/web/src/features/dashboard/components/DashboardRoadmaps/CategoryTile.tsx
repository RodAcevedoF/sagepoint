import { Box, Typography, Stack, LinearProgress } from "@mui/material";
import { aurora, auroraTint } from "@/shared/theme";
import { pickRoadmapColor, renderCategoryIcon } from "./categoryIcon";

const styles = {
  tile: {
    position: "relative" as const,
    p: 1.75,
    borderRadius: aurora.radii.md,
    overflow: "hidden" as const,
    background: "oklch(0.255 0.024 262 / 0.5)",
    border: `1px solid ${aurora.line}`,
    transition: "transform .2s, border-color .2s, background .2s",
    "&:hover": {
      transform: "translateY(-1px)",
      borderColor: aurora.line2,
      background: "oklch(0.27 0.024 262 / 0.6)",
    },
  },
  row: {
    mb: 1,
  },
  iconBox: (color: string) => ({
    width: 36,
    height: 36,
    borderRadius: aurora.radii.sm,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `color-mix(in oklch, ${color} 15%, ${aurora.surface2})`,
    color,
    border: `1px solid ${auroraTint(color, 0.26)}`,
    flexShrink: 0,
  }),
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: aurora.txHi,
    lineHeight: 1.2,
  },
  subtitle: {
    color: aurora.txMid,
    fontWeight: 500,
  },
  percentage: (color: string) => ({
    color,
    fontFamily: aurora.font.mono,
    fontSize: "0.95rem",
  }),
  progress: (color: string) => ({
    height: 5,
    borderRadius: 3,
    bgcolor: auroraTint(color, 0.12),
    "& .MuiLinearProgress-bar": {
      borderRadius: 3,
      background: `linear-gradient(90deg, ${color}, ${auroraTint(color, 0.7)})`,
    },
  }),
};

interface CategoryTileProps {
  name: string;
  count: number;
  total: number;
  index: number;
}

export function CategoryTile({ name, count, total, index }: CategoryTileProps) {
  const color = pickRoadmapColor(index).main;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <Box sx={styles.tile}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={styles.row}>
        <Box sx={styles.iconBox(color)}>{renderCategoryIcon(index)}</Box>

        <Box sx={styles.content}>
          <Typography variant="body2" fontWeight={700} noWrap sx={styles.title}>
            {name}
          </Typography>
          <Typography variant="caption" sx={styles.subtitle}>
            {count} {count === 1 ? "roadmap" : "roadmaps"}
          </Typography>
        </Box>

        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={styles.percentage(color)}
        >
          {pct}%
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={styles.progress(color)}
      />
    </Box>
  );
}
