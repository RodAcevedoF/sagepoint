"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  alpha,
  Chip,
} from "@mui/material";
import { Camera, Shield, CheckCircle } from "lucide-react";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import { UserDto } from "@/infrastructure/api/authApi";

interface ProfileHeaderProps {
  user: UserDto;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [isHovering, setIsHovering] = useState(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isAdmin = user.role === "ADMIN";

  return (
    <Card variant="glass" hoverable={false}>
      <Card.Content sx={{ textAlign: "center", py: 5 }}>
        {/* Avatar with edit overlay */}
        <Box
          sx={{ position: "relative", display: "inline-block", mb: 3 }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Avatar
            src={user.avatarUrl}
            sx={{
              width: 120,
              height: 120,
              fontSize: "2.5rem",
              fontWeight: 600,
              bgcolor: alpha(palette.primary.main, 0.2),
              color: palette.primary.light,
              border: `3px solid ${alpha(palette.primary.light, 0.3)}`,
            }}
          >
            {initials}
          </Avatar>

          {/* Edit overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              bgcolor: alpha(palette.background.default, 0.7),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isHovering ? 1 : 0,
              transition: "opacity 0.2s ease",
              cursor: "pointer",
            }}
            component="label"
          >
            <Camera size={28} color={palette.primary.light} />
            <input hidden accept="image/*" type="file" />
          </Box>
        </Box>

        {/* Name & Email */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {user.email}
        </Typography>

        {/* Role Badge */}
        <Chip
          icon={isAdmin ? <Shield size={14} /> : <CheckCircle size={14} />}
          label={isAdmin ? "Administrator" : "Member"}
          size="small"
          sx={{
            bgcolor: alpha(isAdmin ? palette.warning.main : palette.primary.main, 0.15),
            color: isAdmin ? palette.warning.light : palette.primary.light,
            fontWeight: 600,
            "& .MuiChip-icon": {
              color: "inherit",
            },
          }}
        />
      </Card.Content>
    </Card>
  );
}
