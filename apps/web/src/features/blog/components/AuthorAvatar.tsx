import { Avatar, alpha, type SxProps, type Theme } from "@mui/material";
import { palette } from "@/shared/theme";

interface AuthorAvatarProps {
  author: string;
  size?: number;
  sx?: SxProps<Theme>;
}

export function AuthorAvatar({ author, size = 40, sx }: AuthorAvatarProps) {
  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Avatar
      src="/logo.webp"
      slotProps={{
        img: {
          onError: (e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          },
        },
      }}
      sx={{
        width: size,
        height: size,
        bgcolor: "transparent",
        fontWeight: 600,
        p: 0.75,
        border: `2px solid ${alpha(palette.primary.light, 0.2)}`,
        ...sx,
      }}
    >
      {initials}
    </Avatar>
  );
}
