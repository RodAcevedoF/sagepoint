import { Box, Typography } from "@mui/material";
import { BUCKETS } from "./constants";
import { styles } from "./styles";

interface HeatmapLegendProps {
  totalSteps: number;
}

export function HeatmapLegend({ totalSteps }: HeatmapLegendProps) {
  return (
    <Box sx={styles.footer}>
      {totalSteps === 0 ? (
        <Typography sx={styles.caption}>
          Complete a step to start lighting up your grid.
        </Typography>
      ) : (
        <Typography sx={styles.caption}>
          {totalSteps} step{totalSteps !== 1 ? "s" : ""} completed in the last
          year
        </Typography>
      )}
      <Box sx={styles.legendRow}>
        <Typography sx={styles.legendLabel}>Less</Typography>
        {BUCKETS.map((bg, i) => (
          <Box key={i} sx={{ ...styles.legendSwatch, background: bg }} />
        ))}
        <Typography sx={styles.legendLabel}>More</Typography>
      </Box>
    </Box>
  );
}
