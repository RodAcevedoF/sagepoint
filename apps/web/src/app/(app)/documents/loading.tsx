import { Box } from "@mui/material";
import { Loader } from "@/shared/components/ui/Loader";
import { palette } from "@/shared/theme";

export default function DocumentsLoading() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
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
