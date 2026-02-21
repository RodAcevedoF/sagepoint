'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Typography, useTheme, alpha } from '@mui/material';
import {
	Sparkles,
	Search,
	Brain,
	GitBranch,
	BookOpen,
	CheckCircle2,
	Sprout,
	Flame,
	Award,
	Rocket,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components';
import { ButtonTypes, ButtonIconPositions, ButtonSizes } from '@/common/types';
import { useGenerateTopicRoadmapCommand } from '@/application/roadmap';
import { useRoadmapEvents } from '@/common/hooks';
import type { RoadmapEventStage } from '@/common/hooks/useRoadmapEvents';
import {
	GenerationStage,
	type GenerationStageData,
	type StageState,
} from './GenerationStage';
import { makeStyles } from './GenerationView.styles';

const MotionBox = motion.create(Box);

const GENERATION_STAGES: GenerationStageData[] = [
	{
		label: 'Analyzing topic...',
		description: 'Understanding your learning goals',
		icon: Search,
	},
	{
		label: 'Generating concepts...',
		description: 'Identifying key topics to cover',
		icon: Brain,
	},
	{
		label: 'Building learning path...',
		description: 'Ordering concepts for optimal learning',
		icon: GitBranch,
	},
	{
		label: 'Discovering resources...',
		description: 'Finding the best learning materials',
		icon: BookOpen,
	},
	{ label: 'Done!', description: 'Your roadmap is ready', icon: CheckCircle2 },
];

const EXPERIENCE_LEVELS = [
	{
		id: 'beginner' as const,
		icon: Sprout,
		title: 'Beginner',
		description: 'Just starting out',
		color: '#4ade80',
	},
	{
		id: 'intermediate' as const,
		icon: Flame,
		title: 'Intermediate',
		description: 'Some experience',
		color: '#f59e0b',
	},
	{
		id: 'advanced' as const,
		icon: Award,
		title: 'Advanced',
		description: 'Solid foundation',
		color: '#3b82f6',
	},
	{
		id: 'expert' as const,
		icon: Rocket,
		title: 'Expert',
		description: 'Deep expertise',
		color: '#a855f7',
	},
];

type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]['id'];

const DONE_DELAY_MS = 1500;

/** Map SSE stage to UI stage index */
function stageToIndex(stage: RoadmapEventStage): number {
	switch (stage) {
		case 'concepts':
			return 1;
		case 'learning-path':
			return 2;
		case 'resources':
			return 3;
		case 'done':
			return 4;
		default:
			return 0;
	}
}

function getStageState(stageIndex: number, activeStage: number): StageState {
	if (stageIndex < activeStage) return 'completed';
	if (stageIndex === activeStage) return 'active';
	return 'pending';
}

export interface GenerationViewProps {
	initialTopic?: string;
	initialExperience?: string;
	fromOnboarding?: boolean;
}

