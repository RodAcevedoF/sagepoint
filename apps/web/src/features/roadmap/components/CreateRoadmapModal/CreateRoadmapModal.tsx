'use client';

import { useState } from 'react';
import {
	Box,
	TextField,
	Typography,
	CircularProgress,
	useTheme,
} from '@mui/material';
import { Sparkles } from 'lucide-react';
import { Button, useModal } from '../../../../common/components';
import { ButtonTypes, ButtonIconPositions } from '../../../../common/types';
import { useGenerateTopicRoadmapCommand } from '../../../../application/roadmap';
import { makeStyles } from './CreateRoadmapModal.styles';

export function CreateRoadmapModal() {
	const [topic, setTopic] = useState('');
	const [title, setTitle] = useState('');
	const { execute, isLoading, error } = useGenerateTopicRoadmapCommand();
	const { closeModal } = useModal();
	const theme = useTheme();
	const styles = makeStyles(theme);

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
		<Box component='form' onSubmit={handleSubmit} sx={styles.container}>
			<Typography variant='body2' sx={styles.description}>
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
				sx={styles.field}
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

			{error && (
				<Typography variant='body2' sx={styles.errorText}>
					Something went wrong. Please try again.
				</Typography>
			)}

			{isLoading && (
				<Box sx={styles.loadingContainer}>
					<CircularProgress size={20} sx={styles.loadingProgress} />
					<Typography variant='body2' sx={styles.loadingText}>
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
				sx={styles.submitButton}
			/>
		</Box>
	);
}
