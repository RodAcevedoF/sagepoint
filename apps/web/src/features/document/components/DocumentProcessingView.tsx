'use client';

import { Box, Typography, useTheme, alpha } from '@mui/material';
import { FileText, Brain, BookOpen, CheckCircle2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useDocumentEvents, type DocumentEventStage } from '@/common/hooks';

const MotionBox = motion.create(Box);

interface StageInfo {
	icon: LucideIcon;
	label: string;
	description: string;
}

const STAGES: StageInfo[] = [
	{ icon: FileText, label: 'Parsing document', description: 'Extracting text and structure from your file' },
	{ icon: Brain, label: 'Generating summary', description: 'Analyzing content and key points' },
	{ icon: BookOpen, label: 'Processing quiz & concepts', description: 'Building quiz questions and knowledge graph' },
	{ icon: CheckCircle2, label: 'Ready', description: 'Document analysis complete' },
];

function stageToIndex(stage: DocumentEventStage): number {
	switch (stage) {
		case 'parsing': return 0;
		case 'analyzing': return 1;
		case 'summarized': return 2;
		case 'ready': return 3;
		default: return 0;
	}
}

type StageState = 'pending' | 'active' | 'completed';

function getStageState(index: number, activeIndex: number): StageState {
	if (index < activeIndex) return 'completed';
	if (index === activeIndex) return 'active';
	return 'pending';
}

interface DocumentProcessingViewProps {
	documentId: string;
}

export function DocumentProcessingView({ documentId }: DocumentProcessingViewProps) {
	const theme = useTheme();
	const { stage } = useDocumentEvents(documentId);
	const activeIndex = stage ? stageToIndex(stage) : 0;

	const stateColors: Record<StageState, string> = {
		pending: alpha(theme.palette.text.secondary, 0.4),
		active: theme.palette.primary.light,
		completed: theme.palette.success.light,
	};

	return (
		<Box sx={{
			p: { xs: 3, md: 5 },
			borderRadius: 4,
			background: alpha(theme.palette.background.paper, 0.4),
			backdropFilter: 'blur(12px)',
			border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
			textAlign: 'center',
		}}>
			<Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
				Processing your document
			</Typography>
			<Typography variant='body2' sx={{ color: 'text.secondary', mb: 4 }}>
				We&apos;re analyzing your file to extract key concepts and insights.
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 360, mx: 'auto' }}>
				{STAGES.map((s, index) => {
					const state = getStageState(index, activeIndex);
					const color = stateColors[state];
					const Icon = s.icon;
					const isLast = index === STAGES.length - 1;

					return (
						<Box key={s.label} sx={{ display: 'flex', gap: 2, opacity: state === 'pending' ? 0.45 : 1 }}>
							{/* Timeline */}
							<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.25 }}>
								<Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									{state === 'active' && (
										<MotionBox
											animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
											transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
											sx={{
												position: 'absolute',
												width: 32, height: 32,
												borderRadius: '50%',
												bgcolor: alpha(color, 0.25),
											}}
										/>
									)}
									<Box sx={{
										width: 32, height: 32, borderRadius: '50%',
										display: 'flex', alignItems: 'center', justifyContent: 'center',
										bgcolor: alpha(color, 0.15), color,
										border: `2px solid ${alpha(color, state === 'active' ? 0.5 : 0.2)}`,
										transition: 'all 0.3s ease',
									}}>
										{state === 'completed' ? <Check size={14} /> : <Icon size={14} />}
									</Box>
								</Box>
								{!isLast && (
									<Box sx={{
										width: 2, flex: 1, minHeight: 24,
										bgcolor: alpha(state === 'completed' ? theme.palette.success.light : theme.palette.text.secondary, 0.2),
										transition: 'background 0.3s ease',
									}} />
								)}
							</Box>

							{/* Label */}
							<Box sx={{ pb: isLast ? 0 : 3, textAlign: 'left' }}>
								<Typography variant='body2' sx={{ fontWeight: 600, color }}>
									{s.label}
								</Typography>
								<Typography variant='caption' sx={{ color: 'text.secondary' }}>
									{s.description}
								</Typography>
							</Box>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}
