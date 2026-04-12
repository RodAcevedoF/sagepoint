"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  alpha,
} from "@mui/material";
import { Settings2 } from "lucide-react";
import { palette } from "@/shared/theme";
import type { AdminUserDto } from "@/infrastructure/api/adminApi";

interface BalanceForm {
  balance: number;
  unlimited: boolean;
  credit: number;
}

const DEFAULT_FORM: BalanceForm = {
  balance: 100,
  unlimited: false,
  credit: 0,
};

interface UserLimitsDialogProps {
  open: boolean;
  user: AdminUserDto | undefined;
  onClose: () => void;
  onConfirm: (data: { balance?: number | null; credit?: number }) => void;
}

export function UserLimitsDialog({
  open,
  user,
  onClose,
  onConfirm,
}: UserLimitsDialogProps) {
  const [form, setForm] = useState<BalanceForm>(DEFAULT_FORM);

  const handleClose = () => {
    onClose();
    setForm(DEFAULT_FORM);
  };

  const handleConfirm = () => {
    const data: { balance?: number | null; credit?: number } = {};
    data.balance = form.unlimited ? null : form.balance;
    if (form.credit > 0) data.credit = form.credit;
    onConfirm(data);
    setForm(DEFAULT_FORM);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            bgcolor: palette.background.paper,
            border: `1px solid ${alpha(palette.info.main, 0.2)}`,
            borderRadius: 3,
            minWidth: 360,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Token Balance</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: palette.text.secondary, mb: 2 }}>
          Manage token balance for <strong>{user?.name}</strong>. Tokens are
          consumed on successful operations.
        </DialogContentText>
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
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={form.unlimited}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unlimited: e.target.checked }))
                  }
                />
              }
              label="Unlimited"
              slotProps={{ typography: { variant: "caption" } }}
            />
          </Box>
          <TextField
            fullWidth
            label="Grant Additional Tokens"
            type="number"
            value={form.credit}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                credit: parseInt(e.target.value) || 0,
              }))
            }
            slotProps={{ htmlInput: { min: 0 } }}
            size="small"
            helperText="Adds to the current balance (applied after set)"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ color: palette.text.secondary }}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          startIcon={<Settings2 size={16} />}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
