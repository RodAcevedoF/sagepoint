'use client';

import { useMemo } from 'react';
import { Box, Typography, IconButton, alpha, useTheme } from '@mui/material';
import {
	FileText,
	FileSpreadsheet,
	FileImage,
	FileType,
	File,
	Trash2,
	ArrowRight,
	Layers,
	HardDrive,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, useSnackbar } from '@/common/components';
import { useDocumentEvents } from '@/common/hooks';
import { useDeleteDocumentCommand } from '@/application/document';
import { documentApi } from '@/infrastructure/api/documentApi';
import { useAppDispatch } from '@/common/hooks';
import { ProcessingStatusBadge } from './ProcessingStatusBadge';
import { makeStyles } from './DocumentCard.styles';
import type { DocumentDetailDto } from '@/infrastructure/api/documentApi';
import { ProcessingStage } from '@sagepoint/domain';

const mimeIconMap: Array<{ test: (m: string) => boolean; icon: typeof File }> =
	[
		{ test: (m) => m.includes('pdf'), icon: FileText },
		{
			test: (m) => m.includes('spreadsheet') || m.includes('xlsx'),
			icon: FileSpreadsheet,
		},
		{ test: (m) => m.startsWith('image/'), icon: FileImage },
		{ test: (m) => m.includes('word') || m.includes('docx'), icon: FileType },
	];

function formatFileSize(bytes?: number): string {
	if (!bytes) return '';
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelativeDate(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffHours < 1) return 'Just now';
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return `${diffDays} days ago`;
	return date.toLocaleDateString();
}

const stageColorMap: Record<string, string> = {
	UPLOADED: 'text.disabled',
	PARSING: 'info',
	ANALYZING: 'warning',
	READY: 'success',
};

interface DocumentCardProps {
	document: DocumentDetailDto;
}

const sseStageMap: Record<string, ProcessingStage> = {
	parsing: ProcessingStage.PARSING,
	analyzing: ProcessingStage.ANALYZING,
	ready: ProcessingStage.READY,
};

export function DocumentCard({ document }: DocumentCardProps) {
	const theme = useTheme();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { execute: deleteDocument } = useDeleteDocumentCommand();
	const { showSnackbar } = useSnackbar();

	const isProcessing = document.status !== 'COMPLETED' && document.status !== 'FAILED';
	const { status: sseStatus, stage: sseStage } = useDocumentEvents(isProcessing ? document.id : null);

	if (sseStatus === 'completed') {
		dispatch(documentApi.util.invalidateTags([{ type: 'Document', id: 'LIST' }]));
	}

	const stage: ProcessingStage = (sseStage && sseStageMap[sseStage]) || document.processingStage;
	const colorKey = stageColorMap[stage] ?? 'primary';
	const paletteColors: Record<string, string> = {
		info: theme.palette.info.light,
		warning: theme.palette.warning.light,
		success: theme.palette.success.light,
		primary: theme.palette.primary.light,
	};
	const stageColor =
		colorKey === 'text.disabled' ?
			alpha(theme.palette.text.secondary, 0.4)
		:	(paletteColors[colorKey] ?? theme.palette.primary.light);

	const styles = makeStyles(stageColor, theme);
	const Icon = useMemo(() => {
		const mime = document.mimeType;
		if (!mime) return File;
		return mimeIconMap.find((entry) => entry.test(mime))?.icon ?? File;
	}, [document.mimeType]);

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!window.confirm(`Delete "${document.filename}"?`)) return;
		try {
			await deleteDocument(document.id);
			showSnackbar('Document deleted', { severity: 'success' });
		} catch {
			showSnackbar('Failed to delete document', { severity: 'error' });
		}
	};

	return (
		<Box
			onClick={() => router.push(`/documents/${document.id}`)}
			sx={styles.card}>
			<Card variant='glass' sx={{ position: 'relative' }}>
				<IconButton
					size='small'
					onClick={handleDelete}
					sx={styles.deleteButton}>
					<Trash2 size={16} />
				</IconButton>

				<Card.Content>
					<Box sx={styles.header}>
						<Box sx={styles.iconBox}>
							<Icon size={22} />
						</Box>
						<Box sx={styles.titleContainer}>
							<Typography variant='subtitle1' sx={styles.title}>
								{document.filename}
							</Typography>
							<Box sx={{ mt: 0.5 }}>
								<ProcessingStatusBadge stage={document.processingStage} />
							</Box>
						</Box>
					</Box>

					<Box sx={styles.statsRow}>
						{document.fileSize && (
							<Box sx={styles.statItem}>
								<HardDrive size={14} color={theme.palette.text.secondary} />
								<Typography variant='caption' sx={styles.statText}>
									{formatFileSize(document.fileSize)}
								</Typography>
							</Box>
						)}
						{stage === 'READY' &&
							document.conceptCount &&
							document.conceptCount > 0 && (
								<Box sx={styles.statItem}>
									<Layers size={14} color={theme.palette.text.secondary} />
									<Typography variant='caption' sx={styles.statText}>
										{document.conceptCount} concepts
									</Typography>
								</Box>
							)}
					</Box>
				</Card.Content>

				<Card.Footer sx={styles.footer}>
					<Box sx={styles.footerContent}>
						<Typography
							variant='caption'
							sx={{ color: alpha(theme.palette.text.secondary, 0.6) }}>
							{formatRelativeDate(document.createdAt)}
						</Typography>
						<ArrowRight size={16} color={theme.palette.text.secondary} />
					</Box>
				</Card.Footer>
			</Card>
		</Box>
	);
}
