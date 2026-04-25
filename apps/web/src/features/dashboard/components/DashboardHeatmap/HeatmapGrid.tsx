import { forwardRef } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { motion } from "framer-motion";
import type { ActivityDayDto } from "@/infrastructure/api/roadmapApi";
import { DAY_LABELS, SHOW_DAY, OUT_OF_RANGE } from "./constants";
import { buildGridSx, styles } from "./styles";
import { bucketColor, formatTooltip } from "./utils";

interface HeatmapGridProps {
  grid: (ActivityDayDto | null)[][];
  cols: number;
  monthLabels: (string | null)[];
}

interface CellProps {
  cell: ActivityDayDto | null;
  rowIdx: number;
  colIdx: number;
}

function HeatmapCell({ cell, rowIdx, colIdx }: CellProps) {
  const gridPos = { gridColumn: colIdx + 2, gridRow: rowIdx + 2 };
  if (!cell) {
    return (
      <Box sx={{ ...styles.cellBase, ...gridPos, background: OUT_OF_RANGE }} />
    );
  }
  return (
    <Tooltip title={formatTooltip(cell)} placement="top" arrow>
      <Box
        component={motion.div}
        whileHover={{ scale: 1.4 }}
        sx={{
          ...styles.cellBase,
          ...gridPos,
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
      <Box ref={ref} sx={styles.scrollContainer}>
        <Box sx={buildGridSx(cols)}>
          <Box sx={{ gridColumn: 1, gridRow: 1, ...styles.stickyLabel }} />

          {monthLabels.map((label, colIdx) => (
            <Box
              key={`m-${colIdx}`}
              sx={{
                ...styles.monthLabelCell,
                gridColumn: colIdx + 2,
                gridRow: 1,
              }}
            >
              {label && <Typography sx={styles.monthLabel}>{label}</Typography>}
            </Box>
          ))}

          {DAY_LABELS.map((label, rowIdx) => (
            <Box
              key={`d-${rowIdx}`}
              sx={{
                ...styles.dayLabelCell,
                ...styles.stickyLabel,
                gridColumn: 1,
                gridRow: rowIdx + 2,
              }}
            >
              {SHOW_DAY.has(rowIdx) && (
                <Typography sx={styles.dayLabel}>{label}</Typography>
              )}
            </Box>
          ))}

          {grid.map((row, rowIdx) =>
            Array.from({ length: cols }).map((_, colIdx) => (
              <HeatmapCell
                key={`c-${rowIdx}-${colIdx}`}
                cell={row[colIdx]}
                rowIdx={rowIdx}
                colIdx={colIdx}
              />
            )),
          )}
        </Box>
      </Box>
    );
  },
);
