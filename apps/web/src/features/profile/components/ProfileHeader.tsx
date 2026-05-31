"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Chip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { Camera, X, Shield, CheckCircle, BadgeCheck } from "lucide-react";
import { useSnackbar } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import type { UserDto } from "@/application/profile/queries/get-profile.query";
import { useUploadAvatarCommand } from "@/application/profile/commands/upload-avatar.command";
import { useUpdateProfileCommand } from "@/application/profile/commands/update-profile.command";
import { makeStyles } from "./Profile.styles";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ProfileHeaderProps {
  user: UserDto;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const { showSnackbar } = useSnackbar();
  const { execute: uploadAvatar } = useUploadAvatarCommand();
  const { execute: updateProfile } = useUpdateProfileCommand();
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    if (!ACCEPTED_TYPES.includes(file.type)) {
      showSnackbar("Please select a JPEG, PNG, WebP, or GIF image", {
        severity: "error",
      });
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      showSnackbar("Image must be under 5 MB", { severity: "error" });
      return;
    }

    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);

    setUploading(true);
    const uploadResult = await uploadAvatar(file);
    if (uploadResult.ok) {
      showSnackbar("Avatar updated", { severity: "success" });
    } else {
      setLocalPreview(null);
      showSnackbar("Failed to upload avatar", { severity: "error" });
    }
    setUploading(false);
  };

  const handleAvatarRemove = async () => {
    setUploading(true);
    setLocalPreview(null);
    const result = await updateProfile({ avatarUrl: "" });
    if (result.ok) showSnackbar("Avatar removed", { severity: "success" });
    else showSnackbar("Failed to remove avatar", { severity: "error" });
    setUploading(false);
  };

  const hasAvatar = !!(localPreview ?? user.avatarUrl);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isAdmin = user.role === "ADMIN";
  const roleAccent = isAdmin
    ? auroraPalette.status.proc
    : auroraPalette.status.ready;

  return (
    <Box sx={[styles.panel, styles.identityCard]}>
      <Box sx={styles.avatarWrapper}>
        <Avatar src={localPreview ?? user.avatarUrl} sx={styles.avatar}>
          {initials}
        </Avatar>

        {hasAvatar && !uploading && (
          <Box
            className="avatar-remove"
            onClick={handleAvatarRemove}
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: auroraTint(auroraPalette.status.fail, 0.85),
              cursor: "pointer",
              zIndex: 3,
              opacity: 0,
              transform: "scale(0.8)",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: auroraPalette.status.fail,
                transform: "scale(1.1)",
              },
            }}
          >
            <X size={16} color="#fff" />
          </Box>
        )}

        <Box
          className="avatar-overlay"
          sx={{
            ...styles.avatarOverlay,
            ...(uploading && { opacity: 1 }),
          }}
          component="label"
        >
          {uploading ? (
            <CircularProgress size={32} sx={{ color: auroraPalette.teal }} />
          ) : (
            <Camera size={32} color={auroraPalette.teal} />
          )}
          <input
            hidden
            accept="image/jpeg,image/png,image/webp,image/gif"
            type="file"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </Box>
      </Box>

      <Box component="span" sx={styles.identityName}>
        {user.name}
        <BadgeCheck
          size={20}
          color={auroraPalette.teal}
          aria-label="verified"
        />
      </Box>
      <Typography component="p" sx={styles.identityEmail}>
        {user.email}
      </Typography>

      <Chip
        icon={isAdmin ? <Shield size={13} /> : <CheckCircle size={13} />}
        label={isAdmin ? "Administrator" : "Member"}
        size="small"
        sx={styles.roleChip(roleAccent)}
      />
    </Box>
  );
}
