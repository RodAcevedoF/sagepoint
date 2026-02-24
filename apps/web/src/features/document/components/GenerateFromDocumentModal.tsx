'use client';

import { useState } from 'react';
import {
	Box,
	TextField,
	Typography,
	CircularProgress,
	useTheme,
	alpha,
} from '@mui/material';
import { Sparkles, Sprout, Flame, Award, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, useModal, useSnackbar } from '@/common/components';
import { ButtonTypes, ButtonIconPositions } from '@/common/types';
import { useGenerateRoadmapCommand } from '@/application/roadmap';

const EXPERIENCE_LEVELS = [
	{ id: 'beginner' as const, icon: Sprout, title: 'Beginner', description: 'Just starting out', color: '#4ade80' },
	{ id: 'intermediate' as const, icon: Flame, title: 'Intermediate', description: 'Some experience', color: '#f59e0b' },
	{ id: 'advanced' as const, icon: Award, title: 'Advanced', description: 'Solid foundation', color: '#3b82f6' },
	{ id: 'expert' as const, icon: Rocket, title: 'Expert', description: 'Deep expertise', color: '#a855f7' },
] as const;

type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]['id'];

const MotionBox = motion.create(Box);

interface GenerateFromDocumentModalProps {
	documentId: string;
	documentName: string;
}

export function GenerateFromDocumentModal({ documentId, documentName }: GenerateFromDocumentModalProps) {
	const theme = useTheme();
	const { closeModal } = useModal();
	const { showSnackbar } = useSnackbar();
	const { execute, isLoading, error } = useGenerateRoadmapCommand();

	const [title, setTitle] = useState('');
	const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>();
	const [goal, setGoal] = useState('');
	const [phase, setPhase] = useState<'form' | 'loading'>('form');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setPhase('loading');
		try {
			await execute(documentId, {
				title: title.trim() || undefined,
				userContext: experienceLevel || goal.trim()
					? { experienceLevel, goal: goal.trim() || undefined }
					: undefined,
				navigateOnSuccess: true,
			});
			closeModal();
		} catch {
			setPhase('form');
			showSnackbar('Failed to generate roadmap', { severity: 'error' });
		}
	};

	return (
		<AnimatePresence mode='wait'>
			{phase === 'form' ? (
				<MotionBox
					key='form'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.25 }}>
				<Box component='form' onSubmit={handleSubmit} sx={{ py: 1 }}>
					<Typography variant='body2' sx={{ color: 'text.secondary', mb: 3 }}>
						Generate a learning roadmap from the concepts extracted from{' '}
						<strong>{documentName}</strong>.
					</Typography>

					<TextField
						fullWidth
						label='Roadmap title (optional)'
						placeholder='Auto-generated from document concepts'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						disabled={isLoading}
						sx={{ mb: 2 }}
					/>

					<Typography variant='body2' sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 500 }}>
						Your experience level (optional)
					</Typography>
					<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 2 }}>
						{EXPERIENCE_LEVELS.map((level, index) => {
							const Icon = level.icon;
							const isSelected = experienceLevel === level.id;
							return (
								<motion.div
									key={level.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.05 + index * 0.04 }}>
									<Box
										onClick={() => setExperienceLevel(isSelected ? undefined : level.id)}
										sx={{
											p: 1.5,
											borderRadius: 3,
											border: `1px solid ${alpha(isSelected ? level.color : theme.palette.primary.light, isSelected ? 0.6 : 0.15)}`,
											background: isSelected ? alpha(level.color, 0.1) : 'transparent',
											cursor: 'pointer',
											transition: 'all 0.2s ease',
											textAlign: 'center',
											'&:hover': { borderColor: level.color, background: alpha(level.color, 0.05), transform: 'translateY(-2px)' },
										}}>
										<Box sx={{
											width: 36, height: 36, borderRadius: 2,
											display: 'flex', alignItems: 'center', justifyContent: 'center',
											mx: 'auto', mb: 0.5,
											background: alpha(level.color, 0.15), color: level.color,
										}}>
											<Icon size={18} />
										</Box>
										<Typography variant='caption' sx={{ fontWeight: 600, display: 'block' }}>
											{level.title}
										</Typography>
									</Box>
								</motion.div>
							);
						})}
					</Box>

					<TextField
						fullWidth
						label='Learning goal (optional)'
						placeholder='e.g. Prepare for an exam, build a project...'
						value={goal}
						onChange={(e) => setGoal(e.target.value)}
						disabled={isLoading}
						multiline
						minRows={2}
						sx={{ mb: 3 }}
					/>

					{error && (
						<Typography variant='body2' sx={{ color: 'error.light', mb: 2 }}>
							Something went wrong. Please try again.
						</Typography>
					)}

					<Button
						type={ButtonTypes.SUBMIT}
						label='Generate Roadmap'
						icon={Sparkles}
						iconPos={ButtonIconPositions.START}
						disabled={isLoading}
						loading={isLoading}
						fullWidth
					/>
				</Box>
				</MotionBox>
			) : (
				<MotionBox
					key='loading'
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3 }}
					sx={{
						py: 6,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 3,
					}}>
					<Box sx={{
						position: 'relative',
						width: 64, height: 64,
						display: 'flex', alignItems: 'center', justifyContent: 'center',
					}}>
						<CircularProgress size={64} thickness={2} sx={{ color: alpha(theme.palette.primary.main, 0.3), position: 'absolute' }} />
						<Sparkles size={28} color={theme.palette.primary.light} />
					</Box>
					<Box sx={{ textAlign: 'center' }}>
						<Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
							Building your learning path
						</Typography>
						<Typography variant='body2' sx={{ color: 'text.secondary' }}>
							Analyzing document concepts and creating a personalized roadmap...
						</Typography>
					</Box>
				</MotionBox>
			)}
		</AnimatePresence>
	);
}
