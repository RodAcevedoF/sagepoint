'use client';

import { Box, Typography, alpha, Stack, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { Rocket, Sparkles, BookOpen, Star, ArrowRight } from 'lucide-react';
import { palette } from '@/common/theme';
import { Button } from '@/common/components';
import {
	ButtonVariants,
	ButtonIconPositions,
	ButtonSizes,
} from '@/common/types';
import { useRouter } from 'next/navigation';

export function LearningCTA() {
	const router = useRouter();

	return (
		<Container
			maxWidth='lg'
			sx={{ mt: { xs: 8, md: 12 }, mb: { xs: 4, md: 8 } }}>
			<Box
				component={motion.div}
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.8, ease: 'easeOut' }}
				sx={{
					position: 'relative',
					borderRadius: { xs: 6, md: 10 },
					overflow: 'hidden',
					p: { xs: 5, md: 8 },
					background: `linear-gradient(135deg, ${alpha(palette.primary.dark, 0.4)} 0%, ${alpha(palette.secondary.dark, 0.4)} 100%)`,
					border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
					backdropFilter: 'blur(10px)',
					boxShadow: `0 20px 40px ${alpha(palette.background.default, 0.5)}`,
					textAlign: { xs: 'center', md: 'left' },
				}}>
				{/* Decorative Elements */}
				<Box
					sx={{
						position: 'absolute',
						top: -100,
						right: -100,
						width: 300,
						height: 300,
						borderRadius: '50%',
						background: `radial-gradient(circle, ${alpha(palette.primary.main, 0.15)} 0%, transparent 70%)`,
						filter: 'blur(60px)',
						zIndex: 0,
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						bottom: -150,
						left: -150,
						width: 400,
						height: 400,
						borderRadius: '50%',
						background: `radial-gradient(circle, ${alpha(palette.info.main, 0.12)} 0%, transparent 70%)`,
						filter: 'blur(80px)',
						zIndex: 0,
					}}
				/>

				{/* Floating Icons */}
				<motion.div
					animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
					transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
					style={{
						position: 'absolute',
						top: '15%',
						left: '8%',
						opacity: 0.15,
						color: palette.primary.light,
						pointerEvents: 'none',
					}}>
					<Sparkles size={48} />
				</motion.div>
				<motion.div
					animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }}
					transition={{
						duration: 6,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 1,
					}}
					style={{
						position: 'absolute',
						bottom: '20%',
						right: '12%',
						opacity: 0.15,
						color: palette.warning.main,
						pointerEvents: 'none',
					}}>
					<Rocket size={56} />
				</motion.div>
				<motion.div
					animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }}
					transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
					style={{
						position: 'absolute',
						top: '70%',
						left: '20%',
						color: palette.info.light,
						pointerEvents: 'none',
					}}>
					<Star size={28} />
				</motion.div>

				<Stack
					direction={{ xs: 'column', md: 'row' }}
					justifyContent='space-between'
					alignItems='center'
					spacing={6}
					sx={{ position: 'relative', zIndex: 1 }}>
					<Box sx={{ maxWidth: 650 }}>
						<Box
							sx={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 1,
								px: 2,
								py: 0.5,
								borderRadius: 100,
								bgcolor: alpha(palette.primary.main, 0.1),
								border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
								color: palette.primary.light,
								mb: 3,
								fontSize: '0.75rem',
								fontWeight: 700,
								textTransform: 'uppercase',
								letterSpacing: '1px',
							}}>
							<Sparkles size={14} />
							Never stop learning
						</Box>
						<Typography
							variant='h3'
							sx={{
								fontWeight: 900,
								mb: 2.5,
								background: `linear-gradient(to right, ${palette.text.primary}, ${palette.primary.light}, ${palette.info.light})`,
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								letterSpacing: '-1.5px',
								lineHeight: 1.1,
								fontSize: { xs: '2.25rem', md: '3.5rem' },
							}}>
							Ready to Master <br />
							Your Next Skill?
						</Typography>
						<Typography
							variant='h6'
							sx={{
								color: 'text.secondary',
								fontWeight: 400,
								opacity: 0.8,
								mb: 1.5,
								lineHeight: 1.5,
								maxWidth: 500,
								mx: { xs: 'auto', md: 0 },
							}}>
							Turn any complex topic into a structured path. From PDFs to deep
							research, Sagepoint guides you.
						</Typography>
					</Box>

					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={2}
						sx={{ width: { xs: '100%', sm: 'auto' } }}>
						<Button
							label='Create Roadmap'
							icon={ArrowRight}
							iconPos={ButtonIconPositions.END}
							size={ButtonSizes.LARGE}
							onClick={() => router.push('/roadmaps/create')}
							sx={{
								py: 2,
								px: 5,
								borderRadius: 4,
								fontSize: '1rem',
								fontWeight: 700,
								height: '60px',
								boxShadow: `0 12px 24px ${alpha(palette.primary.main, 0.2)}`,
								'&:hover': {
									transform: 'translateY(-2px)',
									boxShadow: `0 16px 32px ${alpha(palette.primary.main, 0.3)}`,
								},
							}}
						/>
						<Button
							label='Library'
							variant={ButtonVariants.GLASS}
							icon={BookOpen}
							iconPos={ButtonIconPositions.START}
							size={ButtonSizes.LARGE}
							onClick={() => router.push('/documents')}
							sx={{
								py: 2,
								px: 5,
								borderRadius: 4,
								fontSize: '1rem',
								fontWeight: 600,
								height: '60px',
								bgcolor: alpha(palette.background.paper, 0.4),
								'&:hover': {
									bgcolor: alpha(palette.background.paper, 0.6),
								},
							}}
						/>
					</Stack>
				</Stack>
			</Box>
		</Container>
	);
}
