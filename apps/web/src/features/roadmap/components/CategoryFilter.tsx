'use client';

import { Box, Chip, useTheme } from '@mui/material';
import { makeStyles } from './CategoryFilter.styles';

interface Category {
	id: string;
	name: string;
}

interface CategoryFilterProps {
	categories: Category[];
	selectedCategory: string | null;
	onSelect: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
	const theme = useTheme();
	const styles = makeStyles(theme);

	return (
		<Box sx={styles.container}>
			<Chip
				label='All'
				size='small'
				onClick={() => onSelect(null)}
				sx={styles.chip(!selectedCategory)}
			/>
			{categories.map((cat) => (
				<Chip
					key={cat.id}
					label={cat.name}
					size='small'
					onClick={() => onSelect(cat.id)}
					sx={styles.chip(selectedCategory === cat.id)}
				/>
			))}
		</Box>
	);
}
