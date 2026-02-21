'use client';

import { Chip } from '@mui/material';
import type { ProcessingStage } from '@sagepoint/domain';

const stageConfig: Record<ProcessingStage, { label: string; color: 'default' | 'info' | 'warning' | 'success' }> = {
	UPLOADED: { label: 'Uploaded', color: 'default' },
	PARSING: { label: 'Parsing', color: 'info' },
	ANALYZING: { label: 'Analyzing', color: 'warning' },
	READY: { label: 'Ready', color: 'success' },
};

interface ProcessingStatusBadgeProps {
	stage: ProcessingStage;
}

export function ProcessingStatusBadge({ stage }: ProcessingStatusBadgeProps) {
	const config = stageConfig[stage] ?? { label: stage, color: 'default' as const };

	return (
		<Chip
			label={config.label}
			color={config.color}
			size='small'
			variant='outlined'
		/>
	);
}
