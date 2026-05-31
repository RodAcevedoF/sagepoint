import { forwardRef } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { motion } from "framer-motion";
import type { ActivityDayDto } from "@/infrastructure/api/roadmapApi";
import { DAY_LABELS, SHOW_DAY, OUT_OF_RANGE } from "./constants";
import { heatmapRow, styles } from "./styles";
import { bucketColor, formatTooltip } from "./utils";

interface HeatmapGridProps {
  grid: (ActivityDayDto | null)[][];
  cols: number;
  monthLabels: (string | null)[];
}

function HeatmapCell({ cell }: { cell: ActivityDayDto | null }) {
  if (!cell) {
    return <Box sx={{ ...styles.cellBase, background: OUT_OF_RANGE }} />;
  }
  return (
    <Tooltip title={formatTooltip(cell)} placement="top" arrow>
      <Box
        component={motion.div}
        whileHover={{ scale: 1.4 }}
        sx={{
          ...styles.cellBase,
          background: bucketColor(cell.count),
          cursor: "default",
        }}
      />
    </Tooltip>
  );
}

export const HeatmapGrid = forwardRef<HTMLDivElement, HeatmapGridProps>(
  function HeatmapGrid({ grid, cols, monthLabels }, ref) {
    return (
      <Box sx={heatmapRow(cols)}>
        <Box sx={styles.dayLabelsCol}>
          {DAY_LABELS.map((label, rowIdx) => (
            <Box key={`d-${rowIdx}`} sx={styles.dayLabelCell}>
              {SHOW_DAY.has(rowIdx) ? label : ""}
            </Box>
          ))}
        </Box>

        <Box ref={ref} sx={styles.scrollWrap}>
          <Box sx={styles.scrollInner}>
            <Box sx={styles.monthsRow(cols)}>
              {monthLabels.map((label, colIdx) => (
                <Box key={`m-${colIdx}`}>
                  {label && (
                    <Typography component="span" sx={styles.monthLabel}>
                      {label}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
            <Box sx={styles.cellsGrid(cols)}>
              {Array.from({ length: cols }).map((_, colIdx) =>
                grid.map((row, rowIdx) => (
                  <HeatmapCell
                    key={`c-${rowIdx}-${colIdx}`}
                    cell={row[colIdx]}
                  />
                )),
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
);
