'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Grid, Box, Button, CircularProgress, alpha } from '@mui/material';
import { RotateCcw } from 'lucide-react';
import { useAppSelector, useRoadmapEvents } from '@/common/hooks';
import { useSnackbar, Loader, EmptyState } from '@/common/components';
import { DashboardSkeleton } from './DashboardSkeleton';
import { useProfileQuery } from '@/application/auth/queries/get-profile.query';
import { useUserRoadmapsQuery } from '@/application/roadmap/queries/get-user-roadmaps.query';
import { useUserDocumentsQuery } from '@/application/document';
import { palette } from '@/common/theme';

import { DashboardLayout } from './DashboardLayout';
import { DashboardGreeting } from './DashboardGreeting';
import { DashboardMetrics } from './DashboardMetrics';
import { DashboardProgress } from './DashboardProgress';
import { DashboardActivity } from './DashboardActivity';
import { DashboardRecentDocuments } from './DashboardRecentDocuments';
import { DashboardTopics } from './DashboardTopics';
import { DashboardQuickActions } from './DashboardQuickActions';
import { DashboardNews } from './DashboardNews';

import {
	computeMetrics,
	computeRoadmapProgress,
	computeRecentRoadmaps,
	computeDifficultyDistribution,
} from '../utils/dashboard.utils';

// ============================================================================
// Component
// ============================================================================

