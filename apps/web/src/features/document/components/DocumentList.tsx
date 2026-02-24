'use client';

import { useState, useMemo } from 'react';
import { Box, Grid, TextField, Chip, Typography, alpha, useTheme, InputAdornment } from '@mui/material';
import { FileText, Upload, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmptyState, ErrorState, useModal } from '@/common/components';
import { useUserDocumentsQuery } from '@/application/document';
import { DocumentHero } from './DocumentHero';
import { DocumentStats } from './DocumentStats';
import { DocumentCard } from './DocumentCard';
import { DocumentCardSkeleton } from './DocumentCardSkeleton';
import { ProcessingDocumentCard } from './ProcessingDocumentCard';
import { UploadDocumentModal } from './UploadDocumentModal';

const MotionBox = motion.create(Box);

type StageFilter = 'all' | 'processing' | 'ready';

export function DocumentList() {
	const { data: documents, isLoading, isError, refetch } = useUserDocumentsQuery();
	const { openModal } = useModal();
	const theme = useTheme();
	const [searchQuery, setSearchQuery] = useState('');
	const [stageFilter, setStageFilter] = useState<StageFilter>('all');

	const handleUpload = () => {
		openModal(<UploadDocumentModal />, {
			title: 'Upload Document',
			showCloseButton: true,
			maxWidth: 'sm',
		});
	};

	const { processingDocs, completedDocs } = useMemo(() => {
		if (!documents) return { processingDocs: [], completedDocs: [] };

		const filtered = documents.filter((doc) => {
			const matchesSearch = !searchQuery || doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
			const isDocProcessing = doc.status !== 'COMPLETED' && doc.status !== 'FAILED';
			const matchesFilter =
				stageFilter === 'all' ||
				(stageFilter === 'processing' && isDocProcessing) ||
				(stageFilter === 'ready' && !isDocProcessing);
			return matchesSearch && matchesFilter;
		});

		return {
			processingDocs: filtered.filter((d) => d.status !== 'COMPLETED' && d.status !== 'FAILED'),
			completedDocs: filtered.filter((d) => d.status === 'COMPLETED' || d.status === 'FAILED'),
		};
	}, [documents, searchQuery, stageFilter]);

	if (isLoading) {
		return (
			<>
				<DocumentHero onUpload={handleUpload} />
				<Grid container spacing={3} sx={{ mt: 2 }}>
					{Array.from({ length: 6 }).map((_, i) => (
						<Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
							<DocumentCardSkeleton />
						</Grid>
					))}
				</Grid>
			</>
		);
	}

	if (isError) {
		return (
			<ErrorState
				title='Failed to load documents'
				description='Could not retrieve your documents. Please try again.'
				onRetry={() => refetch()}
			/>
		);
	}

	const filterChips: { label: string; value: StageFilter }[] = [
		{ label: 'All', value: 'all' },
		{ label: 'Processing', value: 'processing' },
		{ label: 'Ready', value: 'ready' },
	];

	return (
		<>
			<DocumentHero onUpload={handleUpload} />

			{!documents || documents.length === 0 ? (
				<EmptyState
					title='No documents yet'
					description='Upload your first document to get started with AI-powered analysis.'
					icon={FileText}
					actionLabel='Upload Document'
					actionIcon={Upload}
					onAction={handleUpload}
				/>
			) : (
				<>
					<DocumentStats documents={documents} />

					{/* Filter bar */}
					<Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
						<TextField
							size='small'
							placeholder='Search documents...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position='start'>
											<Search size={16} color={theme.palette.text.secondary} />
										</InputAdornment>
									),
								},
							}}
							sx={{ minWidth: 220, flex: 1, maxWidth: 320 }}
						/>
						<Box sx={{ display: 'flex', gap: 0.75 }}>
							{filterChips.map((chip) => (
								<Chip
									key={chip.value}
									label={chip.label}
									size='small'
									onClick={() => setStageFilter(chip.value)}
									sx={{
										fontWeight: 500,
										bgcolor: stageFilter === chip.value ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
										color: stageFilter === chip.value ? theme.palette.primary.light : theme.palette.text.secondary,
										border: `1px solid ${alpha(
											stageFilter === chip.value ? theme.palette.primary.main : theme.palette.text.secondary,
											stageFilter === chip.value ? 0.3 : 0.15,
										)}`,
										'&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
									}}
								/>
							))}
						</Box>
					</Box>

					{/* Processing section */}
					{processingDocs.length > 0 && (
						<Box sx={{ mb: 4 }}>
							<Typography variant='subtitle2' sx={{ color: 'text.secondary', mb: 2, fontWeight: 600 }}>
								Processing ({processingDocs.length})
							</Typography>
							<Grid container spacing={3}>
								{processingDocs.map((doc, index) => (
									<Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4 }}>
										<MotionBox
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.4, delay: index * 0.08 }}>
											<ProcessingDocumentCard document={doc} />
										</MotionBox>
									</Grid>
								))}
							</Grid>
						</Box>
					)}

					{/* Completed section */}
					{completedDocs.length > 0 ? (
						<>
							{processingDocs.length > 0 && (
								<Typography variant='subtitle2' sx={{ color: 'text.secondary', mb: 2, fontWeight: 600 }}>
									Completed ({completedDocs.length})
								</Typography>
							)}
							<Grid container spacing={3}>
								{completedDocs.map((doc, index) => (
									<Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4 }}>
										<MotionBox
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.4, delay: 0.3 + index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}>
											<DocumentCard document={doc} />
										</MotionBox>
									</Grid>
								))}
							</Grid>
						</>
					) : processingDocs.length === 0 && (
						<EmptyState
							title='No matching documents'
							description='Try adjusting your search or filter.'
						/>
					)}
				</>
			)}
		</>
	);
}
