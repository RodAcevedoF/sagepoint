"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/shared/components";
import { aurora, auroraTint } from "@/shared/theme";

const CHART_HEIGHT = 220;

const tooltipStyle = {
  backgroundColor: aurora.surface,
  border: `1px solid ${aurora.line2}`,
  borderRadius: aurora.radii.md,
  color: aurora.txHi,
  fontFamily: aurora.font.ui,
  fontSize: "12.5px",
  padding: "8px 12px",
};

const tooltipItemStyle = {
  color: aurora.txHi,
  fontFamily: aurora.font.mono,
};

const tickStyle = {
  fill: aurora.txMid,
  fontSize: 11,
  fontFamily: aurora.font.mono,
};

interface ChartDataPoint {
  label: string;
  count: number;
}

interface AnalyticsChartCardProps {
  icon: ReactNode;
  title: string;
  data: ChartDataPoint[];
  color: string;
  variant: "area" | "bar" | "line";
  gradientId?: string;
  placeholder?: ReactNode;
}

const cardSx = {
  padding: "22px 24px 18px",
  height: "100%",
} as const;

const headSx = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "14px",
} as const;

const titleSx = {
  fontFamily: aurora.font.display,
  fontWeight: 700,
  fontSize: "16.5px",
  color: aurora.txHi,
  letterSpacing: "-0.01em",
} as const;

const iconDiscSx = {
  width: 36,
  height: 36,
  borderRadius: "11px",
  display: "grid",
  placeItems: "center",
  background: "color-mix(in oklch, var(--accent) 14%, transparent)",
  border: "1px solid color-mix(in oklch, var(--accent) 26%, transparent)",
  color: "var(--accent)",
} as const;

function ChartContent({
  data,
  color,
  variant,
  gradientId,
}: Pick<AnalyticsChartCardProps, "data" | "color" | "variant" | "gradientId">) {
  const sharedElements = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={aurora.line} />
      <XAxis
        dataKey="label"
        tick={tickStyle}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={tickStyle}
        axisLine={false}
        tickLine={false}
        allowDecimals={false}
      />
      <Tooltip
        contentStyle={tooltipStyle}
        itemStyle={tooltipItemStyle}
        labelStyle={{ color: aurora.txMid }}
        cursor={{ fill: auroraTint(color, 0.08) }}
      />
    </>
  );

  if (variant === "area") {
    const gId = gradientId ?? "areaGrad";
    return (
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {sharedElements}
        <Area
          type="monotone"
          dataKey="count"
          stroke={color}
          fill={`url(#${gId})`}
          strokeWidth={2}
        />
      </AreaChart>
    );
  }

  if (variant === "bar") {
    return (
      <BarChart data={data}>
        {sharedElements}
        <Bar
          dataKey="count"
          fill={color}
          radius={[6, 6, 0, 0]}
          opacity={0.85}
        />
      </BarChart>
    );
  }

  return (
    <LineChart data={data}>
      {sharedElements}
      <Line
        type="monotone"
        dataKey="count"
        stroke={color}
        strokeWidth={2}
        dot={{ fill: color, r: 3 }}
      />
    </LineChart>
  );
}

export function AnalyticsChartCard({
  icon,
  title,
  data,
  color,
  variant,
  gradientId,
  placeholder,
}: AnalyticsChartCardProps) {
  return (
    <Card
      variant="aurora"
      accent={color}
      hoverable={false}
      withAura={false}
      sx={cardSx}
    >
      <Box sx={headSx}>
        <Box sx={iconDiscSx}>{icon}</Box>
        <Box sx={titleSx}>{title}</Box>
      </Box>
      {placeholder ?? (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <ChartContent
            data={data}
            color={color}
            variant={variant}
            gradientId={gradientId}
          />
        </ResponsiveContainer>
      )}
    </Card>
  );
}
