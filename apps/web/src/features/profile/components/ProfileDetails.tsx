"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  IconButton,
  useTheme,
} from "@mui/material";
import { User, Mail, Pencil, X, Check, Settings } from "lucide-react";
import { useSnackbar } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import type { UserDto } from "@/application/profile/queries/get-profile.query";
import { useUpdateProfileCommand } from "@/application/profile/commands/update-profile.command";
import { makeStyles } from "./Profile.styles";

interface ProfileDetailsProps {
  user: UserDto;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  editable?: boolean;
  onSave?: (value: string) => Promise<void>;
  accent?: string;
}

function DetailRow({
  icon,
  label,
  value,
  editable,
  onSave,
  accent,
}: DetailRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const theme = useTheme();
  const styles = makeStyles(theme);

  const handleSave = async () => {
    if (!onSave || editValue === value) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch {
      // surfaced via snackbar in onSave
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <Box sx={styles.fieldRow}>
      <Box sx={styles.fieldIcon(accent)}>{icon}</Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography component="div" sx={styles.fieldLabel}>
          {label}
        </Typography>
        {isEditing ? (
          <TextField
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            size="small"
            fullWidth
            autoFocus
            sx={{
              mt: 1,
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
            }}
          />
        ) : (
          <Typography component="div" sx={styles.fieldValue}>
            {value}
          </Typography>
        )}
      </Box>

      {editable && (
        <Box sx={{ flexShrink: 0, alignSelf: "center" }}>
          {isEditing ? (
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                onClick={handleSave}
                disabled={isSaving}
                sx={{
                  color: auroraPalette.teal,
                  bgcolor: auroraTint(auroraPalette.teal, 0.1),
                  borderRadius: "10px",
                  border: `1px solid ${auroraTint(auroraPalette.teal, 0.3)}`,
                  "&:hover": {
                    bgcolor: auroraTint(auroraPalette.teal, 0.18),
                  },
                }}
              >
                <Check size={16} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCancel}
                sx={{
                  color: auroraPalette.status.fail,
                  bgcolor: auroraTint(auroraPalette.status.fail, 0.1),
                  borderRadius: "10px",
                  border: `1px solid ${auroraTint(auroraPalette.status.fail, 0.3)}`,
                  "&:hover": {
                    bgcolor: auroraTint(auroraPalette.status.fail, 0.18),
                  },
                }}
              >
                <X size={16} />
              </IconButton>
            </Stack>
          ) : (
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
              sx={styles.fieldEdit}
            >
              <Pencil size={16} />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
}

export function ProfileDetails({ user }: ProfileDetailsProps) {
  const { execute: updateProfile } = useUpdateProfileCommand();
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const styles = makeStyles(theme);

  const handleUpdateName = async (name: string) => {
    const result = await updateProfile({ name });
    if (result.ok)
      showSnackbar("Name updated successfully", { severity: "success" });
    else showSnackbar("Failed to update name", { severity: "error" });
  };

  return (
    <Box sx={styles.panel}>
      <Box sx={styles.panelHead}>
        <Box sx={styles.panelIcon()}>
          <Settings size={20} />
        </Box>
        <Typography component="h2" sx={styles.panelTitle}>
          Account Details
        </Typography>
      </Box>
      <Box sx={styles.panelUnderline()} />

      <Stack spacing={1.75}>
        <DetailRow
          icon={<User size={20} />}
          label="Full Name"
          value={user.name}
          editable
          onSave={handleUpdateName}
          accent={auroraPalette.teal}
        />
        <DetailRow
          icon={<Mail size={20} />}
          label="Email Address"
          value={user.email}
          accent={auroraPalette.status.concept}
        />
      </Stack>
    </Box>
  );
}
