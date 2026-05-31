"use client";

import { Box } from "@mui/material";
import { Button } from "../Button";
import { ButtonVariants } from "@/shared/types";
import type { FormOAuthProps } from "./Form.types";

const oauthConfig = {
  google: {
    icon: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
    defaultLabel: "Continue with Google",
    getUrl: () =>
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/google`,
  },
};

export function FormOAuth({ provider, label }: FormOAuthProps) {
  const config = oauthConfig[provider];

  return (
    <Box sx={{ mb: 3 }}>
      <Button
        variant={ButtonVariants.AURORA_OUTLINE}
        fullWidth
        href={config.getUrl()}
        sx={{
          py: 1.5,
          fontSize: "1rem",
          justifyContent: "center",
          gap: 1.25,
        }}
        label={
          <>
            <Box
              component="img"
              src={config.icon}
              alt=""
              sx={{ width: 20, height: 20 }}
            />
            <span>{label ?? config.defaultLabel}</span>
          </>
        }
      />
    </Box>
  );
}
