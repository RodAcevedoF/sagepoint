"use client";

import { Button, type ButtonProps } from "@mui/material";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/common/hooks";

interface SmartHomeButtonProps extends Omit<ButtonProps, "onClick" | "href"> {
  label?: string;
}

/**
 * Smart navigation button that redirects to:
 * - /dashboard if user is authenticated
 * - / if user is not authenticated
 */
export function SmartHomeButton({
  label = "Go Home",
  variant = "contained",
  size = "large",
  ...props
}: SmartHomeButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleClick = () => {
    router.push(isAuthenticated ? "/dashboard" : "/");
  };

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<Home size={18} />}
      onClick={handleClick}
      {...props}
    >
      {label}
    </Button>
  );
}
