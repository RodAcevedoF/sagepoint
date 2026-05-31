"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/Button";
import {
  ButtonVariants,
  ButtonIconPositions,
  ButtonSizes,
} from "@/shared/types";

interface GoBackButtonProps {
  label?: string;
  variant?: ButtonVariants;
  size?: ButtonSizes;
}

/**
 * Navigation button that goes back in history using Next.js router.
 */
export function GoBackButton({
  label = "Go Back",
  variant = ButtonVariants.AURORA_OUTLINE,
  size = ButtonSizes.LARGE,
}: GoBackButtonProps) {
  const router = useRouter();

  return (
    <Button
      label={label}
      icon={ArrowLeft}
      iconPos={ButtonIconPositions.START}
      variant={variant}
      size={size}
      onClick={() => router.back()}
    />
  );
}
