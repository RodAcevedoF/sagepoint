"use client";

import { Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { Rocket, LogIn } from "lucide-react";
import { Button } from "@/common/components";
import { ButtonVariants, ButtonSizes } from "@/common/types";

export function HeroActions() {
  const router = useRouter();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      justifyContent="center"
    >
      <Button
        label="Get Started Free"
        size={ButtonSizes.LARGE}
        icon={Rocket}
        onClick={() => router.push("/register")}
        sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
      />
      <Button
        label="Sign In"
        variant={ButtonVariants.OUTLINED}
        size={ButtonSizes.LARGE}
        icon={LogIn}
        onClick={() => router.push("/login")}
        sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
      />
    </Stack>
  );
}
