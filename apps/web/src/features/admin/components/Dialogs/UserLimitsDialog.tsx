"use client";

import { useState } from "react";
import {
  Box,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Stack,
  TextField,
  Button as MuiButton,
} from "@mui/material";
import { Settings2, X } from "lucide-react";
import { ModalTitle } from "@/shared/components";
import { aurora, auroraTint } from "@/shared/theme";
import type { AdminUserDto } from "@/infrastructure/api/adminApi";

interface BalanceForm {
  balance: number;
  unlimited: boolean;
  credit: number;
}

interface UserLimitsDialogProps {
  open: boolean;
  user: AdminUserDto | undefined;
  initialBalance: number | null | undefined;
  onClose: () => void;
  onConfirm: (data: { balance?: number | null; credit?: number }) => void;
}

const paperSx = {
  background: `linear-gradient(168deg, oklch(0.235 0.026 262 / 0.92), oklch(0.175 0.026 262 / 0.82))`,
  border: `1px solid ${aurora.line2}`,
  borderRadius: aurora.radii.card,
  boxShadow: aurora.shadow.card,
  minWidth: { xs: 320, sm: 440 },
  color: aurora.tx,
} as const;

const dialogContentSx = {
  paddingTop: "8px !important",
  paddingX: { xs: "20px", sm: "28px" },
} as const;

const dialogActionsSx = {
  paddingX: { xs: "20px", sm: "28px" },
  paddingTop: "8px",
  paddingBottom: "20px",
  gap: "8px",
} as const;

const ledeSx = {
  color: aurora.txMid,
  fontSize: "14px",
  lineHeight: 1.55,
  marginBottom: "18px",
} as const;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    fontFamily: aurora.font.ui,
    background: "oklch(0.21 0.025 262 / 0.7)",
    color: aurora.txHi,
    borderRadius: aurora.radii.md,
    "& fieldset": { borderColor: aurora.line },
    "&:hover fieldset": { borderColor: aurora.line2 },
    "&.Mui-focused fieldset": {
      borderColor: aurora.teal,
      boxShadow: `0 0 0 3px ${auroraTint(aurora.teal, 0.22)}`,
    },
    "&.Mui-disabled fieldset": { borderColor: aurora.line },
  },
  "& .MuiInputLabel-root": {
    color: aurora.txMid,
    "&.Mui-focused": { color: aurora.teal },
  },
  "& .MuiFormHelperText-root": {
    color: aurora.txLow,
    fontFamily: aurora.font.ui,
    marginLeft: 0,
  },
} as const;

const cancelButtonSx = {
  color: aurora.txMid,
  fontWeight: 600,
  textTransform: "none",
  "&:hover": { background: auroraTint(aurora.line2, 0.4), color: aurora.txHi },
} as const;

const saveButtonSx = {
  fontFamily: aurora.font.ui,
  fontWeight: 700,
  textTransform: "none",
  borderRadius: aurora.radii.md,
  paddingX: "16px",
  background: `linear-gradient(150deg, ${aurora.teal}, ${aurora.tealDeep})`,
  color: aurora.tealInk,
  boxShadow: `0 12px 26px -12px ${auroraTint(aurora.teal, 0.55)}`,
  "&:hover": {
    background: `linear-gradient(150deg, ${aurora.teal}, ${aurora.tealDeep})`,
    filter: "brightness(1.08)",
  },
} as const;

const closeButtonSx = {
  position: "absolute" as const,
  top: "12px",
  right: "12px",
  width: 34,
  height: 34,
  display: "grid",
  placeItems: "center",
  borderRadius: aurora.radii.md,
  border: `1px solid ${aurora.line}`,
  background: aurora.surface2,
  color: aurora.txMid,
  cursor: "pointer",
  "&:hover": {
    background: aurora.surface3,
    color: aurora.txHi,
    borderColor: aurora.line2,
  },
};

const checkboxSx = {
  color: aurora.txMid,
  "&.Mui-checked": { color: aurora.teal },
} as const;

function DialogBody({
  user,
  initialBalance,
  onClose,
  onConfirm,
}: Omit<UserLimitsDialogProps, "open">) {
  const [form, setForm] = useState<BalanceForm>({
    balance: initialBalance ?? 100,
    unlimited: initialBalance === null,
    credit: 0,
  });

  const handleConfirm = () => {
    const data: { balance?: number | null; credit?: number } = {};
    data.balance = form.unlimited ? null : form.balance;
    if (form.credit > 0) data.credit = form.credit;
    onConfirm(data);
  };

  return (
    <>
      <Box
        sx={{
          padding: { xs: "20px 20px 14px", sm: "28px 28px 18px" },
          position: "relative",
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          sx={closeButtonSx}
        >
          <X size={16} />
        </Box>
        <ModalTitle
          eyebrow={
            <Box
              component="span"
              sx={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              Limits
              {initialBalance === undefined && (
                <CircularProgress size={12} sx={{ color: aurora.teal }} />
              )}
            </Box>
          }
          title="Edit Token Balance"
          icon={<Settings2 size={20} />}
          tone="teal"
        />
      </Box>
      <DialogContent sx={dialogContentSx}>
        <Box sx={ledeSx}>
          Manage token balance for{" "}
          <Box component="strong" sx={{ color: aurora.txHi }}>
            {user?.name}
          </Box>
          . Tokens are consumed on successful operations.
        </Box>
        <Stack spacing={2}>
          <Box>
            <TextField
              fullWidth
              label="Set Balance"
              type="number"
              value={form.balance}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  balance: parseInt(e.target.value) || 0,
                }))
              }
              disabled={form.unlimited}
              slotProps={{ htmlInput: { min: 0 } }}
              size="small"
              helperText="Sets the absolute token balance"
              sx={fieldSx}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={form.unlimited}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unlimited: e.target.checked }))
                  }
                  sx={checkboxSx}
                />
              }
              label="Unlimited"
              sx={{
                marginTop: "4px",
                "& .MuiFormControlLabel-label": {
                  fontSize: "12.5px",
                  color: aurora.txMid,
                  fontFamily: aurora.font.ui,
                },
              }}
            />
          </Box>
          <TextField
            fullWidth
            label="Grant Additional Tokens"
            type="number"
            value={form.credit}
            onChange={(e) =>
              setForm((f) => ({ ...f, credit: parseInt(e.target.value) || 0 }))
            }
            slotProps={{ htmlInput: { min: 0 } }}
            size="small"
            helperText="Adds to the current balance (applied after set)"
            sx={fieldSx}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={dialogActionsSx}>
        <MuiButton onClick={onClose} sx={cancelButtonSx}>
          Cancel
        </MuiButton>
        <MuiButton
          onClick={handleConfirm}
          variant="contained"
          startIcon={<Settings2 size={16} />}
          sx={saveButtonSx}
        >
          Save
        </MuiButton>
      </DialogActions>
    </>
  );
}

export function UserLimitsDialog({
  open,
  user,
  initialBalance,
  onClose,
  onConfirm,
}: UserLimitsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableScrollLock
      slotProps={{ paper: { sx: paperSx } }}
    >
      {open && (
        <DialogBody
          key={user?.id}
          user={user}
          initialBalance={initialBalance}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )}
    </Dialog>
  );
}
