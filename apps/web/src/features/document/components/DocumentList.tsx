'use client';

import { Box, Grid } from '@mui/material';
import { FileText, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { Loader, EmptyState, ErrorState, useModal } from '@/common/components';
import { useUserDocumentsQuery } from '@/application/document';
import { DocumentHero } from './DocumentHero';
import { DocumentStats } from './DocumentStats';
import { DocumentCard } from './DocumentCard';
import { UploadDocumentModal } from './UploadDocumentModal';

const MotionBox = motion.create(Box);

export function DocumentList() {
	const { data: documents, isLoading, isError, refetch } = useUserDocumentsQuery();
	const { openModal } = useModal();

	const handleUpload = () => {
		openModal(<UploadDocumentModal />, {
			title: 'Upload Document',
			showCloseButton: true,
			maxWidth: 'sm',
		});
	};

	if (isLoading) {
		return <Loader variant='page' message='Loading documents' />;
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

					<Grid container spacing={3}>
						{documents.map((doc, index) => (
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
			)}
		</>
	);
}
