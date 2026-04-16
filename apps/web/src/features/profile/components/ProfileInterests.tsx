"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
} from "@mui/material";
import { Sparkles, Check, Plus } from "lucide-react";
import { Card, useSnackbar } from "@/shared/components";
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
  const { data: categories, isLoading: categoriesLoading } =
    useCategoriesQuery();
  const { execute: updateProfile, isLoading } = useUpdateProfileCommand();

  const currentIds = useMemo(
    () => new Set(user.interests?.map((i) => i.id) ?? []),
    [user.interests],
  );

  // IDs of seeded/predefined categories so we can tell custom ones apart
  const predefinedIds = useMemo(
    () => new Set(categories?.map((c) => c.id) ?? []),
    [categories],
  );

  // Custom categories the user already has (saved previously, not in the seeded list)
  const savedCustomInterests = useMemo(
    () => (user.interests ?? []).filter((i) => !predefinedIds.has(i.id)),
    [user.interests, predefinedIds],
  );

  const [editingIds, setEditingIds] = useState<Set<string> | null>(null);
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  const isEditing = editingIds !== null;
  const selectedIds = editingIds ?? currentIds;

  const hasChanges = useMemo(() => {
    if (customInterests.length > 0) return true;
    if (selectedIds.size !== currentIds.size) return true;
    for (const id of selectedIds) {
      if (!currentIds.has(id)) return true;
    }
    return false;
  }, [selectedIds, currentIds, customInterests]);

  const toggleCategory = (id: string) => {
    setEditingIds((prev) => {
      const next = new Set(prev ?? currentIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addCustomInterest = () => {
    const trimmed = customInput.trim().slice(0, 50);
    if (!trimmed) return;
    const alreadyExists =
      customInterests.includes(trimmed) ||
      savedCustomInterests.some(
        (i) => i.name.toLowerCase() === trimmed.toLowerCase(),
      );
    if (!alreadyExists) {
      setCustomInterests((prev) => [...prev, trimmed]);
    }
    setCustomInput("");
  };

  const removeCustomInterest = (name: string) => {
    setCustomInterests((prev) => prev.filter((i) => i !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomInterest();
    }
  };

  const handleSave = async () => {
    try {
      const interests = [
        ...selectedIds,
        ...customInterests.map((i) => `custom:${i}`),
      ];
      await updateProfile({ interests });
      showSnackbar("Interests updated — your news feed will refresh shortly", {
        severity: "success",
      });
      setCustomInterests([]);
      setEditingIds(null);
    } catch {
      showSnackbar("Failed to update interests", { severity: "error" });
    }
  };

  const handleCancel = () => {
    setEditingIds(null);
    setCustomInterests([]);
    setCustomInput("");
  };

  return (
    <Card variant="glass" sx={styles.profileCard} hoverable={false}>
      <Card.Content sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" sx={styles.sectionTitle}>
            <Sparkles size={20} />
            Interests
          </Typography>
          {!isEditing && (
            <Button
              variant="outlined"
              onClick={() => setEditingIds(new Set(currentIds))}
              disabled={categoriesLoading}
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

        {isEditing ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {categories?.map((cat) => {
              const isSelected = selectedIds.has(cat.id);
              return (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  icon={isSelected ? <Check size={14} /> : undefined}
                  onClick={() => toggleCategory(cat.id)}
                  variant={isSelected ? "filled" : "outlined"}
                  sx={styles.interestChip(isSelected, true)}
                />
              );
            })}
            {savedCustomInterests.map((interest) => {
              const isSelected = selectedIds.has(interest.id);
              return (
                <Chip
                  key={interest.id}
                  label={interest.name}
                  icon={isSelected ? <Check size={14} /> : undefined}
                  onClick={() => toggleCategory(interest.id)}
                  variant={isSelected ? "filled" : "outlined"}
                  sx={styles.interestChip(isSelected, true)}
                />
              );
            })}
            {customInterests.map((name) => (
              <Chip
                key={`new-${name}`}
                label={name}
                onDelete={() => removeCustomInterest(name)}
                sx={styles.customInterestChip}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {(user.interests ?? []).map((interest) => (
              <Chip
                key={interest.id}
                label={interest.name}
                icon={<Check size={14} />}
                variant="filled"
                sx={{
                  ...styles.interestChip(true, false),
                  ...(!categoriesLoading &&
                    !predefinedIds.has(interest.id) &&
                    styles.customInterestChip),
                }}
              />
            ))}
            {(user.interests ?? []).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No interests selected yet. Click Edit to add some.
              </Typography>
            )}
          </Box>
        )}

        {isEditing && (
          <TextField
            size="small"
            placeholder="Add a custom topic..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value.slice(0, 50))}
            onKeyDown={handleKeyDown}
            sx={{ mt: 2 }}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={addCustomInterest}
                    disabled={!customInput.trim()}
                    sx={{ color: theme.palette.primary.light }}
                  >
                    <Plus size={18} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}

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
