'use client';

import { AppBarRoot } from './components/AppBarRoot';
import { AppBarItem } from './components/AppBarItem';
import { AppBarAction } from './components/AppBarAction';
import { AppBarGroup } from './components/AppBarGroup';
import { AppBarDivider } from './components/AppBarDivider';

// ============================================================================
// Compound Component Export
// ============================================================================

export const AppBar = Object.assign(AppBarRoot, {
	Item: AppBarItem,
	Action: AppBarAction,
	Group: AppBarGroup,
	Divider: AppBarDivider,
});

export type { AppBarProps } from './components/AppBarRoot';
export type { AppBarItemProps } from './components/AppBarItem';
export type { AppBarActionProps } from './components/AppBarAction';
export type { AppBarGroupProps } from './components/AppBarGroup';
