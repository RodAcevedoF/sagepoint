'use client';

import { Box, Typography, LinearProgress, alpha, useTheme } from '@mui/material';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/common/components';
import { useDocumentEvents, useAppDispatch } from '@/common/hooks';
import { documentApi } from '@/infrastructure/api/documentApi';
import type { DocumentDetailDto } from '@/infrastructure/api/documentApi';
import type { DocumentEventStage } from '@/common/hooks';

const STAGE_LABELS: Record<string, string> = {
	parsing: 'Parsing document...',
	analyzing: 'Analyzing content...',
	summarized: 'Summary ready, generating quiz...',
	ready: 'Ready',
};

function stageProgress(stage: DocumentEventStage): number {
	switch (stage) {
		case 'parsing': return 25;
		case 'analyzing': return 50;
		case 'summarized': return 75;
		case 'ready': return 100;
		default: return 10;
	}
}

interface ProcessingDocumentCardProps {
	document: DocumentDetailDto;
}

export function ProcessingDocumentCard({ document }: ProcessingDocumentCardProps) {
	const theme = useTheme();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { status, stage } = useDocumentEvents(document.id);

	if (status === 'completed') {
		dispatch(documentApi.util.invalidateTags([{ type: 'Document', id: 'LIST' }]));
	}

	const progress = stageProgress(stage);
	const label = (stage && STAGE_LABELS[stage]) || 'Starting...';

	return (
		<Box
			onClick={() => router.push(`/documents/${document.id}`)}
			sx={{
				cursor: 'pointer',
				transition: 'transform 0.2s',
				'&:hover': { transform: 'translateY(-3px)' },
			}}>
			<Card
				variant='glass'
				sx={{
					position: 'relative',
					overflow: 'hidden',
					'&::before': {
						content: '""',
						position: 'absolute',
						inset: 0,
						borderRadius: 'inherit',
						border: `1.5px solid transparent`,
						background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.info.main, 0.3)}) border-box`,
						WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
						WebkitMaskComposite: 'xor',
						maskComposite: 'exclude',
						animation: 'pulse 2s ease-in-out infinite',
					},
					'@keyframes pulse': {
						'0%, 100%': { opacity: 0.5 },
						'50%': { opacity: 1 },
					},
				}}>
				<Card.Content>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
						<Box sx={{
							width: 40, height: 40, borderRadius: 2,
							display: 'flex', alignItems: 'center', justifyContent: 'center',
							bgcolor: alpha(theme.palette.primary.main, 0.12),
							color: theme.palette.primary.light,
						}}>
							<FileText size={20} />
						</Box>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography variant='subtitle2' sx={{
								fontWeight: 600,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}>
								{document.filename}
							</Typography>
							<Typography variant='caption' sx={{ color: 'text.secondary' }}>
								{label}
							</Typography>
						</Box>
					</Box>
					<LinearProgress
						variant='determinate'
						value={progress}
						sx={{
							height: 4,
							borderRadius: 2,
							bgcolor: alpha(theme.palette.primary.main, 0.1),
							'& .MuiLinearProgress-bar': {
								borderRadius: 2,
								background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
							},
						}}
					/>
				</Card.Content>
			</Card>
		</Box>
	);
}
