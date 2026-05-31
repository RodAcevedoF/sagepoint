"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Map,
  Compass,
  FileText,
  User,
  Shield,
  Newspaper,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth/context/UserContext";
import { AppBar } from "./AppBar";
import { useDashboardAppBarVisibility } from "./DashboardAppBarVisibilityContext";

export function DashboardAppBar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useCurrentUser();
  const { isHidden } = useDashboardAppBarVisibility();

  const isAdmin = user?.role === "ADMIN";

  if (isHidden) {
    return null;
  }

  const getActiveItem = () => {
    if (pathname === "/dashboard") return "home";
    if (pathname.startsWith("/roadmaps")) return "roadmaps";
    if (pathname.startsWith("/explore")) return "explore";
    if (pathname.startsWith("/feed")) return "feed";
    if (pathname.startsWith("/documents")) return "documents";
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/profile")) return "profile";
    return null;
  };

  return (
    <AppBar defaultActive={getActiveItem()}>
      <AppBar.Group>
        <AppBar.Item
          id="home"
          icon={Home}
          label="Home"
          onClick={() => router.push("/dashboard")}
          tone="teal"
        />
        <AppBar.Item
          id="roadmaps"
          icon={Map}
          label="Roadmaps"
          onClick={() => router.push("/roadmaps")}
          tone="proc"
        />
        <AppBar.Item
          id="explore"
          icon={Compass}
          label="Explore"
          onClick={() => router.push("/explore")}
          tone="concept"
        />
        <AppBar.Item
          id="feed"
          icon={Newspaper}
          label="Feed"
          onClick={() => router.push("/feed")}
          tone="fail"
        />
        <AppBar.Item
          id="documents"
          icon={FileText}
          label="Docs"
          onClick={() => router.push("/documents")}
          tone="ready"
        />
        <AppBar.Item
          id="profile"
          icon={User}
          label="Profile"
          onClick={() => router.push("/profile")}
          tone="teal"
        />
        {isAdmin && (
          <AppBar.Item
            id="admin"
            icon={Shield}
            label="Admin"
            onClick={() => router.push("/admin")}
            tone="enrich"
          />
        )}
      </AppBar.Group>
    </AppBar>
  );
}
