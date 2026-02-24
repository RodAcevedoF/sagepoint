'use client';

import { useState } from 'react';
import {
	Box,
	Typography,
	TextField,
	Button,
	Stack,
	alpha,
	useTheme,
} from '@mui/material';
import { Target, Rocket } from 'lucide-react';
import { Card, useSnackbar } from '@/common/components';
import { UserDto } from '@/infrastructure/api/authApi';
import { useUpdateProfileCommand } from '@/application/profile/commands/update-profile.command';
import { makeStyles } from './Profile.styles';

interface ProfileLearningProps {
	user: UserDto;
}

export function ProfileLearning({ user }: ProfileLearningProps) {
	const [isEditingGoal, setIsEditingGoal] = useState(false);
	const [goalValue, setGoalValue] = useState(user.learningGoal || '');
	const { execute: updateProfile, isLoading } = useUpdateProfileCommand();
	const { showSnackbar } = useSnackbar();
	const theme = useTheme();
	const styles = makeStyles(theme);

	const handleSaveGoal = async () => {
		try {
			await updateProfile({ learningGoal: goalValue });
			showSnackbar('Learning goal updated', { severity: 'success' });
			setIsEditingGoal(false);
		} catch {
			showSnackbar('Failed to update learning goal', { severity: 'error' });
		}
	};

	return (
		<Card variant='glass' sx={styles.profileCard} hoverable={false}>
			<Card.Content sx={{ p: { xs: 2.5, md: 4 } }}>
				<Typography variant='h6' sx={styles.sectionTitle}>
					<Rocket size={20} />
					Learning Journey
				</Typography>

				{/* Learning Goal */}
				<Box sx={styles.goalBox}>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						alignItems={{ xs: 'flex-start', sm: 'center' }}
						spacing={2}
						sx={{ mb: 3 }}>
						<Box sx={styles.iconBox(theme.palette.secondary.light)}>
							<Target size={22} />
						</Box>
						<Box sx={{ flex: 1 }}>
							<Typography
								variant='subtitle1'
								sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
								Your Primary Goal
							</Typography>
							<Typography variant='caption' color='text.secondary'>
								This helps our AI personalize your roadmaps
							</Typography>
						</Box>
						{!isEditingGoal && (
							<Button
								variant='outlined'
								onClick={() => setIsEditingGoal(true)}
								sx={styles.actionButton}>
								Change
							</Button>
						)}
					</Stack>

					{isEditingGoal ?
						<Box sx={{ mt: 2 }}>
							<TextField
								fullWidth
								multiline
								rows={4}
								value={goalValue}
								onChange={(e) => setGoalValue(e.target.value)}
								placeholder='Ex: I want to become a Senior Frontend Engineer by mastering React and System Design...'
								sx={{
									bgcolor: alpha(theme.palette.background.paper, 0.5),
									'& .MuiOutlinedInput-root': {
										borderRadius: 3,
									},
								}}
							/>
							<Stack
								direction='row'
								spacing={1.5}
								sx={{ mt: 2, justifyContent: 'flex-end' }}>
								<Button
									variant='contained'
									onClick={handleSaveGoal}
									disabled={isLoading}
									sx={styles.actionButton}>
									Save Goal
								</Button>
								<Button
									variant='outlined'
									onClick={() => {
										setGoalValue(user.learningGoal || '');
										setIsEditingGoal(false);
									}}
									sx={styles.actionButton}>
									Cancel
								</Button>
							</Stack>
						</Box>
					:	<Box
							sx={{
								p: 2.5,
								borderRadius: 3,
								bgcolor: alpha(theme.palette.common.white, 0.03),
								border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
							}}>
							<Typography
								variant='body1'
								sx={{
									fontStyle: goalValue ? 'normal' : 'italic',
									color: goalValue ? 'text.primary' : 'text.disabled',
									lineHeight: 1.6,
								}}>
								{goalValue ||
									'No learning goal set yet. Add one to get better roadmap suggestions!'}
							</Typography>
						</Box>
					}
				</Box>
			</Card.Content>
		</Card>
	);
}
