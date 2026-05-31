"use client";

import { Box, ButtonBase } from "@mui/material";
import type { CSSProperties } from "react";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";

export interface AuroraTabItem<T extends string = string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string = string> {
  items: ReadonlyArray<AuroraTabItem<T>>;
  activeId: T;
  onChange: (id: T) => void;
  style?: CSSProperties;
}

export function Tabs<T extends string = string>({
  items,
  activeId,
  onChange,
  style,
}: TabsProps<T>) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }} style={style}>
      {items.map((item) => {
        const isOn = item.id === activeId;
        return (
          <ButtonBase
            key={item.id}
            disableRipple
            onClick={() => onChange(item.id)}
            sx={{
              padding: "10px 18px",
              borderRadius: auroraPalette.radii.pill,
              border: `1px solid ${isOn ? auroraTint(auroraPalette.teal, 0.45) : auroraPalette.line}`,
              background: isOn
                ? auroraTint(auroraPalette.teal, 0.13)
                : "oklch(0.22 0.025 262 / 0.4)",
              color: isOn ? auroraPalette.teal : auroraPalette.txMid,
              fontFamily: auroraPalette.font.ui,
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition:
                "background-color .25s ease, border-color .25s ease, color .25s ease",
            }}
          >
            {item.label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
