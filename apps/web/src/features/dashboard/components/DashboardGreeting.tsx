'use client';

import { Box, Typography } from '@mui/material';
import { Sparkles } from 'lucide-react';
import { palette } from '@/common/theme';
import { SectionTitle } from '@/common/components';

// ============================================================================
// Styles
// ============================================================================

const styles = {
	subtitleRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 1.5,
		color: 'text.secondary',
		opacity: 0.8,
	},
};

// ============================================================================
// Helpers
// ============================================================================

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return 'Good morning';
	if (hour < 18) return 'Good afternoon';
	return 'Good evening';
}

// ============================================================================
// Component
// ============================================================================

interface DashboardGreetingProps {
	userName: string;
	stepsCompleted?: number;
}

export function DashboardGreeting({
	userName,
	stepsCompleted = 0,
}: DashboardGreetingProps) {
	const greeting = getGreeting();
	const firstName = userName.split(' ')[0];

	const subtitle = (
		<Box sx={styles.subtitleRow}>
			{stepsCompleted > 0 ?
				<>
					<Sparkles size={18} style={{ color: palette.primary.light }} />
					<Typography variant='body1'>
						You&apos;ve completed {stepsCompleted} steps so far. Keep it up!
					</Typography>
				</>
			:	<Typography variant='body1'>
					Ready to continue your learning journey?
				</Typography>
			}
		</Box>
	);

	return (
		<SectionTitle
			variant='h3'
			showBar={false}
			subtitle={subtitle}
			sx={{ mb: 6 }}>
			{greeting}, {firstName}!
		</SectionTitle>
	);
}
