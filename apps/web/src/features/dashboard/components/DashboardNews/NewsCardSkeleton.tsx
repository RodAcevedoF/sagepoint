import { Box, Skeleton } from "@mui/material";
import { styles } from "./news.styles";

export function NewsCardSkeleton() {
  return (
    <Box sx={styles.skeletonCard}>
      <Skeleton
        variant="rounded"
        width={32}
        height={32}
        sx={{ borderRadius: 1.5 }}
        animation="wave"
      />
      <Skeleton variant="text" width="50%" height={12} animation="wave" />
      <Skeleton variant="text" width="90%" height={14} animation="wave" />
      <Skeleton variant="text" width="100%" height={12} animation="wave" />
      <Skeleton variant="text" width="60%" height={12} animation="wave" />
    </Box>
  );
}
