import { Box, Skeleton } from "@mui/material";
import { aurora as auroraPalette } from "@/shared/theme";

const skeletonBg = { bgcolor: auroraPalette.surface2 } as const;

export function NewsCardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: auroraPalette.radii.card,
        border: `1px solid ${auroraPalette.line}`,
        background:
          "linear-gradient(168deg, oklch(0.225 0.026 262 / 0.85), oklch(0.16 0.026 262 / 0.78))",
        boxShadow: auroraPalette.shadow.card,
        p: "22px 22px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton
          variant="rounded"
          width={50}
          height={50}
          animation="wave"
          sx={{ borderRadius: "14px", ...skeletonBg }}
        />
        <Skeleton
          variant="text"
          width={90}
          height={14}
          animation="wave"
          sx={skeletonBg}
        />
      </Box>
      <Skeleton
        variant="text"
        width="40%"
        height={12}
        animation="wave"
        sx={{ mt: 0.75, ...skeletonBg }}
      />
      <Skeleton
        variant="text"
        width="95%"
        height={18}
        animation="wave"
        sx={skeletonBg}
      />
      <Skeleton
        variant="text"
        width="80%"
        height={18}
        animation="wave"
        sx={skeletonBg}
      />
      <Skeleton
        variant="text"
        width="100%"
        height={12}
        animation="wave"
        sx={skeletonBg}
      />
      <Skeleton
        variant="text"
        width="60%"
        height={12}
        animation="wave"
        sx={skeletonBg}
      />
    </Box>
  );
}
