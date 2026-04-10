"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  alpha,
} from "@mui/material";
import { Trash2 } from "lucide-react";
import { palette } from "@/shared/theme";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmIcon?: LucideIcon;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  confirmIcon: ConfirmIcon = Trash2,
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";
  const accentColor = isDanger ? palette.error.main : palette.primary.main;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      slotProps={{
        paper: {
          sx: {
            bgcolor: palette.background.paper,
            border: `1px solid ${alpha(accentColor, 0.2)}`,
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: palette.text.secondary }}>
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          sx={{ color: palette.text.secondary }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={isDanger ? "error" : "primary"}
          disabled={loading}
          startIcon={<ConfirmIcon size={16} />}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
