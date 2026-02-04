"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  alpha,
  Fade,
} from "@mui/material";
import { X } from "lucide-react";
import { palette } from "@/common/theme";
import { useModal } from "./modal-context";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  paper: {
    borderRadius: 4,
    background: alpha(palette.background.paper, 0.95),
    backdropFilter: "blur(20px)",
    border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
    boxShadow: `0 25px 50px -12px ${alpha(palette.primary.main, 0.25)}`,
  },
  backdrop: {
    backgroundColor: alpha(palette.background.default, 0.85),
    backdropFilter: "blur(4px)",
  },
  title: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${alpha(palette.primary.light, 0.1)}`,
    py: 2,
    px: 3,
  },
  closeButton: {
    color: palette.text.secondary,
    "&:hover": {
      color: palette.text.primary,
      background: alpha(palette.primary.light, 0.1),
    },
  },
  content: {
    p: 3,
  },
};

// ============================================================================
// Component
// ============================================================================

export function Modal() {
  const { isOpen, content, options, closeModal } = useModal();

  const handleClose = (_event: object, reason: string) => {
    if (reason === "backdropClick" && !options.closeOnOverlay) {
      return;
    }
    closeModal();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth={options.maxWidth}
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={200}
      slotProps={{
        backdrop: { sx: styles.backdrop },
      }}
      PaperProps={{ sx: styles.paper }}
    >
      {(options.title || options.showCloseButton) && (
        <DialogTitle sx={styles.title}>
          {options.title || ""}
          {options.showCloseButton && (
            <IconButton
              onClick={closeModal}
              size="small"
              sx={styles.closeButton}
              aria-label="Close"
            >
              <X size={20} />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent sx={styles.content}>{content}</DialogContent>
    </Dialog>
  );
}
