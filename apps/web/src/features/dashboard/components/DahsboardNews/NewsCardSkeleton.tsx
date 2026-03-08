import { Box, Skeleton } from '@mui/material';
import { styles } from './news.styles';

export function NewsCardSkeleton() {
	return (
		<Box sx={styles.skeletonCard}>
			<Skeleton
				variant='rounded'
				width={44}
				height={44}
				sx={{ borderRadius: 2 }}
				animation='wave'
			/>
			<Skeleton variant='text' width='40%' height={16} animation='wave' />
			<Skeleton variant='text' width='90%' height={20} animation='wave' />
			<Skeleton variant='text' width='100%' height={16} animation='wave' />
			<Skeleton variant='text' width='70%' height={16} animation='wave' />
		</Box>
	);
}
