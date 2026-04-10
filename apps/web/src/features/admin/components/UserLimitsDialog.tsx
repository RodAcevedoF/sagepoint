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

interface LimitsForm {
  maxDocuments: number;
  maxRoadmaps: number;
  unlimitedDocs: boolean;
  unlimitedRoadmaps: boolean;
}

const DEFAULT_FORM: LimitsForm = {
  maxDocuments: 5,
  maxRoadmaps: 3,
  unlimitedDocs: false,
  unlimitedRoadmaps: false,
};

interface UserLimitsDialogProps {
  open: boolean;
  user: AdminUserDto | undefined;
  onClose: () => void;
  onConfirm: (data: {
    maxDocuments: number | null;
    maxRoadmaps: number | null;
  }) => void;
}

export function UserLimitsDialog({
  open,
  user,
  onClose,
  onConfirm,
}: UserLimitsDialogProps) {
  const [form, setForm] = useState<LimitsForm>(DEFAULT_FORM);

  const handleClose = () => {
    onClose();
    setForm(DEFAULT_FORM);
  };

  const handleConfirm = (data: {
    maxDocuments: number | null;
    maxRoadmaps: number | null;
  }) => {
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
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Resource Limits</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: palette.text.secondary, mb: 2 }}>
          Set document and roadmap limits for <strong>{user?.name}</strong>.
          Check &quot;Unlimited&quot; to remove the cap.
        </DialogContentText>
        <Stack spacing={2}>
          <Box>
            <TextField
              fullWidth
              label="Max Documents"
              type="number"
              value={form.maxDocuments}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  maxDocuments: parseInt(e.target.value) || 0,
                }))
              }
              disabled={form.unlimitedDocs}
              slotProps={{ htmlInput: { min: 0 } }}
              size="small"
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={form.unlimitedDocs}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unlimitedDocs: e.target.checked }))
                  }
                />
              }
              label="Unlimited"
              slotProps={{ typography: { variant: "caption" } }}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Max Roadmaps"
              type="number"
              value={form.maxRoadmaps}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  maxRoadmaps: parseInt(e.target.value) || 0,
                }))
              }
              disabled={form.unlimitedRoadmaps}
              slotProps={{ htmlInput: { min: 0 } }}
              size="small"
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={form.unlimitedRoadmaps}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      unlimitedRoadmaps: e.target.checked,
                    }))
                  }
                />
              }
              label="Unlimited"
              slotProps={{ typography: { variant: "caption" } }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ color: palette.text.secondary }}>
          Cancel
        </Button>
        <Button
          onClick={() =>
            handleConfirm({
              maxDocuments: form.unlimitedDocs ? null : form.maxDocuments,
              maxRoadmaps: form.unlimitedRoadmaps ? null : form.maxRoadmaps,
            })
          }
          variant="contained"
          startIcon={<Settings2 size={16} />}
        >
          Save Limits
        </Button>
      </DialogActions>
    </Dialog>
  );
}
