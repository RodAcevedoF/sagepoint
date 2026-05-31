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
import { Sparkles, Check, Plus, Wand2, Edit3 } from "lucide-react";
import { useSnackbar } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
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

  const predefinedIds = useMemo(
    () => new Set(categories?.map((c) => c.id) ?? []),
    [categories],
  );

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
    const interests = [
      ...selectedIds,
      ...customInterests.map((i) => `custom:${i}`),
    ];
    const result = await updateProfile({ interests });
    if (result.ok) {
      showSnackbar("Interests updated — your news feed will refresh shortly", {
        severity: "success",
      });
      setCustomInterests([]);
      setEditingIds(null);
    } else {
      showSnackbar("Failed to update interests", { severity: "error" });
    }
  };

  const handleCancel = () => {
    setEditingIds(null);
    setCustomInterests([]);
    setCustomInput("");
  };

  const hasAnyInterests = (user.interests ?? []).length > 0;

  return (
    <Box sx={styles.panel}>
      <Box sx={styles.panelHeadRow}>
        <Box>
          <Box sx={styles.panelHead}>
            <Box sx={styles.panelIcon()}>
              <Sparkles size={20} />
            </Box>
            <Typography component="h2" sx={styles.panelTitle}>
              Interests
            </Typography>
          </Box>
          <Box sx={styles.panelUnderline()} />
        </Box>
        {!isEditing && (
          <Button
            onClick={() => setEditingIds(new Set(currentIds))}
            disabled={categoriesLoading}
            startIcon={<Edit3 size={16} />}
            sx={styles.btnTealOutline}
          >
            Edit
          </Button>
        )}
      </Box>

      <Typography component="p" sx={styles.interestsLede}>
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
      ) : hasAnyInterests ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {(user.interests ?? []).map((interest) => {
            const isCustom =
              !categoriesLoading && !predefinedIds.has(interest.id);
            return (
              <Chip
                key={interest.id}
                label={interest.name}
                icon={<Check size={14} />}
                variant="filled"
                sx={
                  isCustom
                    ? styles.customInterestChip
                    : styles.interestChip(true, false)
                }
              />
            );
          })}
        </Box>
      ) : (
        <Box sx={styles.interestEmpty}>
          <Box sx={styles.interestEmptyIcon}>
            <Wand2 size={20} />
          </Box>
          <Typography component="p">
            No interests selected yet. Click{" "}
            <Box component="b" sx={{ color: auroraPalette.teal }}>
              Edit
            </Box>{" "}
            to add some.
          </Typography>
        </Box>
      )}

      {isEditing && (
        <TextField
          size="small"
          placeholder="Add a custom topic..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value.slice(0, 50))}
          onKeyDown={handleKeyDown}
          sx={{
            mt: 2,
            "& .MuiOutlinedInput-root": {
              color: auroraPalette.txHi,
              background: auroraPalette.surface2,
              borderRadius: auroraPalette.radii.sm,
              "& fieldset": { borderColor: auroraPalette.line },
              "&:hover fieldset": { borderColor: auroraPalette.line2 },
              "&.Mui-focused fieldset": {
                borderColor: auroraTint(auroraPalette.teal, 0.5),
              },
            },
            "& input::placeholder": {
              color: auroraPalette.txLow,
              opacity: 1,
            },
          }}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={addCustomInterest}
                  disabled={!customInput.trim()}
                  sx={{ color: auroraPalette.teal }}
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
          <Button onClick={handleCancel} sx={styles.btnGhost}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            sx={styles.btnTealSolid}
          >
            Save
          </Button>
        </Stack>
      )}
    </Box>
  );
}
