'use client';

import { useState } from 'react';
import {
	Box,
	TextField,
	Typography,
	CircularProgress,
	alpha,
} from '@mui/material';
import { Sparkles } from 'lucide-react';
import { Button, useModal } from '@/common/components';
import { ButtonTypes, ButtonIconPositions } from '@/common/types';
import { palette } from '@/common/theme';
import { useGenerateTopicRoadmapCommand } from '@/application/roadmap';

export function CreateRoadmapModal() {
	const [topic, setTopic] = useState('');
	const [title, setTitle] = useState('');
	const { execute, isLoading, error } = useGenerateTopicRoadmapCommand();
	const { closeModal } = useModal();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!topic.trim()) return;

		try {
			await execute(topic.trim(), title.trim() || undefined, {
				navigateOnSuccess: true,
			});
			closeModal();
		} catch {
			// Error is already captured in the command hook
		}
	};

	return (
		<Box component='form' onSubmit={handleSubmit} sx={{ py: 1 }}>
			<Typography variant='body2' sx={{ color: palette.text.secondary, mb: 3 }}>
				Tell us what you want to learn and we&apos;ll create a personalized
				roadmap with AI.
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

			{error && (
				<Typography variant='body2' sx={{ color: palette.error.light, mb: 2 }}>
					Something went wrong. Please try again.
				</Typography>
			)}

			{isLoading && (
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 2,
						mb: 3,
						p: 2,
						borderRadius: 2,
						bgcolor: alpha(palette.primary.main, 0.08),
						border: `1px solid ${alpha(palette.primary.main, 0.15)}`,
					}}>
					<CircularProgress size={20} sx={{ color: palette.primary.light }} />
					<Typography variant='body2' sx={{ color: palette.text.secondary }}>
						Generating your roadmap... This may take a moment.
					</Typography>
				</Box>
			)}

			<Button
				type={ButtonTypes.SUBMIT}
				label={isLoading ? 'Generating...' : 'Generate Roadmap'}
				icon={Sparkles}
				iconPos={ButtonIconPositions.START}
				disabled={!topic.trim() || isLoading}
				loading={isLoading}
				fullWidth
				sx={{
					py: 1.5,
				}}
			/>
		</Box>
	);
}