export function GenerationView({
	initialTopic,
	initialExperience,
	fromOnboarding,
}: GenerationViewProps) {
	const theme = useTheme();
	const styles = makeStyles(theme);
	const router = useRouter();
	const [topic, setTopic] = useState(initialTopic || '');
	const [title, setTitle] = useState('');
	const [experienceLevel, setExperienceLevel] = useState<
		ExperienceLevel | undefined
	>(
		EXPERIENCE_LEVELS.some((l) => l.id === initialExperience) ?
			(initialExperience as ExperienceLevel)
		:	undefined,
	);
	const [phase, setPhase] = useState<'input' | 'generating'>('input');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [roadmapId, setRoadmapId] = useState<string | null>(null);

	const { execute, isLoading, error } = useGenerateTopicRoadmapCommand();
	const { status: sseStatus, stage: sseStage, errorMessage: sseError } =
		useRoadmapEvents(roadmapId);

	// Derive active stage from SSE (no setState in effects)
	const activeStage =
		phase === 'generating' && sseStage ? stageToIndex(sseStage) : 0;

	// Derive effective phase: SSE failure resets to input
	const effectivePhase =
		phase === 'generating' && sseStatus === 'failed' ? 'input' : phase;
	const displayError =
		sseStatus === 'failed'
			? sseError || 'Something went wrong generating your roadmap. Please try again.'
			: errorMessage;

	// Handle SSE completed → redirect (setTimeout is async, not synchronous setState)
	useEffect(() => {
		if (!roadmapId || sseStatus !== 'completed') return;

		const timeout = setTimeout(() => {
			router.push(`/roadmaps/${roadmapId}`);
		}, DONE_DELAY_MS);

		return () => clearTimeout(timeout);
	}, [sseStatus, roadmapId, router]);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!topic.trim()) return;

			setErrorMessage(null);
			setPhase('generating');
			setRoadmapId(null);

			try {
				// Mutation returns immediately with skeleton roadmap
				const roadmap = await execute(topic.trim(), title.trim() || undefined, {
					userContext: experienceLevel ? { experienceLevel } : undefined,
				});
				// Start SSE subscription
				setRoadmapId(roadmap.id);
			} catch {
				setPhase('input');
				setErrorMessage(
					'Something went wrong generating your roadmap. Please try again.',
				);
			}
		},
		[topic, title, experienceLevel, execute],
	);

	const headingTitle =
		fromOnboarding ?
			"Let's create your first roadmap!"
		:	'Create a Learning Roadmap';

	const headingSubtitle =
		fromOnboarding ?
			"We've pre-filled your goal. Adjust if needed and hit generate!"
		:	'Tell us what you want to learn and AI will build a personalized path.';

	return (
		<AnimatePresence mode='wait'>
			{effectivePhase === 'input' ?
				<MotionBox
					key='input'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.4 }}>
					<Box component='form' onSubmit={handleSubmit} sx={styles.inputCard}>
						{/* Floating icon */}
						<Box sx={styles.iconCenter}>
							<Box sx={styles.iconWrapper}>
								<Sparkles size={28} />
							</Box>
						</Box>

						<Typography variant='h5' sx={styles.title}>
							{headingTitle}
						</Typography>

						<Typography variant='body2' sx={styles.subtitle}>
							{headingSubtitle}
						</Typography>

						<TextField
							autoFocus
							fullWidth
							label='What do you want to learn?'
							placeholder='e.g. React, Machine Learning, Docker...'
							value={topic}
							onChange={(e) => setTopic(e.target.value)}
							disabled={isLoading}
							sx={styles.textField}
						/>

						<TextField
							fullWidth
							label='Roadmap name (optional)'
							placeholder='Auto-generated from topic if left blank'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							disabled={isLoading}
							sx={styles.nameField}
						/>

						{/* Experience level selector */}
						<Typography
							variant='body2'
							sx={{
								color: theme.palette.text.secondary,
								mb: 1.5,
								fontWeight: 500,
							}}>
							Your experience level (optional)
						</Typography>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: 'repeat(4, 1fr)',
								gap: 1.5,
								mb: 3,
							}}>
							{EXPERIENCE_LEVELS.map((level, index) => {
								const Icon = level.icon;
								const isSelected = experienceLevel === level.id;
								return (
									<motion.div
										key={level.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.1 + index * 0.05 }}>
										<Box
											onClick={() =>
												setExperienceLevel(isSelected ? undefined : level.id)
											}
											sx={{
												p: 1.5,
												borderRadius: 3,
												border: `1px solid ${alpha(
													isSelected ?
														level.color
													:	theme.palette.primary.light,
													isSelected ? 0.6 : 0.15,
												)}`,
												background:
													isSelected ? alpha(level.color, 0.1) : 'transparent',
												cursor: 'pointer',
												transition: 'all 0.2s ease',
												textAlign: 'center',
												'&:hover': {
													borderColor: level.color,
													background: alpha(level.color, 0.05),
													transform: 'translateY(-2px)',
												},
											}}>
											<Box
												sx={{
													width: 40,
													height: 40,
													borderRadius: 2,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													mx: 'auto',
													mb: 0.5,
													background: alpha(level.color, 0.15),
													color: level.color,
												}}>
												<Icon size={20} />
											</Box>
											<Typography
												variant='caption'
												sx={{
													fontWeight: 600,
													display: 'block',
												}}>
												{level.title}
											</Typography>
										</Box>
									</motion.div>
								);
							})}
						</Box>

						{(displayError || error) && (
							<Typography variant='body2' sx={styles.errorText}>
								{displayError || 'Something went wrong. Please try again.'}
							</Typography>
						)}

						<Button
							type={ButtonTypes.SUBMIT}
							label='Generate Roadmap'
							icon={Sparkles}
							iconPos={ButtonIconPositions.START}
							size={ButtonSizes.LARGE}
							disabled={!topic.trim() || isLoading}
							loading={isLoading}
							fullWidth
						/>
					</Box>
				</MotionBox>
			:	<MotionBox
					key='generating'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.4 }}>
					<Box sx={styles.generatingCard}>
						<Typography variant='h5' sx={styles.generatingTitle}>
							Generating your roadmap
						</Typography>
						<Typography variant='body2' sx={styles.generatingSubtitle}>
							Creating a personalized learning path for <strong>{topic}</strong>
						</Typography>

						<Box sx={styles.stagesWrapper}>
							{GENERATION_STAGES.map((stage, index) => (
								<GenerationStage
									key={stage.label}
									{...stage}
									state={getStageState(index, activeStage)}
									isLast={index === GENERATION_STAGES.length - 1}
								/>
							))}
						</Box>
					</Box>
				</MotionBox>
			}
		</AnimatePresence>
	);
}
