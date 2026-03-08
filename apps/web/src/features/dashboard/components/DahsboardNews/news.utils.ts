import { palette } from '@/common/theme';

const CATEGORY_COLORS: Record<string, string> = {
	'web-development': palette.info.main,
	'mobile-development': palette.success.main,
	'machine-learning': palette.warning.main,
	'data-science': palette.secondary.main,
	devops: palette.error.main,
	cybersecurity: palette.error.dark,
	'cloud-computing': palette.info.dark,
	databases: palette.success.dark,
	'programming-languages': palette.warning.dark,
	'system-design': palette.primary.main,
};

export function formatSlug(slug: string): string {
	return slug
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

export function getCategoryColor(slug: string): string {
	return CATEGORY_COLORS[slug] ?? palette.info.main;
}
