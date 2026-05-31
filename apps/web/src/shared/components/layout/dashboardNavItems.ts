import {
  Home,
  Map,
  Compass,
  FileText,
  User,
  Shield,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import type { AuroraTone } from "@/shared/components/ui/Aurora/tones";

export interface DashboardNavItem {
  id: string;
  label: string;
  route: string;
  icon: LucideIcon;
  tone: AuroraTone;
  adminOnly?: boolean;
  /** Hide on the desktop top Navbar (e.g. Profile lives in the UserPill there). */
  hideOnDesktop?: boolean;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { id: "home", label: "Home", route: "/dashboard", icon: Home, tone: "teal" },
  {
    id: "roadmaps",
    label: "Roadmaps",
    route: "/roadmaps",
    icon: Map,
    tone: "proc",
  },
  {
    id: "explore",
    label: "Explore",
    route: "/explore",
    icon: Compass,
    tone: "concept",
  },
  { id: "feed", label: "Feed", route: "/feed", icon: Newspaper, tone: "fail" },
  {
    id: "documents",
    label: "Docs",
    route: "/documents",
    icon: FileText,
    tone: "ready",
  },
  {
    id: "profile",
    label: "Profile",
    route: "/profile",
    icon: User,
    tone: "teal",
    hideOnDesktop: true,
  },
  {
    id: "admin",
    label: "Admin",
    route: "/admin",
    icon: Shield,
    tone: "enrich",
    adminOnly: true,
  },
];

export function getActiveDashboardNavId(pathname: string): string | null {
  if (pathname === "/dashboard") return "home";
  if (pathname.startsWith("/roadmaps")) return "roadmaps";
  if (pathname.startsWith("/explore")) return "explore";
  if (pathname.startsWith("/feed")) return "feed";
  if (pathname.startsWith("/documents")) return "documents";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/profile")) return "profile";
  return null;
}
