"use client";

import {
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  LogOut,
  LogIn,
  Rocket,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { ButtonVariants } from "@/shared/types";
import { useAppSelector } from "@/shared/hooks";
import { useLogoutCommand } from "@/application/auth/commands/logout.command";
import { TokenBadge } from "./TokenBadge";
import type { Theme } from "@mui/material";

const makeStyles = (theme: Theme) => ({
  iconButton: {
    color: alpha(theme.palette.text.primary, 0.7),
    transition: "all 0.2s",
    "&:hover": {
      color: theme.palette.primary.light,
      bgcolor: alpha(theme.palette.primary.main, 0.1),
    },
  },
  adminIcon: {
    color: theme.palette.warning.main,
  },
  avatar: {
    width: 38,
    height: 38,
    ml: 1,
    cursor: "pointer",
    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    bgcolor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.light,
    fontWeight: 600,
    fontSize: "0.9rem",
    boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.1)}`,
    "&:hover": {
      transform: "scale(1.1)",
      borderColor: theme.palette.primary.light,
      boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  },
});

interface NavbarActionsProps {
  mode?: "default" | "dashboard";
}

export function NavbarActions({ mode = "default" }: NavbarActionsProps) {
  const router = useRouter();
  const theme = useTheme();
  const styles = makeStyles(theme);
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
                ...styles.adminIcon,
              }}
              onClick={() => router.push("/admin")}
            >
              <ShieldCheck size={20} />
            </IconButton>
          </Tooltip>
        )}

        {/* Token Balance */}
        <TokenBadge />

        {/* Profile Button */}
        <Tooltip title="My Profile">
          <Avatar
            src={user?.avatarUrl}
            alt={user?.name}
            sx={{ ...styles.avatar, ml: 0.5 }}
            onClick={() => router.push("/profile")}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
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
        <TokenBadge />
        <Tooltip title="Profile">
          <Avatar
            src={user?.avatarUrl}
            alt={user?.name}
            sx={styles.avatar}
            onClick={() => router.push("/profile")}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
        </Tooltip>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center">
      <Button
        label="Sign In"
        variant={ButtonVariants.GHOST}
        icon={LogIn}
        onClick={() => router.push("/login")}
        sx={{
          fontSize: { xs: "0.65rem", sm: "0.875rem" },
          px: { xs: 1, sm: 2 },
          py: { xs: 0.4, sm: 0.75 },
          minWidth: "auto",
        }}
      />
      <Button
        label="Get Started"
        variant={ButtonVariants.DEFAULT}
        icon={Rocket}
        onClick={() => router.push("/register")}
        sx={{
          fontSize: { xs: "0.65rem", sm: "0.875rem" },
          px: { xs: 1, sm: 2 },
          py: { xs: 0.4, sm: 0.75 },
          minWidth: "auto",
        }}
      />
    </Stack>
  );
}
