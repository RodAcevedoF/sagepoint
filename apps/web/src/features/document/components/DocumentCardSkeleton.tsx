import { Box, Skeleton } from '@mui/material';
import { Card } from '@/common/components';

export function DocumentCardSkeleton() {
	return (
		<Card variant='glass' hoverable={false}>
			<Card.Content>
				{/* Header: icon + title + badge */}
				<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
					<Skeleton variant='rounded' width={44} height={44} animation='wave' sx={{ borderRadius: 2, flexShrink: 0 }} />
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Skeleton variant='text' width='70%' height={24} animation='wave' />
						<Skeleton variant='rounded' width={80} height={20} animation='wave' sx={{ borderRadius: 10, mt: 0.5 }} />
					</Box>
				</Box>

				{/* Stats row */}
				<Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
					<Skeleton variant='text' width={60} height={18} animation='wave' />
					<Skeleton variant='text' width={60} height={18} animation='wave' />
				</Box>
			</Card.Content>

			<Card.Footer>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Skeleton variant='text' width={70} height={18} animation='wave' />
					<Skeleton variant='rectangular' width={16} height={16} animation='wave' />
				</Box>
			</Card.Footer>
		</Card>
	);
}
