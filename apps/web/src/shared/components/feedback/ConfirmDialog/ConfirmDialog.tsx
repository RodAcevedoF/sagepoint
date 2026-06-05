"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Trash2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/Button/Button";
import {
  ButtonIconPositions,
  ButtonSizes,
  ButtonVariants,
} from "@/shared/types";
import { aurora, auroraTint } from "@/shared/theme";

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

const paperSx = {
  background: `linear-gradient(168deg, oklch(0.235 0.026 262 / 0.92), oklch(0.175 0.026 262 / 0.82))`,
  border: `1px solid ${aurora.line2}`,
  borderRadius: aurora.radii.card,
  boxShadow: aurora.shadow.card,
  minWidth: { xs: 320, sm: 420 },
  color: aurora.tx,
} as const;

const titleSx = {
  fontFamily: aurora.font.display,
  fontWeight: 700,
  fontSize: { xs: 18, sm: 20 },
  color: aurora.txHi,
  paddingX: { xs: "20px", sm: "28px" },
  paddingTop: { xs: "22px", sm: "26px" },
  paddingBottom: "8px",
} as const;

const contentSx = {
  paddingX: { xs: "20px", sm: "28px" },
  paddingTop: "8px !important",
} as const;

const descriptionSx = {
  color: aurora.txMid,
  fontSize: "14px",
  lineHeight: 1.55,
} as const;

const actionsSx = {
  paddingX: { xs: "20px", sm: "28px" },
  paddingTop: "16px",
  paddingBottom: "20px",
  gap: "8px",
} as const;

const dangerConfirmSx = {
  color: aurora.status.fail,
  borderColor: auroraTint(aurora.status.fail, 0.5),
  background: auroraTint(aurora.status.fail, 0.12),
  "&:hover": {
    background: auroraTint(aurora.status.fail, 0.2),
    borderColor: auroraTint(aurora.status.fail, 0.65),
  },
};

const confirmByVariant = {
  danger: { variant: ButtonVariants.AURORA_OUTLINE, sx: dangerConfirmSx },
  default: { variant: ButtonVariants.AURORA, sx: undefined },
} as const;

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  confirmIcon = Trash2,
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirm = confirmByVariant[variant];

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      disableScrollLock
      slotProps={{ paper: { sx: paperSx } }}
    >
      <DialogTitle sx={titleSx}>{title}</DialogTitle>
      <DialogContent sx={contentSx}>
        <DialogContentText sx={descriptionSx}>{description}</DialogContentText>
      </DialogContent>
      <DialogActions sx={actionsSx}>
        <Button
          label={cancelLabel}
          variant={ButtonVariants.AURORA_GHOST}
          size={ButtonSizes.MEDIUM}
          onClick={onCancel}
          disabled={loading}
        />
        <Button
          label={confirmLabel}
          icon={confirmIcon}
          iconPos={ButtonIconPositions.START}
          variant={confirm.variant}
          size={ButtonSizes.MEDIUM}
          onClick={onConfirm}
          loading={loading}
          sx={confirm.sx}
        />
      </DialogActions>
    </Dialog>
  );
}
