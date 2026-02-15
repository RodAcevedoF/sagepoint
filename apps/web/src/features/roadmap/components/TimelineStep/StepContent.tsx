import { Box, Typography, useTheme } from '@mui/material';
import { Target, Lightbulb } from 'lucide-react';
import type { RoadmapStep } from '@sagepoint/domain';
import type { ResourceDto } from '@/infrastructure/api/roadmapApi';
import { StepResources } from '../StepResources';
import { makeStyles } from './TimelineStep.styles';

interface StepContentProps {
	step: RoadmapStep;
	resources: ResourceDto[];
	resourcesLoading?: boolean;
	statusColor: string;
}

export function StepContent({
	step,
	resources,
	resourcesLoading,
	statusColor,
}: StepContentProps) {
	const theme = useTheme();
	const styles = makeStyles(theme, statusColor);

	return (
		<Box sx={styles.expandedContent}>
			{step.learningObjective && (
				<Box sx={styles.infoBox(theme.palette.info.main)}>
					<Target
						size={16}
						color={theme.palette.info.light}
						style={{ marginTop: 2, flexShrink: 0 }}
					/>
					<Box>
						<Typography
							variant='caption'
							sx={styles.infoLabel(theme.palette.info.light)}>
							Learning Objective
						</Typography>
						<Typography
							variant='body2'
							sx={{ color: theme.palette.text.secondary }}>
							{step.learningObjective}
						</Typography>
					</Box>
				</Box>
			)}

			{step.rationale && (
				<Box sx={styles.infoBox(theme.palette.primary.main)}>
					<Lightbulb
						size={16}
						color={theme.palette.primary.light}
						style={{ marginTop: 2, flexShrink: 0 }}
					/>
					<Box>
						<Typography
							variant='caption'
							sx={styles.infoLabel(theme.palette.primary.light)}>
							Why this step?
						</Typography>
						<Typography
							variant='body2'
							sx={{ color: theme.palette.text.secondary }}>
							{step.rationale}
						</Typography>
					</Box>
				</Box>
			)}

			<StepResources resources={resources} isLoading={resourcesLoading} />
		</Box>
	);
}
