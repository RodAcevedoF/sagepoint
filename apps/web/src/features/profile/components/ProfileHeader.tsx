"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  alpha,
  Chip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { Camera, X, Shield, CheckCircle, Verified } from "lucide-react";
import { Card, useSnackbar } from "@/shared/components";
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

    // Reset input so the same file can be re-selected
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

    // Show instant local preview
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

  return (
    <Card variant="glass" sx={styles.profileCard} hoverable={false}>
      <Card.Content sx={{ textAlign: "center", py: 5, px: 3 }}>
        {/* Avatar with edit overlay */}
        <Box sx={styles.avatarWrapper}>
          <Avatar src={localPreview ?? user.avatarUrl} sx={styles.avatar}>
            {initials}
          </Avatar>

          {/* Remove button — visible on hover */}
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
                bgcolor: alpha(theme.palette.error.main, 0.85),
                cursor: "pointer",
                zIndex: 2,
                opacity: 0,
                transform: "scale(0.8)",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: theme.palette.error.main,
                  transform: "scale(1.1)",
                },
              }}
            >
              <X size={16} color="#fff" />
            </Box>
          )}

          {/* Edit overlay */}
          <Box
            className="avatar-overlay"
            sx={{
              ...styles.avatarOverlay,
              ...(uploading && { opacity: 1 }),
            }}
            component="label"
          >
            {uploading ? (
              <CircularProgress size={32} sx={{ color: "primary.light" }} />
            ) : (
              <Camera size={32} color={theme.palette.primary.light} />
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

        {/* Name & Email */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 0.5,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {user.name}
            </Typography>
            <Verified size={18} color={theme.palette.primary.light} />
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ wordBreak: "break-word" }}
          >
            {user.email}
          </Typography>
        </Box>

        {/* Role Badge */}
        <Chip
          icon={isAdmin ? <Shield size={14} /> : <CheckCircle size={14} />}
          label={isAdmin ? "Administrator" : "Member"}
          size="small"
          sx={{
            py: 2,
            px: 1,
            borderRadius: 2,
            bgcolor: alpha(
              isAdmin ? theme.palette.warning.main : theme.palette.primary.main,
              0.1,
            ),
            color: isAdmin
              ? theme.palette.warning.light
              : theme.palette.primary.light,
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            "& .MuiChip-icon": {
              color: "inherit",
            },
            border: `1px solid ${alpha(isAdmin ? theme.palette.warning.main : theme.palette.primary.main, 0.2)}`,
          }}
        />
      </Card.Content>
    </Card>
  );
}
