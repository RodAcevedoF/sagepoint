'use client';

import { useState } from 'react';
import { useSubmitOnboardingCommand } from '@/application/onboarding/commands/submit-onboarding.command';
import { useCategoriesQuery } from '@/application/onboarding/queries/get-categories.query';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';

const steps = ['Set Your Goal', 'Select Interests', 'Review'];

export function OnboardingFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const { data: categories = [], isLoading: isLoadingCategories } = useCategoriesQuery();
  const { execute: submitOnboarding, isLoading: isSubmitting } = useSubmitOnboardingCommand();

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      await submitOnboarding(goal, selectedInterests);
    } catch (error) {
      console.error('Onboarding failed', error);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              What is your main learning goal?
            </Typography>
            <TextField
              fullWidth
              label="e.g. Become a Senior DevOps Engineer"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              margin="normal"
              autoFocus
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Select topics you are interested in
            </Typography>
            {isLoadingCategories ? (
              <CircularProgress />
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categories.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.name}
                    clickable
                    color={selectedInterests.includes(cat.id) ? 'primary' : 'default'}
                    onClick={() => toggleInterest(cat.id)}
                    variant={selectedInterests.includes(cat.id) ? 'filled' : 'outlined'}
                  />
                ))}
                {categories.length === 0 && (
                  <Typography color="text.secondary">
                    No categories found. Admin needs to seed them.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Review your profile
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Learning Goal
                </Typography>
                <Typography variant="body1">{goal}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Interests
                </Typography>
                <Typography variant="body1">
                  {selectedInterests.length > 0
                    ? `${selectedInterests.length} topics selected`
                    : 'None selected'}
                </Typography>
              </Box>
            </Stack>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Welcome to SagePoint
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: '200px' }}>{renderCurrentStep()}</Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={(activeStep === 0 && !goal) || isSubmitting}
          >
            {activeStep === steps.length - 1
              ? isSubmitting
                ? 'Finishing...'
                : 'Finish'
              : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
