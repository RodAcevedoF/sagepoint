"use client";

import { Brand } from "../Brand";

/**
 * NavbarBrand component for the application header.
 * Uses the unified Brand component with the logo visible.
 */
export function NavbarBrand() {
  return <Brand showLogo={true} />;
}
