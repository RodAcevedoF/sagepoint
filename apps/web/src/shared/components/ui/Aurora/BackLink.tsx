"use client";

import { Box } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { aurora as auroraPalette } from "@/shared/theme";

interface BackLinkProps {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

/**
 * Aurora back-link chip — small inline-flex surface with a leading arrow.
 * Pass `href` to navigate via Next router, or `onClick` for custom behavior.
 */
export function BackLink({ label, href, onClick }: BackLinkProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (href) router.push(href);
  };

  return (
    <Box
      component="span"
      onClick={handleClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        alignSelf: "flex-start",
        whiteSpace: "nowrap",
        padding: "11px 18px 11px 15px",
        borderRadius: auroraPalette.radii.md,
        cursor: "pointer",
        background: auroraPalette.surface2,
        border: `1px solid ${auroraPalette.line}`,
        color: auroraPalette.tx,
        fontWeight: 600,
        fontSize: "14.5px",
        transition: "background .15s, color .15s, transform .15s",
        "&:hover": {
          background: auroraPalette.surface3,
          color: auroraPalette.txHi,
          transform: "translateX(-2px)",
        },
      }}
    >
      <ArrowLeft size={18} />
      {label}
    </Box>
  );
}
