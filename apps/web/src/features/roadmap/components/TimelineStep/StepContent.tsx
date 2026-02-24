import { Box, Typography, useTheme, alpha, CircularProgress } from '@mui/material';
import { Target, Lightbulb, GitBranch } from 'lucide-react';
import type { RoadmapStep } from '@sagepoint/domain';
import type { ResourceDto } from '@/infrastructure/api/roadmapApi';
import { StepResources } from '../StepResources';
import { makeStyles } from './TimelineStep.styles';

interface StepContentProps {
	step: RoadmapStep;
	resources: ResourceDto[];
	resourcesLoading?: boolean;
	statusColor: string;
	onExpand?: () => void;
	expandLoading?: boolean;
}

export function StepContent({
	step,
	resources,
	resourcesLoading,
	statusColor,
	onExpand,
	expandLoading,
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

			{onExpand && (
				<Box
					onClick={expandLoading ? undefined : onExpand}
					sx={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 1,
						mt: 1,
						px: 2,
						py: 0.75,
						borderRadius: 2,
						border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
						color: theme.palette.secondary.light,
						cursor: expandLoading ? 'default' : 'pointer',
						opacity: expandLoading ? 0.6 : 1,
						transition: 'all 0.2s ease',
						'&:hover': expandLoading ? {} : {
							borderColor: theme.palette.secondary.main,
							bgcolor: alpha(theme.palette.secondary.main, 0.08),
						},
					}}>
					{expandLoading ? (
						<CircularProgress size={14} sx={{ color: 'inherit' }} />
					) : (
						<GitBranch size={14} />
					)}
					<Typography variant='caption' sx={{ fontWeight: 600 }}>
						{expandLoading ? 'Expanding...' : 'Expand Sub-concepts'}
					</Typography>
				</Box>
			)}
		</Box>
	);
}
