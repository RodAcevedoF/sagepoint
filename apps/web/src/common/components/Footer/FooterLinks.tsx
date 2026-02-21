'use client';

import { ReactNode } from 'react';
import { Box, Stack, Typography, alpha, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { palette } from '@/common/theme';
import {
	Login as LoginIcon,
	PersonAdd as RegisterIcon,
	AutoAwesome as FeaturesIcon,
	Description as DocsIcon,
	GitHub as GitHubIcon,
	HelpOutline as HelpIcon,
} from '@mui/icons-material';

const styles = {
	columnTitle: {
		color: 'text.primary',
		fontWeight: 700,
		fontSize: '0.75rem',
		textTransform: 'uppercase',
		letterSpacing: '0.15em',
		mb: 3,
	},
	link: {
		display: 'flex',
		alignItems: 'center',
		gap: 1.5,
		color: 'text.secondary',
		cursor: 'pointer',
		transition: 'all 0.2s ease',
	},
	icon: {
		fontSize: '1.1rem',
		color: alpha(palette.text.secondary, 0.4),
		transition: 'color 0.2s ease',
	},
};

export interface FooterLink {
	label: string;
	icon: ReactNode;
	path: string;
	color?: 'primary' | 'warning' | 'info' | 'success' | 'error' | 'secondary';
}

export interface FooterSection {
	title: string;
	links: FooterLink[];
}

export const FOOTER_SECTIONS: FooterSection[] = [
	{
		title: 'Product',
		links: [
			{
				label: 'Sign In',
				icon: <LoginIcon sx={styles.icon} className='link-icon' />,
				path: '/login',
				color: 'primary',
			},
			{
				label: 'Get Started',
				icon: <RegisterIcon sx={styles.icon} className='link-icon' />,
				path: '/register',
				color: 'warning',
			},
			{
				label: 'AI Features',
				icon: <FeaturesIcon sx={styles.icon} className='link-icon' />,
				path: '/#features',
				color: 'secondary',
			},
		],
	},
	{
		title: 'Resources',
		links: [
			{
				label: 'Documentation',
				icon: <DocsIcon sx={styles.icon} className='link-icon' />,
				path: '/docs',
				color: 'info',
			},
			{
				label: 'Open Source',
				icon: <GitHubIcon sx={styles.icon} className='link-icon' />,
				path: 'https://github.com',
				color: 'success',
			},
			{
				label: 'Help Center',
				icon: <HelpIcon sx={styles.icon} className='link-icon' />,
				path: '/help',
				color: 'error',
			},
		],
	},
];

interface FooterLinkItemProps {
	link: FooterLink;
}

export function FooterLinkItem({ link }: FooterLinkItemProps) {
	const router = useRouter();
	const hoverColor =
		link.color ?
			(palette[link.color] as { light: string }).light
		:	palette.primary.light;

	const handleClick = () => {
		if (link.path.startsWith('http')) {
			window.open(link.path, '_blank');
		} else {
			router.push(link.path);
		}
	};

	return (
		<Box
			sx={[
				styles.link,
				{
					'&:hover': {
						color: hoverColor,
						transform: 'translateX(4px)',
						'& .link-icon': {
							color: hoverColor,
						},
					},
				},
			]}
			onClick={handleClick}>
			{link.icon}
			<Typography variant='body2'>{link.label}</Typography>
		</Box>
	);
}

export function FooterLinks() {
	return (
		<Grid container spacing={{ xs: 4, sm: 6, md: 8 }}>
			{FOOTER_SECTIONS.map((section) => (
				<Grid
					key={section.title}
					size={{ xs: 6, sm: 'auto' }}
					sx={{ minWidth: 160 }}>
					<Typography variant='overline' sx={styles.columnTitle} component='h3'>
						{section.title}
					</Typography>
					<Stack spacing={2}>
						{section.links.map((link) => (
							<FooterLinkItem key={link.label} link={link} />
						))}
					</Stack>
				</Grid>
			))}
		</Grid>
	);
}
