'use client';

import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Brain } from 'lucide-react';
import { Loader, EmptyState } from '@/common/components';
import { useDocumentEvents, useAppDispatch } from '@/common/hooks';
import {
	useDocumentSummaryQuery,
	useDocumentQuizzesQuery,
} from '@/application/document';
import { useGetDocumentByIdQuery, documentApi } from '@/infrastructure/api/documentApi';
import { DocumentDetailHero } from './DocumentDetailHero';
import { DocumentSummaryView } from './DocumentSummaryView';
import { DocumentProcessingView } from './DocumentProcessingView';
import { QuizCard } from './QuizCard';

interface DocumentDetailProps {
	documentId: string;
}

export function DocumentDetail({ documentId }: DocumentDetailProps) {
	const dispatch = useAppDispatch();
	const { data: document, isLoading: docLoading } = useGetDocumentByIdQuery(documentId);
	const { data: summary, isLoading: summaryLoading } = useDocumentSummaryQuery(documentId);
	const { data: quizzes, isLoading: quizzesLoading } = useDocumentQuizzesQuery(documentId);

	const isProcessing = document ? document.status !== 'COMPLETED' && document.status !== 'FAILED' : false;
	const isSummarized = document?.processingStage === 'SUMMARIZED';
	const isFullyProcessing = isProcessing && !isSummarized;

	const { status: sseStatus, stage: sseStage } = useDocumentEvents(isProcessing ? documentId : null);
	const hasSummaryInvalidated = useRef(false);
	const hasCompletedInvalidated = useRef(false);

	useEffect(() => {
		if (sseStage === 'summarized' && !hasSummaryInvalidated.current) {
			hasSummaryInvalidated.current = true;
			dispatch(documentApi.util.invalidateTags([
				{ type: 'Document', id: documentId },
				{ type: 'DocumentSummary', id: documentId },
			]));
		}
		if (sseStatus === 'completed' && !hasCompletedInvalidated.current) {
			hasCompletedInvalidated.current = true;
			dispatch(documentApi.util.invalidateTags([
				{ type: 'Document', id: documentId },
				{ type: 'DocumentSummary', id: documentId },
				{ type: 'Quiz', id: documentId },
			]));
		}
	}, [sseStatus, sseStage, dispatch, documentId]);

	if (docLoading) {
		return <Loader variant='page' message='Loading document' />;
	}

	if (!document) {
		return <EmptyState title='Document not found' description='This document may have been deleted.' />;
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<DocumentDetailHero document={document} summary={summary} />

			{isFullyProcessing ? (
				<DocumentProcessingView documentId={documentId} />
			) : (
				<>
					{summaryLoading ? (
						<Loader variant='circular' />
					) : summary ? (
						<DocumentSummaryView summary={summary} />
					) : (
						<EmptyState
							title='No summary yet'
							description='The summary will appear once the document is fully analyzed.'
						/>
					)}

					<Box>
						<Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
							Quizzes
						</Typography>
						{isProcessing ? (
							<Loader variant='circular' message='Generating quiz questions...' />
						) : quizzesLoading ? (
							<Loader variant='circular' />
						) : quizzes && quizzes.length > 0 ? (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
								{quizzes.map((quiz) => (
									<QuizCard key={quiz.id} documentId={documentId} quiz={quiz} />
								))}
							</Box>
						) : (
							<EmptyState
								title='No quizzes yet'
								description='Quizzes will be generated once the document is fully analyzed.'
								icon={Brain}
							/>
						)}
					</Box>
				</>
			)}
		</Box>
	);
}
