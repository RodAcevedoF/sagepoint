import { Typography, Button, Stack, useTheme, alpha, Box } from "@mui/material";
import { LogOut, Trash2, ShieldAlert, RotateCcw } from "lucide-react";
import { Card } from "@/shared/components";
import { logout } from "@/application/auth/commands/logout.command";
import { useResetOnboardingMutation } from "@/infrastructure/api/userApi";
import { useRouter } from "next/navigation";
import { makeStyles } from "./Profile.styles";

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
      // mutation error is surfaced by RTK Query
    }
  };

  return (
    <Card variant="glass" sx={styles.profileCard} hoverable={false}>
      <Card.Content sx={{ p: { xs: 2.5, md: 4 } }}>
        <Typography variant="h6" sx={styles.sectionTitle}>
          <ShieldAlert size={20} />
          Account & Security
        </Typography>

        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.warning.main, 0.03),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "warning.main" }}
              >
                Onboarding Status
              </Typography>
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ opacity: 0.8 }}
              >
                Reset your profile preferences and restart onboarding
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RotateCcw size={16} />}
              onClick={handleResetOnboarding}
              disabled={isResetting}
              sx={styles.actionButton}
            >
              {isResetting ? "Resetting..." : "Reset Onboarding"}
            </Button>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.info.main, 0.03),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "info.main" }}
              >
                Session Management
              </Typography>
              <Typography
                variant="caption"
                color="info.main"
                sx={{ opacity: 0.8 }}
              >
                Securely sign out from this device
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="info"
              startIcon={<LogOut size={16} />}
              onClick={() => logout()}
              sx={styles.actionButton}
            >
              Sign Out
            </Button>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.error.main, 0.03),
              border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "error.main" }}
              >
                Danger Zone
              </Typography>
              <Typography
                variant="caption"
                color="error.main"
                sx={{ opacity: 0.8 }}
              >
                Permanently delete your account and data
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="error"
              startIcon={<Trash2 size={16} />}
              sx={{
                ...styles.actionButton,
                boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              Delete Account
            </Button>
          </Stack>
        </Stack>
      </Card.Content>
    </Card>
  );
}
