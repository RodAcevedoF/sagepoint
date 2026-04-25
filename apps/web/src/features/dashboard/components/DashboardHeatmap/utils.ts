import type { ActivityDayDto } from "@/infrastructure/api/roadmapApi";
import { BUCKETS } from "./constants";

export interface BuiltGrid {
  grid: (ActivityDayDto | null)[][];
  cols: number;
  startOffset: number;
}

export function bucketColor(count: number): string {
  if (count === 0) return BUCKETS[0];
  if (count === 1) return BUCKETS[1];
  if (count <= 3) return BUCKETS[2];
  if (count <= 6) return BUCKETS[3];
  if (count <= 10) return BUCKETS[4];
  return BUCKETS[5];
}

export function buildGrid(days: ActivityDayDto[]): BuiltGrid {
  if (days.length === 0) {
    return {
      grid: Array.from({ length: 7 }, () => []),
      cols: 0,
      startOffset: 0,
    };
  }
  const firstDate = new Date(days[0].date + "T00:00:00");
  const lastDate = new Date(days[days.length - 1].date + "T00:00:00");
  const startOffset = firstDate.getDay();
  const endOffset = 6 - lastDate.getDay();

  const cells: (ActivityDayDto | null)[] = [
    ...Array(startOffset).fill(null),
    ...days,
    ...Array(endOffset).fill(null),
  ];

  const grid: (ActivityDayDto | null)[][] = Array.from({ length: 7 }, () => []);
  cells.forEach((cell, i) => grid[i % 7].push(cell));

  return { grid, cols: cells.length / 7, startOffset };
}

export function getMonthLabels(
  days: ActivityDayDto[],
  startOffset: number,
  cols: number,
): (string | null)[] {
  if (!days[0]) return Array(cols).fill(null);
  const firstDate = new Date(days[0].date + "T00:00:00");
  const firstSunday = new Date(firstDate);
  firstSunday.setDate(firstDate.getDate() - startOffset);

  const labels: (string | null)[] = [];
  let prevMonth = -1;
  for (let col = 0; col < cols; col++) {
    const d = new Date(firstSunday);
    d.setDate(firstSunday.getDate() + col * 7);
    const month = d.getMonth();
    labels.push(
      month !== prevMonth
        ? d.toLocaleString("default", { month: "short" })
        : null,
    );
    prevMonth = month;
  }
  return labels;
}

export function formatTooltip(cell: ActivityDayDto): string {
  const d = new Date(cell.date + "T00:00:00");
  const label = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  if (cell.count === 0) return `No activity · ${label}`;
  return `${cell.count} step${cell.count !== 1 ? "s" : ""} · ${label}`;
}
