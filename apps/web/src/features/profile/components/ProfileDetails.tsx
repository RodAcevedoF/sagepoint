"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  alpha,
  IconButton,
} from "@mui/material";
import { User, Mail, Pencil, X, Check } from "lucide-react";
import { Card, useSnackbar } from "@/common/components";
import { palette } from "@/common/theme";
import { UserDto } from "@/infrastructure/api/authApi";
import { useUpdateProfileCommand } from "@/application/profile/commands/update-profile.command";

interface ProfileDetailsProps {
  user: UserDto;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  editable?: boolean;
  onSave?: (value: string) => Promise<void>;
}

function DetailRow({ icon, label, value, editable, onSave }: DetailRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave || editValue === value) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 2,
        px: 2,
        borderRadius: 2,
        bgcolor: alpha(palette.primary.main, 0.03),
        "&:hover": editable ? { bgcolor: alpha(palette.primary.main, 0.06) } : {},
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(palette.primary.main, 0.1),
          color: palette.primary.light,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          {label}
        </Typography>
        {isEditing ? (
          <TextField
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            size="small"
            fullWidth
            autoFocus
            sx={{ mt: 0.5 }}
          />
        ) : (
          <Typography variant="body1" sx={{ fontWeight: 500 }} noWrap>
            {value}
          </Typography>
        )}
      </Box>

      {editable && (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {isEditing ? (
            <>
              <IconButton
                size="small"
                onClick={handleSave}
                disabled={isSaving}
                sx={{ color: palette.success.main }}
              >
                <Check size={18} />
              </IconButton>
              <IconButton size="small" onClick={handleCancel} disabled={isSaving}>
                <X size={18} />
              </IconButton>
            </>
          ) : (
            <IconButton size="small" onClick={() => setIsEditing(true)}>
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

  const handleUpdateName = async (name: string) => {
    try {
      await updateProfile({ name });
      showSnackbar("Name updated successfully", { severity: "success" });
    } catch {
      showSnackbar("Failed to update name", { severity: "error" });
      throw new Error("Failed to update");
    }
  };

  return (
    <Card variant="glass" hoverable={false}>
      <Card.Content>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Account Details
        </Typography>

        <Stack spacing={2}>
          <DetailRow
            icon={<User size={20} />}
            label="Full Name"
            value={user.name}
            editable
            onSave={handleUpdateName}
          />
          <DetailRow
            icon={<Mail size={20} />}
            label="Email Address"
            value={user.email}
          />
        </Stack>
      </Card.Content>
    </Card>
  );
}
