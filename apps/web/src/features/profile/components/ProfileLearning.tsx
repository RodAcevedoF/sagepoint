"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import { Target, Rocket, Edit3 } from "lucide-react";
import { useSnackbar } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import type { UserDto } from "@/application/profile/queries/get-profile.query";
import { useUpdateProfileCommand } from "@/application/profile/commands/update-profile.command";
import { makeStyles } from "./Profile.styles";

interface ProfileLearningProps {
  user: UserDto;
}

export function ProfileLearning({ user }: ProfileLearningProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(user.learningGoal || "");
  const { execute: updateProfile, isLoading } = useUpdateProfileCommand();
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const styles = makeStyles(theme);

  const handleSaveGoal = async () => {
    const result = await updateProfile({ learningGoal: goalValue });
    if (result.ok) {
      showSnackbar("Learning goal updated", { severity: "success" });
      setIsEditingGoal(false);
    } else {
      showSnackbar("Failed to update learning goal", { severity: "error" });
    }
  };

  return (
    <Box sx={styles.panel}>
      <Box sx={styles.panelHead}>
        <Box sx={styles.panelIcon()}>
          <Rocket size={20} />
        </Box>
        <Typography component="h2" sx={styles.panelTitle}>
          Learning Journey
        </Typography>
      </Box>
      <Box sx={styles.panelUnderline()} />

      <Box sx={styles.goalBox}>
        <Box sx={styles.goalIcon}>
          <Target size={22} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="div" sx={styles.goalTitle}>
            Your Primary Goal
          </Typography>
          <Typography component="div" sx={styles.goalSub}>
            This helps our AI personalize your roadmaps
          </Typography>
        </Box>
        {!isEditingGoal && (
          <Button
            onClick={() => setIsEditingGoal(true)}
            startIcon={<Edit3 size={16} />}
            sx={styles.btnTealOutline}
          >
            Change
          </Button>
        )}
      </Box>

      {isEditingGoal ? (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={goalValue}
            onChange={(e) => setGoalValue(e.target.value)}
            placeholder="Ex: I want to become a Senior Frontend Engineer by mastering React and System Design..."
            sx={{
              "& .MuiOutlinedInput-root": {
                color: auroraPalette.txHi,
                background: "oklch(0.27 0.022 262 / 0.4)",
                borderRadius: auroraPalette.radii.md,
                "& fieldset": { borderColor: auroraPalette.line },
                "&:hover fieldset": { borderColor: auroraPalette.line2 },
                "&.Mui-focused fieldset": {
                  borderColor: auroraTint(auroraPalette.teal, 0.5),
                },
              },
              "& textarea::placeholder": {
                color: auroraPalette.txLow,
                opacity: 1,
              },
            }}
          />
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 2, justifyContent: "flex-end" }}
          >
            <Button
              onClick={() => {
                setGoalValue(user.learningGoal || "");
                setIsEditingGoal(false);
              }}
              sx={styles.btnGhost}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveGoal}
              disabled={isLoading}
              sx={styles.btnTealSolid}
            >
              Save Goal
            </Button>
          </Stack>
        </Box>
      ) : goalValue ? (
        <Typography component="div" sx={styles.goalDisplay}>
          {goalValue}
        </Typography>
      ) : (
        <Box sx={styles.emptyNote}>
          No learning goal set yet. Add one to get better roadmap suggestions!
        </Box>
      )}
    </Box>
  );
}