export function Dashboard() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { showSnackbar } = useSnackbar();
	const { user } = useAppSelector((state) => state.auth);
	const [isResetting, setIsResetting] = useState(false);

	// Refetch profile to get latest onboarding status
	const { isLoading: isLoadingProfile, refetch } = useProfileQuery();

	const isCreatingFirstRoadmap = searchParams.get('creating') === 'roadmap';
	const creatingRoadmapId = searchParams.get('roadmapId');

	// SSE for first roadmap creation status
	const { status: sseStatus } = useRoadmapEvents(
		isCreatingFirstRoadmap ? creatingRoadmapId : null,
	);

	// Fetch real roadmap data
	const {
		data: roadmaps,
		isLoading: isLoadingRoadmaps,
		refetch: refetchRoadmaps,
	} = useUserRoadmapsQuery();

	// Fetch documents
	const { data: documents, isLoading: isLoadingDocuments } =
		useUserDocumentsQuery();

	// Show login success toast (ref prevents double-firing in StrictMode)
	const toastShown = useRef(false);
	useEffect(() => {
		if (searchParams.get('login') === 'success' && !toastShown.current) {
			toastShown.current = true;
			showSnackbar('Welcome back!', { severity: 'success' });
			router.replace('/dashboard', { scroll: false });
		}
	}, [searchParams, showSnackbar, router]);

	// Dev only: Reset onboarding status
	const handleResetOnboarding = async () => {
		setIsResetting(true);
		try {
			await fetch(
				`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me/onboarding`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include', // Send cookies for auth
					body: JSON.stringify({ status: 'PENDING' }),
				},
			);
			await refetch();
			router.push('/onboarding');
		} catch (error) {
			console.error('Failed to reset onboarding:', error);
		} finally {
			setIsResetting(false);
		}
	};

	// Redirect to onboarding if not completed/skipped
	useEffect(() => {
		if (isLoadingProfile) return;
		if (isCreatingFirstRoadmap) return; // Skip when coming from onboarding
		// Default to PENDING if onboardingStatus is undefined (for existing users)
		const status = user?.onboardingStatus ?? 'PENDING';
		if (user && status === 'PENDING') {
			router.push('/onboarding');
		}
	}, [user, router, isLoadingProfile, isCreatingFirstRoadmap]);

	// When SSE says roadmap is completed, refetch and clear the param
	useEffect(() => {
		if (isCreatingFirstRoadmap && sseStatus === 'completed') {
			refetchRoadmaps();
			showSnackbar('Your first roadmap is ready!', { severity: 'success' });
			router.replace('/dashboard', { scroll: false });
		}
	}, [
		isCreatingFirstRoadmap,
		sseStatus,
		refetchRoadmaps,
		router,
		showSnackbar,
	]);

	// Fallback: if no SSE (no roadmapId), detect when skeleton roadmap becomes completed
	useEffect(() => {
		if (isCreatingFirstRoadmap && !creatingRoadmapId && roadmaps?.length) {
			const hasCompleted = roadmaps.some(
				(r) => r.roadmap.generationStatus === 'completed',
			);
			if (hasCompleted) {
				showSnackbar('Your first roadmap is ready!', { severity: 'success' });
				router.replace('/dashboard', { scroll: false });
			}
		}
	}, [
		isCreatingFirstRoadmap,
		creatingRoadmapId,
		roadmaps,
		router,
		showSnackbar,
	]);

	if (isLoadingProfile || isLoadingRoadmaps || isLoadingDocuments) {
		return (
			<DashboardLayout>
				<DashboardSkeleton />
			</DashboardLayout>
		);
	}

	const isDev = process.env.NODE_ENV === 'development';
	const userName = user?.name || 'Learner';
	const userRoadmaps = roadmaps ?? [];
	const userDocuments = documents ?? [];

	const metrics = computeMetrics(userRoadmaps);
	const progressItems = computeRoadmapProgress(userRoadmaps);
	const recentRoadmaps = computeRecentRoadmaps(userRoadmaps);
	const difficultyDistribution = computeDifficultyDistribution(userRoadmaps);

	// Only count completed roadmaps for the "has content" check
	const hasCompletedRoadmaps = userRoadmaps.some(
		(r) => r.roadmap.generationStatus === 'completed',
	);
	const hasDocuments = userDocuments.length > 0;

	return (
		<DashboardLayout>
			{/* Greeting */}
			<DashboardGreeting
				userName={userName}
				stepsCompleted={metrics.totalStepsCompleted}
			/>

			{/* Metrics Row */}
			<DashboardMetrics metrics={metrics} />

			{hasCompletedRoadmaps ?
				<Grid container spacing={3}>
					{/* Left Column - Progress & Activity */}
					<Grid size={{ xs: 12, lg: 8 }}>
						<Grid container spacing={3}>
							<Grid size={{ xs: 12, md: 6 }}>
								<DashboardProgress data={progressItems} />
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<DashboardActivity roadmaps={recentRoadmaps} />
							</Grid>
							{hasDocuments && (
								<Grid size={{ xs: 12, md: 6 }}>
									<DashboardRecentDocuments documents={userDocuments} />
								</Grid>
							)}
							<Grid size={{ xs: 12, md: hasDocuments ? 6 : 12 }}>
								<DashboardNews />
							</Grid>
						</Grid>
					</Grid>

					{/* Right Column - Difficulty Distribution */}
					{difficultyDistribution.length > 0 && (
						<Grid size={{ xs: 12, lg: 4 }}>
							<DashboardTopics
								distribution={difficultyDistribution}
								overallProgress={metrics.overallProgress}
							/>
						</Grid>
					)}

					{/* Full Width - Quick Actions */}
					<Grid size={{ xs: 12 }}>
						<DashboardQuickActions />
					</Grid>

					{/* Dev Tools */}
					{isDev && (
						<Grid size={{ xs: 12 }}>
							<Box
								sx={{
									mt: 4,
									p: 2,
									borderRadius: 2,
									border: `1px dashed ${alpha(palette.warning.main, 0.5)}`,
									bgcolor: alpha(palette.warning.main, 0.05),
								}}>
								<Button
									variant='outlined'
									color='warning'
									size='small'
									startIcon={
										isResetting ?
											<CircularProgress size={16} />
										:	<RotateCcw size={16} />
									}
									onClick={handleResetOnboarding}
									disabled={isResetting}>
									{isResetting ? 'Resetting...' : 'Reset Onboarding (Dev)'}
								</Button>
							</Box>
						</Grid>
					)}
				</Grid>
			: isCreatingFirstRoadmap ?
				<>
					<Loader variant='page' message='Creating your first roadmap...' />
				</>
			:	<>
					<EmptyState
						title='No roadmaps yet'
						description='Create your first learning roadmap to get started'
						actionLabel='Create Roadmap'
						onAction={() => router.push('/roadmaps/create')}
					/>
					{/* Dev Tools */}
					{isDev && (
						<Box
							sx={{
								mt: 4,
								p: 2,
								borderRadius: 2,
								border: `1px dashed ${alpha(palette.warning.main, 0.5)}`,
								bgcolor: alpha(palette.warning.main, 0.05),
							}}>
							<Button
								variant='outlined'
								color='warning'
								size='small'
								startIcon={
									isResetting ?
										<CircularProgress size={16} />
									:	<RotateCcw size={16} />
								}
								onClick={handleResetOnboarding}
								disabled={isResetting}>
								{isResetting ? 'Resetting...' : 'Reset Onboarding (Dev)'}
							</Button>
						</Box>
					)}
				</>
			}
		</DashboardLayout>
	);
}
