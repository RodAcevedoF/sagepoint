'use client';

import {
	Box,
	Typography,
	Link,
	Chip,
	CircularProgress,
	useTheme,
} from '@mui/material';
import {
	ExternalLink,
	Video,
	BookOpen,
	FileText,
	GraduationCap,
	Wrench,
	Book,
} from 'lucide-react';
import type { ResourceType } from '@sagepoint/domain';
import type { ResourceDto } from '@/infrastructure/api/roadmapApi';
import { makeStyles } from './StepResources.styles';

interface StepResourcesProps {
	resources: ResourceDto[];
	isLoading?: boolean;
}

export function StepResources({ resources, isLoading }: StepResourcesProps) {
	const theme = useTheme();
	const styles = makeStyles(theme);

	const RESOURCE_TYPE_CONFIG: Record<
		ResourceType,
		{ icon: typeof Video; color: string }
	> = {
		VIDEO: { icon: Video, color: theme.palette.error.light },
		ARTICLE: { icon: FileText, color: theme.palette.info.light },
		COURSE: { icon: GraduationCap, color: theme.palette.success.light },
		DOCUMENTATION: { icon: BookOpen, color: theme.palette.warning.light },
		TUTORIAL: { icon: Wrench, color: theme.palette.primary.light },
		BOOK: { icon: Book, color: theme.palette.secondary.light },
	};

	if (isLoading) {
		return (
			<Box sx={styles.loadingContainer}>
				<CircularProgress size={20} />
			</Box>
		);
	}

	if (resources.length === 0) {
		return (
			<Typography variant='body2' sx={styles.emptyText}>
				No resources available for this step.
			</Typography>
		);
	}

	return (
		<Box>
			<Typography variant='caption' sx={styles.sectionTitle}>
				Learning Resources
			</Typography>
			<Box sx={styles.resourcesList}>
				{resources.map((resource) => {
					const config = RESOURCE_TYPE_CONFIG[resource.type];
					const Icon = config.icon;
					return (
						<Link
							key={resource.id}
							href={resource.url}
							target='_blank'
							rel='noopener noreferrer'
							underline='none'
							sx={styles.resourceLink}>
							<Box sx={styles.iconContainer(config.color)}>
								<Icon size={16} />
							</Box>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Typography variant='body2' sx={styles.resourceTitle}>
										{resource.title}
									</Typography>
									<ExternalLink
										size={12}
										color={theme.palette.text.secondary}
									/>
								</Box>
								{resource.description && (
									<Typography variant='caption' sx={styles.description}>
										{resource.description}
									</Typography>
								)}
								<Box sx={styles.chipRow}>
									{resource.provider && (
										<Chip
											size='small'
											label={resource.provider}
											sx={styles.providerChip}
										/>
									)}
									{resource.difficulty && (
										<Chip
											size='small'
											label={resource.difficulty}
											sx={styles.difficultyChip(config.color)}
										/>
									)}
								</Box>
							</Box>
						</Link>
					);
				})}
			</Box>
		</Box>
	);
}
