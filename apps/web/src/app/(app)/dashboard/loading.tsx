import { Box } from "@mui/material";
import { Loader } from "@/shared/components/ui/Loader";
import { palette } from "@/shared/theme";

export default function DashboardLoading() {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: palette.background.gradient,
      }}
    >
      <Loader variant="page" message="Loading" />
    </Box>
  );
}
