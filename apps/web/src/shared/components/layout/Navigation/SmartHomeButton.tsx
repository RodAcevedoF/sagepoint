"use client";

import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/Button";
import {
  ButtonVariants,
  ButtonIconPositions,
  ButtonSizes,
} from "@/shared/types";
import { useIsAuthenticated } from "@/features/auth/context/UserContext";

interface SmartHomeButtonProps {
  label?: string;
  variant?: ButtonVariants;
  size?: ButtonSizes;
}

/**
 * Smart navigation button that redirects to:
 * - /dashboard if user is authenticated
 * - / if user is not authenticated
 */
export function SmartHomeButton({
  label = "Go Home",
  variant = ButtonVariants.AURORA,
  size = ButtonSizes.LARGE,
}: SmartHomeButtonProps) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  const handleClick = () => {
    router.push(isAuthenticated ? "/dashboard" : "/");
  };

  return (
    <Button
      label={label}
      icon={Home}
      iconPos={ButtonIconPositions.START}
      variant={variant}
      size={size}
      onClick={handleClick}
    />
  );
}
