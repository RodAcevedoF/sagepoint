"use client";

import { Box, Stack, Tooltip } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/context/UserContext";
import { aurora, auroraTint } from "@/shared/theme";
import { resolveAccent } from "@/shared/components/ui/Aurora/tones";
import {
  DASHBOARD_NAV_ITEMS,
  getActiveDashboardNavId,
} from "../dashboardNavItems";

export function NavbarPrimaryLinks() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const activeId = getActiveDashboardNavId(pathname);

  const items = DASHBOARD_NAV_ITEMS.filter(
    (item) => !item.hideOnDesktop && (!item.adminOnly || isAdmin),
  );

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{ display: { xs: "none", md: "flex" } }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;
        const accent = resolveAccent(item.tone, undefined);
        return (
          <Tooltip
            key={item.id}
            title={isActive ? "" : item.label}
            placement="bottom"
            enterDelay={200}
            disableInteractive
          >
            <Box
              component="button"
              type="button"
              onClick={() => router.push(item.route)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: isActive ? 0.75 : 0,
                px: isActive ? 1.5 : 1,
                py: 0.85,
                borderRadius: 999,
                border: "1px solid",
                borderColor: isActive ? auroraTint(accent, 0.3) : "transparent",
                background: isActive ? auroraTint(accent, 0.14) : "transparent",
                color: isActive ? accent : aurora.txMid,
                fontFamily: aurora.font.ui,
                fontSize: "13px",
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: "-0.005em",
                cursor: "pointer",
                transition:
                  "color .2s ease, background-color .2s ease, border-color .2s ease, gap .25s ease, padding .25s ease, box-shadow .2s ease",
                boxShadow: isActive
                  ? `0 0 22px -6px ${auroraTint(accent, 0.7)}`
                  : "none",
                "&:hover": {
                  color: isActive ? accent : aurora.txHi,
                  background: isActive
                    ? auroraTint(accent, 0.18)
                    : auroraTint(aurora.teal, 0.06),
                },
                "&:focus-visible": {
                  outline: "none",
                  boxShadow: `0 0 0 2px ${auroraTint(accent, 0.4)}`,
                },
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  maxWidth: isActive ? 120 : 0,
                  opacity: isActive ? 1 : 0,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  transition: "max-width .25s ease, opacity .2s ease",
                }}
              >
                {item.label}
              </Box>
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
}
