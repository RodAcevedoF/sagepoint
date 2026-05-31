import { Box, Typography, Stack } from "@mui/material";
import { Layers } from "lucide-react";
import { aurora, auroraTint } from "@/shared/theme";
import { CategoryTile } from "./CategoryTile";
import type { CategoryCount } from "../../utils/dashboard.utils";

const accent = aurora.status.concept;

const styles = {
  panel: {
    flex: { md: 1 },
    minWidth: { md: 300 },
    p: 2.25,
    borderRadius: aurora.radii.card,
    border: `1px solid ${aurora.line}`,
    background:
      "linear-gradient(180deg, oklch(0.245 0.026 262 / 0.6) 0%, oklch(0.2 0.026 262 / 0.45) 100%)",
  },
  header: { mb: 2 },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: aurora.radii.sm,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `color-mix(in oklch, ${accent} 14%, ${aurora.surface2})`,
    color: accent,
    border: `1px solid ${auroraTint(accent, 0.22)}`,
  },
  title: {
    color: aurora.txMid,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    fontFamily: aurora.font.mono,
    fontSize: "0.7rem",
    fontWeight: 700,
  },
  countBadge: {
    px: 1,
    py: 0.25,
    borderRadius: aurora.radii.pill,
    background: auroraTint(accent, 0.1),
    color: accent,
    fontFamily: aurora.font.mono,
    fontWeight: 700,
    fontSize: "0.65rem",
  },
  emptyState: {
    p: 2,
    borderRadius: aurora.radii.md,
    background: "oklch(0.255 0.024 262 / 0.4)",
    border: `1px dashed ${aurora.line2}`,
    textAlign: "center",
  },
  emptyLabel: {
    color: aurora.txMid,
  },
};

interface CategoriesPanelProps {
  categories: CategoryCount[];
}

export function CategoriesPanel({ categories }: CategoriesPanelProps) {
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <Box sx={styles.panel}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={styles.header}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={styles.headerIcon}>
            <Layers size={15} strokeWidth={2.4} />
          </Box>
          <Typography variant="subtitle2" sx={styles.title}>
            Topics
          </Typography>
        </Stack>
        {total > 0 && (
          <Typography variant="caption" sx={styles.countBadge}>
            {categories.length} {categories.length === 1 ? "topic" : "topics"}
          </Typography>
        )}
      </Stack>

      {categories.length === 0 ? (
        <Box sx={styles.emptyState}>
          <Layers
            size={20}
            color={aurora.txLow}
            strokeWidth={1.8}
            style={{ opacity: 0.6, marginBottom: 4 }}
          />
          <Typography variant="caption" sx={styles.emptyLabel} display="block">
            No categories yet
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {categories.slice(0, 3).map(({ name, count }, i) => (
            <CategoryTile
              key={name}
              name={name}
              count={count}
              total={total}
              index={i}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
