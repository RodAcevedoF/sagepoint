"use client";

import { useAppSelector } from "@/shared/hooks";
import { Brand } from "../../data-display/Brand";

export function NavbarBrand() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return <Brand showLogo={true} href={isAuthenticated ? "/dashboard" : "/"} />;
}
