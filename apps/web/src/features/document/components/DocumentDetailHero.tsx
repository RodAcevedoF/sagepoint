'use client';

import { Box, Typography, alpha, useTheme, Chip } from '@mui/material';
import { Map, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button, useSnackbar } from '@/common/components';
import { ButtonVariants, ButtonSizes, ButtonIconPositions } from '@/common/types';
import { useDeleteDocumentCommand } from '@/application/document';
import { ProcessingStatusBadge } from './ProcessingStatusBadge';
import type { DocumentDetailDto, DocumentSummaryDto } from '@/infrastructure/api/documentApi';

const MotionBox = motion.create(Box);

interface DocumentDetailHeroProps {
	document: DocumentDetailDto;
	summary?: DocumentSummaryDto | null;
}

export function DocumentDetailHero({ document, summary }: DocumentDetailHeroProps) {
	const theme = useTheme();
	const router = useRouter();
	const { execute: deleteDocument } = useDeleteDocumentCommand();
	const { showSnackbar } = useSnackbar();

	const isReady = document.processingStage === 'READY';

	const handleDelete = async () => {
		if (!window.confirm(`Delete "${document.filename}"?`)) return;
		try {
			await deleteDocument(document.id);
			showSnackbar('Document deleted', { severity: 'success' });
			router.push('/documents');
		} catch {
			showSnackbar('Failed to delete document', { severity: 'error' });
		}
	};

	const handleGenerateRoadmap = () => {
		const topic = summary?.topicArea ?? document.filename;
		router.push(`/roadmaps/create?topic=${encodeURIComponent(topic)}&from=document`);
	};

	return (
		<MotionBox
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: 'easeOut' }}
			sx={{ mb: 4 }}>
			<Box
				sx={{
					position: 'relative',
					overflow: 'hidden',
					borderRadius: 6,
					p: { xs: 4, md: 6 },
					background: alpha(theme.palette.background.paper, 0.4),
					backdropFilter: 'blur(12px)',
					border: `1px solid ${alpha(theme.palette.info.light, 0.1)}`,
				}}>
				{/* Decorative gradient orb */}
				<Box
					sx={{
						position: 'absolute',
						top: -80,
						right: -80,
						width: 260,
						height: 260,
						borderRadius: '50%',
						background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.2)} 0%, transparent 70%)`,
						pointerEvents: 'none',
					}}
				/>

				<Typography
					variant='h3'
					sx={{
						fontWeight: 800,
						mb: 1.5,
						background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.light} 100%)`,
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}>
					{document.filename}
				</Typography>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
					<ProcessingStatusBadge stage={document.processingStage} />
					{summary?.topicArea && (
						<Chip
							label={summary.topicArea}
							size='small'
							sx={{
								bgcolor: alpha(theme.palette.primary.main, 0.1),
								color: theme.palette.primary.light,
								fontWeight: 500,
							}}
						/>
					)}
					{summary?.difficulty && (
						<Chip
							label={summary.difficulty}
							size='small'
							variant='outlined'
							sx={{
								borderColor: alpha(theme.palette.warning.main, 0.3),
								color: theme.palette.warning.light,
								fontSize: '0.7rem',
							}}
						/>
					)}
				</Box>

				<Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
					{isReady && (
						<Button
							label='Generate Roadmap'
							icon={Map}
							iconPos={ButtonIconPositions.START}
							size={ButtonSizes.MEDIUM}
							onClick={handleGenerateRoadmap}
						/>
					)}
					<Button
						label='Delete'
						icon={Trash2}
						iconPos={ButtonIconPositions.START}
						size={ButtonSizes.MEDIUM}
						variant={ButtonVariants.OUTLINED}
						onClick={handleDelete}
					/>
				</Box>
			</Box>
		</MotionBox>
	);
}
