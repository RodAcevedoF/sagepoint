'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, TextField, Typography, alpha } from '@mui/material';
import {
	Sparkles,
	Search,
	Brain,
	GitBranch,
	BookOpen,
	CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components';
import { ButtonTypes, ButtonIconPositions, ButtonSizes } from '@/common/types';
import { palette } from '@/common/theme';
import { useGenerateTopicRoadmapCommand } from '@/application/roadmap';
import {
	GenerationStage,
	type GenerationStageData,
	type StageState,
} from './GenerationStage';

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

const STAGE_INTERVAL_MS = 4500;
const DONE_DELAY_MS = 1500;
const PAUSE_AT_STAGE = 3; // 0-indexed: pause at "Discovering resources..."

function getStageState(stageIndex: number, activeStage: number): StageState {
	if (stageIndex < activeStage) return 'completed';
	if (stageIndex === activeStage) return 'active';
	return 'pending';
}

export function GenerationView() {
	const router = useRouter();
	const [topic, setTopic] = useState('');
	const [title, setTitle] = useState('');
	const [phase, setPhase] = useState<'input' | 'generating'>('input');
	const [activeStage, setActiveStage] = useState(0);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { execute, isLoading, error } = useGenerateTopicRoadmapCommand();
	const apiCompleteRef = useRef<string | null>(null);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const clearTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	// Stage auto-advance timer
	useEffect(() => {
		if (phase !== 'generating') return;

		timerRef.current = setInterval(() => {
			setActiveStage((prev) => {
				// Don't advance past PAUSE_AT_STAGE unless API is done
				if (prev >= PAUSE_AT_STAGE && !apiCompleteRef.current) return prev;
				// Don't advance past the final stage
				if (prev >= GENERATION_STAGES.length - 1) return prev;
				return prev + 1;
			});
		}, STAGE_INTERVAL_MS);

		return clearTimer;
	}, [phase, clearTimer]);

	// When API completes, jump to final stage then redirect
	useEffect(() => {
		if (!apiCompleteRef.current || phase !== 'generating') return;

		const roadmapId = apiCompleteRef.current;
		clearTimer();

		const timeout = setTimeout(() => {
			router.push(`/roadmaps/${roadmapId}`);
		}, DONE_DELAY_MS);

		return () => clearTimeout(timeout);
	}, [activeStage, phase, clearTimer, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!topic.trim()) return;

		setErrorMessage(null);
		setPhase('generating');
		setActiveStage(0);
		apiCompleteRef.current = null;

		try {
			const roadmap = await execute(topic.trim(), title.trim() || undefined);
			apiCompleteRef.current = roadmap.id;
			// Jump to final stage — triggers the redirect effect
			setActiveStage(GENERATION_STAGES.length - 1);
		} catch {
			clearTimer();
			setPhase('input');
			setErrorMessage(
				'Something went wrong generating your roadmap. Please try again.',
			);
		}
	};

	return (
		<AnimatePresence mode='wait'>
			{phase === 'input' ?
				<MotionBox
					key='input'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.4 }}>
					<Box
						component='form'
						onSubmit={handleSubmit}
						sx={{
							position: 'relative',
							overflow: 'hidden',
							p: { xs: 4, md: 5 },
							borderRadius: 6,
							background: alpha(palette.background.paper, 0.4),
							backdropFilter: 'blur(12px)',
							border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
						}}>
						{/* Floating icon */}
						<Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
							<Box
								sx={{
									width: 64,
									height: 64,
									borderRadius: 4,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									bgcolor: alpha(palette.primary.main, 0.12),
									color: palette.primary.light,
								}}>
								<Sparkles size={28} />
							</Box>
						</Box>

						<Typography
							variant='h5'
							sx={{
								fontWeight: 700,
								textAlign: 'center',
								mb: 1,
								background: `linear-gradient(135deg, ${palette.primary.light}, ${palette.accent})`,
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
							}}>
							Create a Learning Roadmap
						</Typography>

						<Typography
							variant='body2'
							sx={{
								color: palette.text.secondary,
								textAlign: 'center',
								mb: 4,
							}}>
							Tell us what you want to learn and AI will build a personalized
							path.
						</Typography>

						<TextField
							autoFocus
							fullWidth
							label='What do you want to learn?'
							placeholder='e.g. React, Machine Learning, Docker...'
							value={topic}
							onChange={(e) => setTopic(e.target.value)}
							disabled={isLoading}
							sx={{ mb: 2 }}
						/>

						<TextField
							fullWidth
							label='Roadmap name (optional)'
							placeholder='Auto-generated from topic if left blank'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							disabled={isLoading}
							sx={{ mb: 3 }}
						/>

						{(errorMessage || error) && (
							<Typography
								variant='body2'
								sx={{ color: palette.error.light, mb: 2, textAlign: 'center' }}>
								{errorMessage || 'Something went wrong. Please try again.'}
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
					<Box
						sx={{
							p: { xs: 4, md: 5 },
							borderRadius: 6,
							background: alpha(palette.background.paper, 0.4),
							backdropFilter: 'blur(12px)',
							border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
						}}>
						<Typography
							variant='h5'
							sx={{
								fontWeight: 700,
								mb: 1,
								background: `linear-gradient(135deg, ${palette.primary.light}, ${palette.accent})`,
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
							}}>
							Generating your roadmap
						</Typography>
						<Typography
							variant='body2'
							sx={{ color: palette.text.secondary, mb: 4 }}>
							Creating a personalized learning path for <strong>{topic}</strong>
						</Typography>

						<Box sx={{ pl: 1 }}>
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
