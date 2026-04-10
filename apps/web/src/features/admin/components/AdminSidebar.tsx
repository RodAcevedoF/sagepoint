"use client";

import { Box, Typography, alpha } from "@mui/material";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Map,
  FileText,
  BarChart3,
  MailPlus,
} from "lucide-react";
import { Card } from "@/shared/components";
import { palette } from "@/shared/theme";

const navItems = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    color: palette.primary.light,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    color: palette.info.light,
  },
  {
    href: "/admin/invitations",
    label: "Invitations",
    icon: MailPlus,
    color: palette.success.light,
  },
  {
    href: "/admin/roadmaps",
    label: "Roadmaps",
    icon: Map,
    color: palette.warning.light,
  },
  {
    href: "/admin/documents",
    label: "Documents",
    icon: FileText,
    color: palette.secondary.light,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
    color: palette.error.light,
  },
];

function useActiveItem() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminMobileNav() {
  const isActive = useActiveItem();

  return (
    <Box
      sx={{
        display: { xs: "flex", md: "none" },
        gap: 1,
        mb: 2,
        overflowX: "auto",
        pb: 1,
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Box
            key={item.href}
            component={Link}
            href={item.href}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              textDecoration: "none",
              fontSize: "0.8rem",
              fontWeight: active ? 700 : 500,
              whiteSpace: "nowrap",
              color: active ? palette.common.white : palette.text.secondary,
              bgcolor: active
                ? alpha(item.color, 0.12)
                : alpha(palette.background.paper, 0.4),
              border: `1px solid ${alpha(active ? item.color : palette.divider, active ? 0.3 : 0.1)}`,
              transition: "all 0.2s ease",
              "& svg": { color: item.color },
              "&:hover": {
                bgcolor: alpha(item.color, 0.08),
                color: palette.common.white,
              },
            }}
          >
            <Icon size={16} />
            {item.label}
          </Box>
        );
      })}
    </Box>
  );
}

export function AdminSidebar() {
  const isActive = useActiveItem();

  return (
    <Card
      variant="glass"
      sx={{
        width: 220,
        flexShrink: 0,
        p: 1.5,
        position: "sticky",
        top: 24,
        alignSelf: "flex-start",
        display: { xs: "none", md: "block" },
      }}
    >
      <Typography
        sx={{
          fontSize: "0.7rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: palette.text.secondary,
          px: 1.5,
          py: 1,
          mb: 0.5,
        }}
      >
        Admin Panel
      </Typography>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Box
            key={item.href}
            component={Link}
            href={item.href}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: active ? 700 : 600,
              color: active
                ? palette.common.white
                : alpha(palette.common.white, 0.7),
              bgcolor: active ? alpha(item.color, 0.12) : "transparent",
              transition: "all 0.2s ease",
              "& svg": { color: item.color },
              "&:hover": {
                bgcolor: alpha(item.color, 0.08),
                color: palette.common.white,
              },
            }}
          >
            <Icon size={18} />
            {item.label}
          </Box>
        );
      })}
    </Card>
  );
}
