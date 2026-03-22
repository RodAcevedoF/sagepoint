"use client";

import { useAppSelector } from "@/common/hooks";
import { Brand } from "../Brand";

export function NavbarBrand() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return <Brand showLogo={true} href={isAuthenticated ? "/dashboard" : "/"} />;
}
