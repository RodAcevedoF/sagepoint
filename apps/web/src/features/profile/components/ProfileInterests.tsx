"use client";

import { useState, useMemo } from "react";
import { Box, Typography, Chip, Button, Stack, useTheme } from "@mui/material";
import { Sparkles, Check } from "lucide-react";
import { Card, useSnackbar } from "@/common/components";
import { useCategoriesQuery } from "@/application/onboarding/queries/get-categories.query";
import { useUpdateProfileCommand } from "@/application/profile/commands/update-profile.command";
import type { UserDto } from "@/application/profile/queries/get-profile.query";
import { makeStyles } from "./Profile.styles";

interface ProfileInterestsProps {
  user: UserDto;
}

export function ProfileInterests({ user }: ProfileInterestsProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const { showSnackbar } = useSnackbar();
  const { data: categories } = useCategoriesQuery();
  const { execute: updateProfile, isLoading } = useUpdateProfileCommand();

  const currentIds = useMemo(
    () => new Set(user.interests?.map((i) => i.id) ?? []),
    [user.interests],
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(currentIds);
  const [isEditing, setIsEditing] = useState(false);

  const hasChanges = useMemo(() => {
    if (selectedIds.size !== currentIds.size) return true;
    for (const id of selectedIds) {
      if (!currentIds.has(id)) return true;
    }
    return false;
  }, [selectedIds, currentIds]);

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile({ interests: [...selectedIds] });
      showSnackbar("Interests updated — your news feed will refresh shortly", {
        severity: "success",
      });
      setIsEditing(false);
    } catch {
      showSnackbar("Failed to update interests", { severity: "error" });
    }
  };

  const handleCancel = () => {
    setSelectedIds(currentIds);
    setIsEditing(false);
  };

  return (
    <Card variant="glass" sx={styles.profileCard} hoverable={false}>
      <Card.Content sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" sx={styles.sectionTitle}>
            <Sparkles size={20} />
            Interests
          </Typography>
          {!isEditing && (
            <Button
              variant="outlined"
              onClick={() => setIsEditing(true)}
              sx={styles.actionButton}
            >
              Edit
            </Button>
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {isEditing
            ? "Select topics you want to learn about. This drives your news feed."
            : "Your selected interests drive the news feed and suggestions."}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {categories?.map((cat) => {
            const isSelected = selectedIds.has(cat.id);
            return (
              <Chip
                key={cat.id}
                label={cat.name}
                icon={isSelected ? <Check size={14} /> : undefined}
                onClick={isEditing ? () => toggleCategory(cat.id) : undefined}
                variant={isSelected ? "filled" : "outlined"}
                sx={styles.interestChip(isSelected, isEditing)}
              />
            );
          })}
        </Box>

        {isEditing && (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 3, justifyContent: "flex-end" }}
          >
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              sx={styles.actionButton}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={styles.actionButton}
            >
              Cancel
            </Button>
          </Stack>
        )}
      </Card.Content>
    </Card>
  );
}
