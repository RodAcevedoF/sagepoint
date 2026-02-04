"use client";

import { Button, type ButtonProps } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface GoBackButtonProps extends Omit<ButtonProps, "onClick" | "href"> {
  label?: string;
}

/**
 * Navigation button that goes back in history using Next.js router.
 */
export function GoBackButton({
  label = "Go Back",
  variant = "outlined",
  size = "large",
  ...props
}: GoBackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<ArrowLeft size={18} />}
      onClick={() => router.back()}
      {...props}
    >
      {label}
    </Button>
  );
}
