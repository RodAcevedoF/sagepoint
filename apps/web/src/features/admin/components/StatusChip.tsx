import { Chip, alpha } from '@mui/material';
import { palette } from '@/common/theme';

interface StatusChipProps {
	label: string;
	colorMap: Record<string, string>;
}

export function StatusChip({ label, colorMap }: StatusChipProps) {
	const color = colorMap[label] ?? palette.text.secondary;

	return (
		<Chip
			label={label}
			size='small'
			sx={{
				fontWeight: 700,
				fontSize: '0.8rem',
				borderRadius: '6px',
				bgcolor: alpha(color, 0.1),
				color,
				border: 'none',
			}}
		/>
	);
}
