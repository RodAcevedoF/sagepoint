'use client';

import { Box, Typography } from '@mui/material';
import { Brain } from 'lucide-react';
import { Loader, EmptyState } from '@/common/components';
import {
	useDocumentSummaryQuery,
	useDocumentQuizzesQuery,
} from '@/application/document';
import { useGetDocumentByIdQuery } from '@/infrastructure/api/documentApi';
import { DocumentDetailHero } from './DocumentDetailHero';
import { DocumentSummaryView } from './DocumentSummaryView';
import { QuizCard } from './QuizCard';

interface DocumentDetailProps {
	documentId: string;
}

export function DocumentDetail({ documentId }: DocumentDetailProps) {
	const { data: document, isLoading: docLoading } = useGetDocumentByIdQuery(documentId);
	const { data: summary, isLoading: summaryLoading } = useDocumentSummaryQuery(documentId);
	const { data: quizzes, isLoading: quizzesLoading } = useDocumentQuizzesQuery(documentId);

	if (docLoading) {
		return <Loader variant='page' message='Loading document' />;
	}

	if (!document) {
		return <EmptyState title='Document not found' description='This document may have been deleted.' />;
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<DocumentDetailHero document={document} summary={summary} />

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
				{quizzesLoading ? (
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
		</Box>
	);
}
