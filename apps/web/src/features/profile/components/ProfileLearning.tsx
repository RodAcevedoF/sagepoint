"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  alpha,
} from "@mui/material";
import { Target, Sparkles, Pencil } from "lucide-react";
import { Card, useSnackbar } from "@/common/components";
import { palette } from "@/common/theme";
import { UserDto } from "@/infrastructure/api/authApi";
import { useUpdateProfileCommand } from "@/application/profile/commands/update-profile.command";

interface ProfileLearningProps {
  user: UserDto;
}

export function ProfileLearning({ user }: ProfileLearningProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(user.learningGoal || "");
  const { execute: updateProfile, isLoading } = useUpdateProfileCommand();
  const { showSnackbar } = useSnackbar();

  const handleSaveGoal = async () => {
    try {
      await updateProfile({ learningGoal: goalValue });
      showSnackbar("Learning goal updated", { severity: "success" });
      setIsEditingGoal(false);
    } catch {
      showSnackbar("Failed to update learning goal", { severity: "error" });
    }
  };

  return (
    <Card variant="glass" hoverable={false}>
      <Card.Content>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Learning Preferences
        </Typography>

        {/* Learning Goal */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(palette.primary.main, 0.1),
                color: palette.primary.light,
              }}
            >
              <Target size={18} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
              Learning Goal
            </Typography>
            {!isEditingGoal && (
              <Button
                size="small"
                startIcon={<Pencil size={14} />}
                onClick={() => setIsEditingGoal(true)}
              >
                Edit
              </Button>
            )}
          </Box>

          {isEditingGoal ? (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                placeholder="What do you want to learn?"
                sx={{ mb: 2 }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSaveGoal}
                  disabled={isLoading}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setGoalValue(user.learningGoal || "");
                    setIsEditingGoal(false);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          ) : (
            <Typography
              variant="body2"
              color={user.learningGoal ? "text.primary" : "text.secondary"}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(palette.primary.main, 0.03),
                fontStyle: user.learningGoal ? "normal" : "italic",
              }}
            >
              {user.learningGoal || "No learning goal set yet"}
            </Typography>
          )}
        </Box>

        {/* Interests */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(palette.primary.main, 0.1),
                color: palette.primary.light,
              }}
            >
              <Sparkles size={18} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Interests
            </Typography>
          </Box>

          {user.interests && user.interests.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {user.interests.map((interest) => (
                <Chip
                  key={interest.id}
                  label={interest.name}
                  size="small"
                  sx={{
                    bgcolor: alpha(palette.primary.main, 0.1),
                    color: palette.primary.light,
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(palette.primary.main, 0.03),
                fontStyle: "italic",
              }}
            >
              No interests selected yet
            </Typography>
          )}
        </Box>
      </Card.Content>
    </Card>
  );
}
