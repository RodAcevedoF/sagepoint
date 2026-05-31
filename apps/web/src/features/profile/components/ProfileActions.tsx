"use client";

import { Box, Typography, Button, Stack, useTheme } from "@mui/material";
import { LogOut, Trash2, ShieldAlert, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/application/auth/commands/logout.command";
import { useResetOnboardingMutation } from "@/infrastructure/api/userApi";
import { aurora as auroraPalette } from "@/shared/theme";
import { makeStyles } from "./Profile.styles";

const isDev = process.env.NODE_ENV === "development";

export function ProfileActions() {
  const router = useRouter();
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [resetOnboarding, { isLoading: isResetting }] =
    useResetOnboardingMutation();

  const handleResetOnboarding = async () => {
    try {
      await resetOnboarding().unwrap();
      router.push("/onboarding");
    } catch {
      // mutation error surfaced by RTK Query
    }
  };

  return (
    <Box sx={styles.panel}>
      <Box sx={styles.panelHead}>
        <Box sx={styles.panelIcon(auroraPalette.status.fail)}>
          <ShieldAlert size={20} />
        </Box>
        <Typography component="h2" sx={styles.panelTitle}>
          Account &amp; Security
        </Typography>
      </Box>
      <Box sx={styles.panelUnderline(auroraPalette.status.fail)} />

      <Stack spacing={2}>
        {isDev && (
          <Box sx={styles.secRow(auroraPalette.status.proc)}>
            <Box>
              <Typography
                component="h4"
                sx={styles.secRowTitle(auroraPalette.status.proc)}
              >
                Onboarding Status
              </Typography>
              <Typography component="p" sx={styles.secRowDesc}>
                Reset your profile preferences and restart onboarding
              </Typography>
            </Box>
            <Button
              onClick={handleResetOnboarding}
              disabled={isResetting}
              startIcon={<RotateCcw size={17} />}
              sx={styles.btnAccentOutline(auroraPalette.status.proc)}
            >
              {isResetting ? "Resetting..." : "Reset Onboarding"}
            </Button>
          </Box>
        )}

        <Box sx={styles.secRow(auroraPalette.status.concept)}>
          <Box>
            <Typography
              component="h4"
              sx={styles.secRowTitle(auroraPalette.status.concept)}
            >
              Session Management
            </Typography>
            <Typography component="p" sx={styles.secRowDesc}>
              Securely sign out from this device
            </Typography>
          </Box>
          <Button
            onClick={() => logout()}
            startIcon={<LogOut size={17} />}
            sx={styles.btnAccentOutline(auroraPalette.status.concept)}
          >
            Sign Out
          </Button>
        </Box>

        <Box sx={styles.secRow(auroraPalette.status.fail, true)}>
          <Box>
            <Typography
              component="h4"
              sx={styles.secRowTitle(auroraPalette.status.fail)}
            >
              Danger Zone
            </Typography>
            <Typography component="p" sx={styles.secRowDesc}>
              Permanently delete your account and data
            </Typography>
          </Box>
          <Button startIcon={<Trash2 size={17} />} sx={styles.btnDanger}>
            Delete Account
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
