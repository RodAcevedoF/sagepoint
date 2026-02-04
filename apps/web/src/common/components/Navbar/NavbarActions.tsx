"use client";

import { Stack, Avatar, IconButton, Tooltip, alpha } from "@mui/material";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, ShieldCheck, User } from "lucide-react";
import { Button } from "@/common/components/Button";
import { ButtonVariants } from "@/common/types";
import { useAppSelector } from "@/common/hooks";
import { useLogoutCommand } from "@/application/auth/commands/logout.command";
import { palette } from "@/common/theme";

const styles = {
  iconButton: {
    color: alpha(palette.text.primary, 0.7),
    transition: "all 0.2s",
    "&:hover": {
      color: palette.primary.light,
      bgcolor: alpha(palette.primary.main, 0.1),
    },
  },
};

interface NavbarActionsProps {
  mode?: "default" | "dashboard";
}

export function NavbarActions({ mode = "default" }: NavbarActionsProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { execute: handleLogout } = useLogoutCommand();

  const isAdmin = user?.role === "admin";

  // Dashboard Mode
  if (mode === "dashboard") {
    return (
      <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center">
        {/* Admin Button - Only visible for users with admin role */}
        {isAdmin && (
          <Tooltip title="Admin Panel">
            <IconButton
              sx={{
                ...styles.iconButton,
                color: palette.warning?.main || "#f59e0b",
              }}
              onClick={() => router.push("/admin")}
            >
              <ShieldCheck size={20} />
            </IconButton>
          </Tooltip>
        )}

        {/* Profile Button */}
        <Tooltip title="My Profile">
          <IconButton
            sx={styles.iconButton}
            onClick={() => router.push("/profile")}
          >
            <User size={20} />
          </IconButton>
        </Tooltip>

        {/* Sign Out Button - Desktop */}
        <Button
          label="Sign Out"
          variant={ButtonVariants.GHOST}
          icon={LogOut}
          onClick={handleLogout}
          sx={{
            ml: 1,
            display: { xs: "none", sm: "flex" },
          }}
        />

        {/* Sign Out Icon - Mobile */}
        <IconButton
          sx={{ ...styles.iconButton, display: { xs: "flex", sm: "none" } }}
          onClick={handleLogout}
        >
          <LogOut size={20} />
        </IconButton>
      </Stack>
    );
  }

  // Default / Public Mode
  if (isAuthenticated && user) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="Dashboard">
          <IconButton
            sx={styles.iconButton}
            onClick={() => router.push("/dashboard")}
          >
            <LayoutDashboard size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Logout">
          <IconButton sx={styles.iconButton} onClick={handleLogout}>
            <LogOut size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Profile">
          <Avatar
            src={user.avatarUrl}
            alt={user.name}
            sx={{ width: 36, height: 36, ml: 1, cursor: "pointer" }}
            onClick={() => router.push("/profile")}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
        </Tooltip>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button
        label="Sign In"
        variant={ButtonVariants.GHOST}
        onClick={() => router.push("/login")}
      />
      <Button
        label="Get Started"
        variant={ButtonVariants.DEFAULT}
        onClick={() => router.push("/register")}
      />
    </Stack>
  );
}
