import { Box, Stack, Typography } from "@mui/material";
import { STATS, type StatKey } from "./constants";
import { styles } from "./styles";

interface HeatmapStatsProps {
  values: Record<StatKey, number>;
}

export function HeatmapStats({ values }: HeatmapStatsProps) {
  return (
    <Stack
      direction="row"
      spacing={{ xs: 1.5, md: 3 }}
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
    >
      {STATS.map(({ key, icon: Icon, label, color }) => (
        <Box key={key} sx={styles.statBlock}>
          <Box sx={styles.statIconWrap(color)}>
            <Icon size={18} strokeWidth={2.2} />
          </Box>
          <Box>
            <Typography sx={styles.statValue}>{values[key]}</Typography>
            <Typography sx={styles.statLabel}>{label}</Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
