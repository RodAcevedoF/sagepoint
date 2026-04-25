import { Box, Typography, Stack, alpha } from "@mui/material";
import { Layers } from "lucide-react";
import { palette } from "@/shared/theme";
import { CategoryTile } from "./CategoryTile";
import type { CategoryCount } from "../../utils/dashboard.utils";

const styles = {
  panel: (accent: string) => ({
    flex: { md: 1 },
    minWidth: { md: 300 },
    p: 2.25,
    borderRadius: 6,
    bgcolor: alpha(accent, 0.045),
    border: `1px solid ${alpha(accent, 0.12)}`,
    background: `linear-gradient(180deg, ${alpha(accent, 0.08)} 0%, ${alpha(accent, 0.025)} 100%)`,
  }),
  header: {
    mb: 2,
  },
  headerIcon: (accent: string) => ({
    width: 28,
    height: 28,
    borderRadius: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(accent, 0.12),
    color: accent,
    border: `1px solid ${alpha(accent, 0.18)}`,
  }),
  title: (accent: string) => ({
    color: accent,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    fontSize: "0.72rem",
  }),
  countBadge: (accent: string) => ({
    px: 1,
    py: 0.25,
    borderRadius: "999px",
    bgcolor: alpha(accent, 0.1),
    color: accent,
    fontWeight: 700,
    fontSize: "0.65rem",
  }),
  emptyState: (accent: string) => ({
    p: 2,
    borderRadius: 6,
    bgcolor: alpha(accent, 0.03),
    border: `1px dashed ${alpha(accent, 0.14)}`,
    textAlign: "center",
  }),
};

interface CategoriesPanelProps {
  categories: CategoryCount[];
}

export function CategoriesPanel({ categories }: CategoriesPanelProps) {
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  const accent = palette.info.main;

  return (
    <Box sx={styles.panel(accent)}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={styles.header}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={styles.headerIcon(accent)}>
            <Layers size={15} strokeWidth={2.4} />
          </Box>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={styles.title(accent)}
          >
            Topics
          </Typography>
        </Stack>
        {total > 0 && (
          <Typography variant="caption" sx={styles.countBadge(accent)}>
            {categories.length} {categories.length === 1 ? "topic" : "topics"}
          </Typography>
        )}
      </Stack>

      {categories.length === 0 ? (
        <Box sx={styles.emptyState(accent)}>
          <Layers
            size={20}
            color={palette.text.secondary}
            strokeWidth={1.8}
            style={{ opacity: 0.5, marginBottom: 4 }}
          />
          <Typography variant="caption" color="text.secondary" display="block">
            No categories yet
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {categories.map(({ name, count }, i) => (
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
