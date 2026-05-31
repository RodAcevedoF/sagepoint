"use client";

import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Map,
  FileText,
  BarChart3,
  MailPlus,
} from "lucide-react";
import { Card, toneColor, type AuroraTone } from "@/shared/components";
import { aurora, auroraTint } from "@/shared/theme";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  tone: AuroraTone;
}

const navItems: ReadonlyArray<NavItem> = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, tone: "concept" },
  { href: "/admin/users", label: "Users", icon: Users, tone: "concept" },
  {
    href: "/admin/invitations",
    label: "Invitations",
    icon: MailPlus,
    tone: "teal",
  },
  { href: "/admin/roadmaps", label: "Roadmaps", icon: Map, tone: "proc" },
  {
    href: "/admin/documents",
    label: "Documents",
    icon: FileText,
    tone: "ready",
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
    tone: "fail",
  },
];

function useActiveItem() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

const mobileNavSx = {
  display: { xs: "flex", md: "none" },
  gap: "8px",
  mb: "16px",
  overflowX: "auto",
  pb: "6px",
  "&::-webkit-scrollbar": { display: "none" },
  scrollbarWidth: "none",
} as const;

function mobileItemSx(active: boolean, color: string) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    px: "12px",
    py: "8px",
    borderRadius: aurora.radii.md,
    textDecoration: "none",
    fontSize: "12.5px",
    fontFamily: aurora.font.ui,
    fontWeight: active ? 700 : 600,
    whiteSpace: "nowrap",
    color: active ? aurora.txHi : aurora.txMid,
    background: active
      ? auroraTint(color, 0.13)
      : "oklch(0.22 0.025 262 / 0.55)",
    border: `1px solid ${active ? auroraTint(color, 0.32) : aurora.line}`,
    transition:
      "background-color .2s ease, border-color .2s ease, color .2s ease",
    "& svg": { color },
    "&:hover": { color: aurora.txHi, borderColor: aurora.line2 },
  } as const;
}

const sidebarSx = {
  flex: "0 0 240px",
  padding: "20px 12px",
  position: "sticky",
  top: "92px",
  alignSelf: "flex-start",
  display: { xs: "none", md: "flex" },
} as const;

const sidebarLabelSx = {
  fontFamily: aurora.font.mono,
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: aurora.teal,
  padding: "4px 14px 14px",
} as const;

function sidebarItemSx(active: boolean, color: string) {
  return {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "11px 14px",
    borderRadius: aurora.radii.md,
    textDecoration: "none",
    fontSize: "14.5px",
    fontFamily: aurora.font.ui,
    fontWeight: 600,
    color: active ? aurora.txHi : aurora.txMid,
    background: active ? auroraTint(color, 0.13) : "transparent",
    border: `1px solid ${active ? auroraTint(color, 0.32) : "transparent"}`,
    transition:
      "background-color .15s ease, border-color .15s ease, color .15s ease",
    "& .sb-ico": {
      display: "grid",
      placeItems: "center",
      color: active ? color : aurora.txLow,
      transition: "color .15s ease",
    },
    "&:hover": {
      background: active
        ? auroraTint(color, 0.18)
        : "oklch(0.27 0.022 262 / 0.5)",
      color: aurora.txHi,
      "& .sb-ico": { color },
    },
    ...(active && {
      "&::before": {
        content: '""',
        position: "absolute" as const,
        left: 0,
        top: "9px",
        bottom: "9px",
        width: "3px",
        borderRadius: "999px",
        background: color,
        boxShadow: `0 0 10px -1px ${color}`,
      },
    }),
  } as const;
}

export function AdminMobileNav() {
  const isActive = useActiveItem();
  return (
    <Box sx={mobileNavSx}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        const color = toneColor(item.tone);
        return (
          <Box
            key={item.href}
            component={Link}
            href={item.href}
            sx={mobileItemSx(active, color)}
          >
            <Icon size={15} />
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
    <Card variant="aurora" hoverable={false} withAura={false} sx={sidebarSx}>
      <Box sx={sidebarLabelSx}>Admin Panel</Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "3px",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const color = toneColor(item.tone);
          return (
            <Box
              key={item.href}
              component={Link}
              href={item.href}
              sx={sidebarItemSx(active, color)}
            >
              <Box component="span" className="sb-ico">
                <Icon size={20} />
              </Box>
              {item.label}
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
