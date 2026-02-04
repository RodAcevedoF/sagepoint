"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button, alpha } from "@mui/material";
import { LogOut, RotateCcw, Trash2 } from "lucide-react";
import { Card, useSnackbar, useModal } from "@/common/components";
import { palette } from "@/common/theme";
import { logoutAction } from "@/app/actions/auth";

export function ProfileActions() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { openModal, closeModal } = useModal();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
    } catch {
      showSnackbar("Failed to logout", { severity: "error" });
      setIsLoggingOut(false);
    }
  };

  const handleResetOnboarding = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/me/onboarding`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: "PENDING" }),
        }
      );
      showSnackbar("Onboarding reset. Redirecting...", { severity: "success" });
      router.push("/onboarding");
    } catch {
      showSnackbar("Failed to reset onboarding", { severity: "error" });
    }
  };

  const confirmDeleteAccount = () => {
    openModal(
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(palette.error.main, 0.1),
            color: palette.error.light,
            mx: "auto",
            mb: 3,
          }}
        >
          <Trash2 size={28} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Delete Account?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This action cannot be undone. All your data will be permanently removed.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button variant="outlined" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              closeModal();
              showSnackbar("Account deletion not implemented yet", {
                severity: "info",
              });
            }}
          >
            Delete Account
          </Button>
        </Box>
      </Box>,
      { maxWidth: "xs", showCloseButton: false }
    );
  };

  const isDev = process.env.NODE_ENV === "development";

  return (
    <Card variant="glass" hoverable={false}>
      <Card.Content>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Account Actions
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Logout */}
          <Button
            variant="outlined"
            startIcon={<LogOut size={18} />}
            onClick={handleLogout}
            disabled={isLoggingOut}
            fullWidth
            sx={{ justifyContent: "flex-start", py: 1.5 }}
          >
            {isLoggingOut ? "Logging out..." : "Sign Out"}
          </Button>

          {/* Reset Onboarding (Dev only) */}
          {isDev && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RotateCcw size={18} />}
              onClick={handleResetOnboarding}
              fullWidth
              sx={{ justifyContent: "flex-start", py: 1.5 }}
            >
              Reset Onboarding (Dev)
            </Button>
          )}

          {/* Delete Account */}
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={18} />}
            onClick={confirmDeleteAccount}
            fullWidth
            sx={{ justifyContent: "flex-start", py: 1.5 }}
          >
            Delete Account
          </Button>
        </Box>
      </Card.Content>
    </Card>
  );
}
