import {
	Box,
	Typography,
	alpha,
	Stack,
	Container,
	useTheme,
	Theme,
} from '@mui/material';
import { Rocket, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const makeStyles = (theme: Theme) => ({
	container: {
		mt: { xs: 10, md: 16 },
		mb: { xs: 6, md: 10 },
	},
	card: {
		position: 'relative',
		borderRadius: { xs: 4, md: 6 },
		overflow: 'hidden',
		p: { xs: 4, md: 6 },
		bgcolor: alpha(theme.palette.background.paper, 0.4),
		border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
		backdropFilter: 'blur(10px)',
		transition: 'all 0.4s ease',
		'&:hover': {
			borderColor: alpha(theme.palette.primary.main, 0.2),
			bgcolor: alpha(theme.palette.background.paper, 0.6),
			boxShadow: `0 24px 48px -12px ${alpha(theme.palette.background.default, 0.5)}`,
		},
	},
	bgGlow: {
		position: 'absolute',
		top: '-50%',
		right: '-10%',
		width: '60%',
		height: '200%',
		background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
		zIndex: 0,
		pointerEvents: 'none',
	},
	contentStack: {
		position: 'relative',
		zIndex: 1,
	},
	textContainer: {
		maxWidth: 540,
	},
	badge: {
		display: 'flex',
		p: 1,
		borderRadius: '12px',
		bgcolor: alpha(theme.palette.primary.main, 0.1),
		color: theme.palette.primary.light,
	},
	badgeText: {
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '0.1em',
		color: theme.palette.primary.light,
		mb: 0,
	},
	title: {
		fontWeight: 800,
		mb: 1.5,
		color: theme.palette.text.primary,
		letterSpacing: '-0.02em',
	},
	description: {
		color: theme.palette.text.secondary,
		lineHeight: 1.6,
		opacity: 0.9,
	},
	actionsContainer: {
		width: { xs: '100%', sm: 'auto' },
	},
	primaryBtn: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 1.5,
		height: '56px',
		px: 4,
		borderRadius: '12px',
		bgcolor: theme.palette.primary.main,
		color: 'white',
		textDecoration: 'none',
		fontWeight: 700,
		fontSize: '0.95rem',
		transition: 'all 0.2s ease',
		'&:hover': {
			bgcolor: theme.palette.primary.dark,
			transform: 'translateY(-2px)',
			boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
		},
	},
	secondaryBtn: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 1.5,
		height: '56px',
		px: 4,
		borderRadius: '12px',
		bgcolor: alpha(theme.palette.text.primary, 0.05),
		color: theme.palette.text.primary,
		textDecoration: 'none',
		fontWeight: 600,
		fontSize: '0.95rem',
		border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
		transition: 'all 0.2s ease',
		'&:hover': {
			bgcolor: alpha(theme.palette.text.primary, 0.08),
			borderColor: alpha(theme.palette.text.primary, 0.2),
		},
	},
});

export function LearningCTA() {
	const theme = useTheme();
	const styles = makeStyles(theme);

	return (
		<Container maxWidth='lg' sx={styles.container}>
			<Box sx={styles.card}>
				{/* Subtle Background Glow */}
				<Box sx={styles.bgGlow} />

				<Stack
					direction={{ xs: 'column', md: 'row' }}
					justifyContent='space-between'
					alignItems='center'
					spacing={4}
					sx={styles.contentStack}>
					<Box sx={styles.textContainer}>
						<Stack
							direction='row'
							alignItems='center'
							spacing={1.5}
							sx={{ mb: 2 }}>
							<Box sx={styles.badge}>
								<Rocket size={20} />
							</Box>
							<Typography variant='caption' sx={styles.badgeText}>
								Ready for more?
							</Typography>
						</Stack>

						<Typography variant='h4' sx={styles.title}>
							Take the next step in your <br />
							learning journey.
						</Typography>
						<Typography variant='body1' sx={styles.description}>
							Explore your library or create a brand new path with our
							AI-powered generator.
						</Typography>
					</Box>

					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={2}
						sx={styles.actionsContainer}>
						<Box
							component={Link}
							href='/roadmaps/create'
							sx={styles.primaryBtn}>
							Create Roadmap
							<ArrowRight size={18} />
						</Box>

						<Box component={Link} href='/documents' sx={styles.secondaryBtn}>
							<BookOpen size={18} />
							Go to Library
						</Box>
					</Stack>
				</Stack>
			</Box>
		</Container>
	);
}
