"use client";

import {
  Box,
  Stack,
  Tooltip,
  IconButton as MuiIconButton,
  type SxProps,
  type Theme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import {
  LogOut,
  LogIn,
  Rocket,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { ButtonVariants } from "@/shared/types";
import { aurora, auroraTint } from "@/shared/theme";
import { useCurrentUser } from "@/features/auth/context/UserContext";
import { logout } from "@/application/auth/commands/logout.command";
import { TokenBadge } from "./TokenBadge";
import { NavbarPrimaryLinks } from "./NavbarPrimaryLinks";

interface IconBtnProps {
  title: string;
  ariaLabel: string;
  onClick?: () => void;
  children: ReactNode;
  tint?: string;
  sx?: SxProps<Theme>;
}

function IconBtn({
  title,
  ariaLabel,
  onClick,
  children,
  tint,
  sx,
}: IconBtnProps) {
  return (
    <Tooltip title={title}>
      <MuiIconButton
        onClick={onClick}
        aria-label={ariaLabel}
        disableRipple
        sx={{
          width: 40,
          height: 40,
          borderRadius: "11px",
          display: "grid",
          placeItems: "center",
          background: aurora.surface2,
          border: `1px solid ${aurora.line}`,
          color: tint ?? aurora.txMid,
          transition: "all .15s",
          "&:hover": {
            background: aurora.surface3,
            color: tint ?? aurora.txHi,
            borderColor: aurora.line2,
          },
          ...sx,
        }}
      >
        {children}
      </MuiIconButton>
    </Tooltip>
  );
}

function NavDivider() {
  return (
    <Box
      sx={{
        width: "1px",
        height: 26,
        background: aurora.line2,
        mx: 0.25,
        display: { xs: "none", sm: "block" },
      }}
    />
  );
}

interface UserPillProps {
  name?: string;
  initial: string;
  avatarUrl?: string;
  onClick: () => void;
}

function UserPill({ name, initial, avatarUrl, onClick }: UserPillProps) {
  return (
    <Box
      onClick={onClick}
      role="button"
      aria-label="My profile"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "5px 8px 5px 5px",
        borderRadius: 999,
        cursor: "pointer",
        background: aurora.surface2,
        border: `1px solid ${aurora.line}`,
        transition: "all .15s",
        "&:hover": {
          background: aurora.surface3,
          borderColor: aurora.line2,
        },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          fontSize: 14,
          background: avatarUrl
            ? `url(${avatarUrl}) center/cover`
            : `linear-gradient(150deg, ${aurora.teal}, ${aurora.tealDeep})`,
          color: aurora.tealInk,
          boxShadow: `0 0 0 1px oklch(1 0 0 / 0.18), 0 0 14px -3px ${auroraTint(aurora.teal, 0.6)}`,
          flexShrink: 0,
        }}
      >
        {!avatarUrl && initial}
      </Box>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          lineHeight: 1.15,
          pr: "2px",
          whiteSpace: "nowrap",
          maxWidth: 140,
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: "13.5px",
            fontWeight: 600,
            color: aurora.txHi,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name ?? "Account"}
        </Box>
      </Box>
      <Box
        component="span"
        sx={{
          color: aurora.txLow,
          display: { xs: "none", md: "grid" },
          placeItems: "center",
        }}
      >
        <ChevronDown size={15} />
      </Box>
    </Box>
  );
}

interface NavbarActionsProps {
  mode?: "default" | "dashboard";
}

export function NavbarActions({ mode = "default" }: NavbarActionsProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const isAuthenticated = user !== null;
  const isAdmin = user?.role === "ADMIN";

  if (mode === "dashboard") {
    return (
      <Stack
        direction="row"
        spacing={{ xs: 0.75, sm: 1.25 }}
        alignItems="center"
      >
        <NavbarPrimaryLinks />

        {isAdmin && (
          <IconBtn
            title="Admin Panel"
            ariaLabel="Admin Panel"
            tint={aurora.status.proc}
            onClick={() => router.push("/admin")}
            sx={{ display: { xs: "grid", md: "none" } }}
          >
            <ShieldCheck size={18} />
          </IconBtn>
        )}

        <TokenBadge />

        <NavDivider />

        <UserPill
          name={user?.name}
          initial={user?.name?.charAt(0).toUpperCase() ?? "?"}
          avatarUrl={user?.avatarUrl}
          onClick={() => router.push("/profile")}
        />

        <IconBtn title="Sign Out" ariaLabel="Sign Out" onClick={logout}>
          <LogOut size={17} />
        </IconBtn>
      </Stack>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Stack
        direction="row"
        spacing={{ xs: 0.75, sm: 1.25 }}
        alignItems="center"
      >
        <IconBtn
          title="Dashboard"
          ariaLabel="Dashboard"
          onClick={() => router.push("/dashboard")}
        >
          <LayoutDashboard size={18} />
        </IconBtn>

        <TokenBadge />

        <NavDivider />

        <UserPill
          name={user.name}
          initial={user.name?.charAt(0).toUpperCase() ?? "?"}
          avatarUrl={user.avatarUrl}
          onClick={() => router.push("/profile")}
        />

        <IconBtn title="Sign Out" ariaLabel="Sign Out" onClick={logout}>
          <LogOut size={17} />
        </IconBtn>
      </Stack>
    );
  }

  const guestLabelSx: SxProps<Theme> = {
    display: { xs: "none", sm: "inline" },
  };
  const guestBtnSx: SxProps<Theme> = {
    px: { xs: 1.25, sm: 2 },
    minWidth: { xs: 40, sm: "auto" },
    gap: { xs: 0, sm: 1 },
  };

  return (
    <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }} alignItems="center">
      <Button
        label={
          <Box component="span" sx={guestLabelSx}>
            Sign In
          </Box>
        }
        variant={ButtonVariants.AURORA_GHOST}
        icon={LogIn}
        onClick={() => router.push("/login")}
        sx={guestBtnSx}
      />
      <Button
        label={
          <Box component="span" sx={guestLabelSx}>
            Get Started
          </Box>
        }
        variant={ButtonVariants.AURORA}
        icon={Rocket}
        onClick={() => router.push("/register")}
        sx={guestBtnSx}
      />
    </Stack>
  );
}
