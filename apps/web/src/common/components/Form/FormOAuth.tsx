"use client";

import { Button, Box, alpha } from "@mui/material";
import { palette } from "@/common/theme";
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
    <Button
      fullWidth
      variant="outlined"
      href={config.getUrl()}
      sx={{
        mb: 3,
        py: 1.5,
        fontWeight: 600,
        fontSize: "1rem",
        borderRadius: 2,
        borderColor: alpha(palette.text.primary, 0.23),
        color: palette.text.primary,
        "&:hover": {
          borderColor: palette.text.primary,
          background: alpha(palette.text.primary, 0.04),
        },
      }}
    >
      <Box
        component="img"
        src={config.icon}
        alt=""
        sx={{ width: 20, height: 20, mr: 1.5 }}
      />
      {label ?? config.defaultLabel}
    </Button>
  );
}
