'use client';

import { useState, useCallback } from 'react';
import { Box, Typography, alpha, Stack, CircularProgress } from '@mui/material';
import { Upload, FileUp, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal, useSnackbar } from '@/common/components';
import { useUploadDocumentCommand } from '@/application/document';
import { palette } from '@/common/theme';

export function UploadDocumentModal() {
	const { execute, isLoading } = useUploadDocumentCommand();
	const { closeModal } = useModal();
	const { showSnackbar } = useSnackbar();
	const [dragOver, setDragOver] = useState(false);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);

	const handleFile = useCallback(
		async (file: File) => {
			setUploadedFile(file);
			try {
				await execute(file);
				showSnackbar('Document uploaded successfully', { severity: 'success' });
				// Keep showing success state for a moment before closing
				setTimeout(() => closeModal(), 1500);
			} catch {
				showSnackbar('Failed to upload document', { severity: 'error' });
				setUploadedFile(null);
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
		<Box sx={{ p: 1 }}>
			<AnimatePresence mode='wait'>
				{!uploadedFile ?
					<motion.div
						key='upload-zone'
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}>
						<Box
							onDrop={handleDrop}
							onDragOver={(e) => {
								e.preventDefault();
								setDragOver(true);
							}}
							onDragLeave={() => setDragOver(false)}
							sx={{
								position: 'relative',
								border: `2px dashed ${
									dragOver ?
										palette.primary.main
									:	alpha(palette.primary.light, 0.2)
								}`,
								borderRadius: 6,
								p: { xs: 4, md: 8 },
								textAlign: 'center',
								transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
								bgcolor:
									dragOver ?
										alpha(palette.primary.main, 0.08)
									:	alpha(palette.background.paper, 0.2),
								cursor: 'pointer',
								'&:hover': {
									borderColor: palette.primary.light,
									bgcolor: alpha(palette.primary.light, 0.04),
									'& .upload-icon-box': {
										transform: 'scale(1.1) translateY(-4px)',
										bgcolor: alpha(palette.primary.main, 0.2),
									},
								},
							}}
							onClick={() =>
								document.getElementById('file-upload-input')?.click()
							}>
							<Box
								className='upload-icon-box'
								sx={{
									width: 80,
									height: 80,
									borderRadius: 4,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									bgcolor: alpha(palette.primary.main, 0.1),
									color: palette.primary.light,
									mx: 'auto',
									mb: 3,
									transition:
										'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
									boxShadow: `0 8px 16px ${alpha(palette.primary.main, 0.1)}`,
								}}>
								<Upload size={36} />
							</Box>

							<Typography
								variant='h5'
								sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
								{dragOver ? 'Drop it here!' : 'Select a document'}
							</Typography>
							<Typography
								variant='body1'
								color='text.secondary'
								sx={{ mb: 4, maxWidth: 300, mx: 'auto', lineHeight: 1.6 }}>
								Drag and drop your file or click to browse through your device.
							</Typography>

							<Stack
								direction='row'
								spacing={2}
								justifyContent='center'
								alignItems='center'
								sx={{ mb: 2 }}>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 1,
										color: 'text.secondary',
										fontSize: '0.875rem',
									}}>
									<FileText size={16} />
									PDF, DOCX, XLSX
								</Box>
								<Box
									sx={{
										width: 4,
										height: 4,
										borderRadius: '50%',
										bgcolor: alpha(palette.text.secondary, 0.3),
									}}
								/>
								<Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
									Max 100MB
								</Box>
							</Stack>
						</Box>
					</motion.div>
				:	<motion.div
						key='success-zone'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						style={{ textAlign: 'center', padding: '40px 20px' }}>
						<Box
							sx={{
								width: 84,
								height: 84,
								borderRadius: '50%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								bgcolor:
									isLoading ?
										alpha(palette.info.main, 0.1)
									:	alpha(palette.success.main, 0.1),
								color: isLoading ? palette.info.light : palette.success.light,
								mx: 'auto',
								mb: 3,
								position: 'relative',
							}}>
							{isLoading ?
								<CircularProgress
									size={84}
									thickness={2}
									sx={{ position: 'absolute', color: palette.info.main }}
								/>
							:	<CheckCircle2 size={48} />}
							{isLoading && <FileUp size={32} />}
						</Box>
						<Typography variant='h5' fontWeight='700' gutterBottom>
							{isLoading ? 'Processing Document' : 'Successfully Uploaded'}
						</Typography>
						<Typography variant='body1' color='text.secondary'>
							{uploadedFile.name}
						</Typography>
					</motion.div>
				}
			</AnimatePresence>

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
