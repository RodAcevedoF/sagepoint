"use client";

import { useIsAuthenticated } from "@/features/auth/context/UserContext";
import { Brand } from "../../data-display/Brand";

export function NavbarBrand() {
  const isAuthenticated = useIsAuthenticated();
  return <Brand showLogo={true} href={isAuthenticated ? "/dashboard" : "/"} />;
}
