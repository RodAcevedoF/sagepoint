'use client';

import { useState, useCallback } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import { Upload, FileUp } from 'lucide-react';
import { Button, useModal, useSnackbar } from '@/common/components';
import { ButtonSizes, ButtonIconPositions } from '@/common/types';
import { useUploadDocumentCommand } from '@/application/document';

export function UploadDocumentModal() {
	const theme = useTheme();
	const { execute, isLoading } = useUploadDocumentCommand();
	const { closeModal } = useModal();
	const { showSnackbar } = useSnackbar();
	const [dragOver, setDragOver] = useState(false);

	const handleFile = useCallback(
		async (file: File) => {
			try {
				await execute(file);
				showSnackbar('Document uploaded successfully', { severity: 'success' });
				closeModal();
			} catch {
				showSnackbar('Failed to upload document', { severity: 'error' });
			}
		},
		[execute, closeModal, showSnackbar],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragOver(false);
			const file = e.dataTransfer.files[0];
			if (file) handleFile(file);
		},
		[handleFile],
	);

	const handleFileInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) handleFile(file);
		},
		[handleFile],
	);

	return (
		<Box
			onDrop={handleDrop}
			onDragOver={(e) => {
				e.preventDefault();
				setDragOver(true);
			}}
			onDragLeave={() => setDragOver(false)}
			sx={{
				border: `2px dashed ${alpha(
					dragOver ? theme.palette.primary.main : theme.palette.divider,
					dragOver ? 0.8 : 0.3,
				)}`,
				borderRadius: 4,
				p: 6,
				textAlign: 'center',
				transition: 'all 0.2s',
				bgcolor: dragOver ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
			}}>
			<Box
				sx={{
					width: 64,
					height: 64,
					borderRadius: 3,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: alpha(theme.palette.primary.main, 0.1),
					color: theme.palette.primary.light,
					mx: 'auto',
					mb: 2,
				}}>
				<Upload size={32} />
			</Box>

			<Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
				Drop your file here
			</Typography>
			<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
				PDF, DOCX, XLSX, or images up to 100MB
			</Typography>

			<Button
				label={isLoading ? 'Uploading...' : 'Browse Files'}
				icon={FileUp}
				iconPos={ButtonIconPositions.START}
				size={ButtonSizes.MEDIUM}
				onClick={() => document.getElementById('file-upload-input')?.click()}
			/>
			<input
				id='file-upload-input'
				type='file'
				hidden
				accept='.pdf,.docx,.xlsx,.png,.jpg,.jpeg,.webp'
				onChange={handleFileInput}
			/>
		</Box>
	);
}
