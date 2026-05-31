import { Avatar, type SxProps, type Theme } from "@mui/material";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";

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
        color: auroraPalette.txHi,
        fontWeight: 600,
        p: 0.75,
        border: `1px solid ${auroraTint(auroraPalette.teal, 0.25)}`,
        ...sx,
      }}
    >
      {initials}
    </Avatar>
  );
}
