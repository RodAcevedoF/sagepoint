"use client";

import { Box } from "@mui/material";
import { Shield, Activity } from "lucide-react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { aurora } from "@/shared/theme";
import { Card } from "@/shared/components";

const pulseStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  background: aurora.status.ready,
};

function IntegrityDot({ label, delay }: { label: string; delay: number }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        color: aurora.txMid,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: aurora.status.ready,
          boxShadow: `0 0 8px -1px ${aurora.status.ready}`,
        }}
      >
        <motion.span
          animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2 + delay, repeat: Infinity, delay }}
          style={pulseStyle}
        />
      </Box>
      {label}
    </Box>
  );
}

export function AdminFooter() {
  return (
    <Card variant="aurora" hoverable={false} withAura={false}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
          padding: "22px 28px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
              fontFamily: aurora.font.mono,
              fontSize: "11.5px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: aurora.txMid,
              whiteSpace: "nowrap",
              "& svg": { color: aurora.teal },
            }}
          >
            <Activity size={16} />
            System Integrity:
          </Box>
          <IntegrityDot label="Network" delay={0} />
          <IntegrityDot label="GraphDB" delay={0.4} />
          <IntegrityDot label="Compute" delay={0.8} />
        </Box>

        <Box
          sx={{
            textAlign: { xs: "left", md: "right" },
          }}
        >
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
              fontWeight: 700,
              fontSize: "14px",
              color: aurora.status.concept,
              whiteSpace: "nowrap",
            }}
          >
            <Shield size={16} />
            SagePoint Management Console
          </Box>
          <Box
            sx={{
              fontFamily: aurora.font.mono,
              fontSize: "11.5px",
              color: aurora.txLow,
              marginTop: "5px",
              whiteSpace: "nowrap",
            }}
          >
            v1.0.4-stable · Build 2D3F4 · Secure SSL Session
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
