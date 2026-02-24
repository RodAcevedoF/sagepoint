import { Box, Grid, Skeleton } from '@mui/material';
import { Card } from '@/common/components';

export function DashboardSkeleton() {
	return (
		<Box>
			{/* Greeting */}
			<Box sx={{ mb: 4 }}>
				<Skeleton variant='text' width={250} height={36} animation='wave' />
				<Skeleton variant='text' width={180} height={22} animation='wave' />
			</Box>

			{/* Metrics row */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				{Array.from({ length: 4 }).map((_, i) => (
					<Grid key={i} size={{ xs: 6, md: 3 }}>
						<Card variant='glass' hoverable={false}>
							<Card.Content>
								<Skeleton variant='rounded' width={48} height={48} animation='wave' sx={{ borderRadius: 3, mb: 1.5 }} />
								<Skeleton variant='text' width={60} height={32} animation='wave' />
								<Skeleton variant='text' width={80} height={18} animation='wave' />
							</Card.Content>
						</Card>
					</Grid>
				))}
			</Grid>

			{/* Content grid */}
			<Grid container spacing={3} sx={{ mb: 3 }}>
				<Grid size={{ xs: 12, md: 6 }}>
					<Skeleton variant='rounded' height={200} animation='wave' sx={{ borderRadius: 6 }} />
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<Skeleton variant='rounded' height={200} animation='wave' sx={{ borderRadius: 6 }} />
				</Grid>
			</Grid>

			{/* Bottom row */}
			<Grid container spacing={3}>
				<Grid size={{ xs: 12, md: 6 }}>
					<Skeleton variant='rounded' height={150} animation='wave' sx={{ borderRadius: 6 }} />
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<Skeleton variant='rounded' height={150} animation='wave' sx={{ borderRadius: 6 }} />
				</Grid>
			</Grid>
		</Box>
	);
}
