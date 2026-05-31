"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/context/UserContext";
import { AppBar } from "./AppBar";
import { useDashboardAppBarVisibility } from "./DashboardAppBarVisibilityContext";
import {
  DASHBOARD_NAV_ITEMS,
  getActiveDashboardNavId,
} from "../dashboardNavItems";

export function DashboardAppBar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useCurrentUser();
  const { isHidden } = useDashboardAppBarVisibility();

  const isAdmin = user?.role === "ADMIN";

  if (isHidden) {
    return null;
  }

  const items = DASHBOARD_NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <AppBar defaultActive={getActiveDashboardNavId(pathname)}>
      <AppBar.Group>
        {items.map((item) => (
          <AppBar.Item
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={item.label}
            onClick={() => router.push(item.route)}
            tone={item.tone}
          />
        ))}
      </AppBar.Group>
    </AppBar>
  );
}
