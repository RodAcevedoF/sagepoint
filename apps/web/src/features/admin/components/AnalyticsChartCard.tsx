'use client';

import type { ReactNode } from 'react';
import { Box, Typography, alpha } from '@mui/material';
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
} from 'recharts';
import { Card } from '@/common/components';
import { palette } from '@/common/theme';

const CHART_HEIGHT = 220;

const tooltipStyle = {
	backgroundColor: palette.background.paper,
	border: `1px solid ${alpha(palette.divider, 0.2)}`,
	borderRadius: 8,
	color: palette.text.primary,
	fontSize: '0.85rem',
};

const tickStyle = {
	fill: palette.text.secondary,
	fontSize: '0.75rem',
};

const gridStroke = alpha(palette.divider, 0.15);

interface ChartDataPoint {
	label: string;
	count: number;
}

interface AnalyticsChartCardProps {
	icon: ReactNode;
	title: string;
	data: ChartDataPoint[];
	color: string;
	variant: 'area' | 'bar' | 'line';
	gradientId?: string;
	placeholder?: ReactNode;
}

function ChartContent({
	data,
	color,
	variant,
	gradientId,
}: Pick<AnalyticsChartCardProps, 'data' | 'color' | 'variant' | 'gradientId'>) {
	const commonAxisProps = {
		tick: tickStyle,
		axisLine: false as const,
		tickLine: false as const,
	};

	const sharedElements = (
		<>
			<CartesianGrid strokeDasharray='3 3' stroke={gridStroke} />
			<XAxis dataKey='label' {...commonAxisProps} />
			<YAxis {...commonAxisProps} allowDecimals={false} />
			<Tooltip contentStyle={tooltipStyle} />
		</>
	);

	if (variant === 'area') {
		const gId = gradientId ?? 'areaGrad';
		return (
			<AreaChart data={data}>
				<defs>
					<linearGradient id={gId} x1='0' y1='0' x2='0' y2='1'>
						<stop offset='5%' stopColor={color} stopOpacity={0.3} />
						<stop offset='95%' stopColor={color} stopOpacity={0} />
					</linearGradient>
				</defs>
				{sharedElements}
				<Area
					type='monotone'
					dataKey='count'
					stroke={color}
					fill={`url(#${gId})`}
					strokeWidth={2}
				/>
			</AreaChart>
		);
	}

	if (variant === 'bar') {
		return (
			<BarChart data={data}>
				{sharedElements}
				<Bar
					dataKey='count'
					fill={color}
					radius={[4, 4, 0, 0]}
					opacity={0.8}
				/>
			</BarChart>
		);
	}

	return (
		<LineChart data={data}>
			{sharedElements}
			<Line
				type='monotone'
				dataKey='count'
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
		<Card variant='glass' sx={{ p: 3, height: '100%' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
				{icon}
				<Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
					{title}
				</Typography>
			</Box>
			{placeholder ?? (
				<ResponsiveContainer width='100%' height={CHART_HEIGHT}>
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
