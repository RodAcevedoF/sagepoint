import { Box, Skeleton } from '@mui/material';
import { Card } from '@/common/components';

export function RoadmapCardSkeleton() {
	return (
		<Card variant='glass' hoverable={false}>
			<Card.Content>
				{/* Header: title + progress ring */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Skeleton variant='text' width='60%' height={28} animation='wave' />
						<Skeleton variant='text' width='90%' height={18} animation='wave' />
						<Skeleton variant='text' width='60%' height={18} animation='wave' />
					</Box>
					<Skeleton variant='circular' width={52} height={52} animation='wave' sx={{ flexShrink: 0 }} />
				</Box>

				{/* Status chip */}
				<Box sx={{ mb: 2 }}>
					<Skeleton variant='rounded' width={60} height={22} animation='wave' sx={{ borderRadius: 11 }} />
				</Box>

				{/* Stats row */}
				<Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
					<Skeleton variant='text' width={80} height={18} animation='wave' />
					<Skeleton variant='text' width={80} height={18} animation='wave' />
				</Box>

				{/* Difficulty chips */}
				<Box sx={{ display: 'flex', gap: 0.75 }}>
					<Skeleton variant='rounded' width={50} height={20} animation='wave' sx={{ borderRadius: 10 }} />
					<Skeleton variant='rounded' width={50} height={20} animation='wave' sx={{ borderRadius: 10 }} />
				</Box>
			</Card.Content>

			<Card.Footer>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Skeleton variant='text' width={80} height={18} animation='wave' />
					<Skeleton variant='rectangular' width={16} height={16} animation='wave' />
				</Box>
			</Card.Footer>
		</Card>
	);
}
