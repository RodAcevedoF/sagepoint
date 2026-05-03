import { Box } from "@mui/material";
import { Loader } from "./Loader";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Loading" }: PageLoaderProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
      }}
    >
      <Loader variant="page" message={message} />
    </Box>
  );
}
