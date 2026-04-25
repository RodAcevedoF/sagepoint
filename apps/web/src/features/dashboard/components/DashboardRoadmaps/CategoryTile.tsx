import { Box, Typography, Stack, alpha, LinearProgress } from "@mui/material";
import { palette } from "@/shared/theme";
import { pickRoadmapColor, renderCategoryIcon } from "./categoryIcon";

const styles = {
  tile: (accent: string) => ({
    position: "relative" as const,
    p: 1.75,
    borderRadius: 6,
    overflow: "hidden" as const,
    bgcolor: alpha(accent, 0.035),
    background: `radial-gradient(circle at 0% 0%, ${alpha(accent, 0.14)} 0%, ${alpha(accent, 0.04)} 42%, transparent 78%), linear-gradient(180deg, ${alpha(accent, 0.06)} 0%, ${alpha(accent, 0.02)} 100%)`,
    border: `1px solid ${alpha(accent, 0.12)}`,
    transition: "transform .2s, border-color .2s, background .2s",
    "&:hover": {
      transform: "translateY(-1px)",
      borderColor: alpha(accent, 0.18),
      background: `radial-gradient(circle at 0% 0%, ${alpha(accent, 0.18)} 0%, ${alpha(accent, 0.06)} 44%, transparent 80%), linear-gradient(180deg, ${alpha(accent, 0.075)} 0%, ${alpha(accent, 0.025)} 100%)`,
    },
  }),
  row: {
    mb: 1,
  },
  iconBox: (colorMain: string) => ({
    width: 36,
    height: 36,
    borderRadius: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(colorMain, 0.12),
    color: colorMain,
    border: `1px solid ${alpha(colorMain, 0.2)}`,
    boxShadow: `0 0 0 1px ${alpha(palette.background.paper, 0.08)}`,
    flexShrink: 0,
  }),
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: palette.text.primary,
    lineHeight: 1.2,
  },
  subtitle: {
    color: palette.text.secondary,
    fontWeight: 500,
  },
  percentage: (colorMain: string) => ({
    color: colorMain,
    fontSize: "0.95rem",
  }),
  progress: (colorMain: string, colorLight: string) => ({
    height: 5,
    borderRadius: 3,
    bgcolor: alpha(colorMain, 0.08),
    "& .MuiLinearProgress-bar": {
      borderRadius: 3,
      background: `linear-gradient(90deg, ${colorMain}, ${alpha(colorLight, 0.85)})`,
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
  const color = pickRoadmapColor(index);
  const accent = palette.success.main;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <Box sx={styles.tile(accent)}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={styles.row}>
        <Box sx={styles.iconBox(color.main)}>{renderCategoryIcon(index)}</Box>

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
          sx={styles.percentage(color.main)}
        >
          {pct}%
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={styles.progress(color.main, color.light)}
      />
    </Box>
  );
}
