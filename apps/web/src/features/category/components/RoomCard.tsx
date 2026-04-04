"use client";

import { Box, Typography } from "@mui/material";
import { BookOpen, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import type { CategoryRoomDto } from "@/infrastructure/api/categoryRoomApi";

const styles = {
  card: {
    cursor: "pointer",
    transition: "all 0.3s ease",
    height: "100%",
    "&:hover": { transform: "translateY(-4px)" },
  },
  name: {
    fontWeight: 700,
    mb: 0.5,
    letterSpacing: "-0.3px",
  },
  description: {
    color: "text.secondary",
    mb: 2,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    fontSize: "0.85rem",
    lineHeight: 1.5,
  },
  statsRow: {
    display: "flex",
    gap: 2,
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    fontSize: "0.8rem",
    fontWeight: 600,
  },
};

export function RoomCard({ room }: { room: CategoryRoomDto }) {
  const router = useRouter();

  return (
    <Card
      variant="glass"
      sx={styles.card}
      onClick={() => router.push(`/explore/rooms/${room.slug}`)}
    >
      <Card.Content>
        <Typography variant="h6" sx={styles.name}>
          {room.name}
        </Typography>
        {room.description && (
          <Typography sx={styles.description}>{room.description}</Typography>
        )}
        <Box sx={styles.statsRow}>
          <Box sx={{ ...styles.stat, color: palette.info.light }}>
            <BookOpen size={15} />
            {room.roadmapCount} roadmap{room.roadmapCount !== 1 ? "s" : ""}
          </Box>
          <Box sx={{ ...styles.stat, color: palette.success.light }}>
            <Users size={15} />
            {room.memberCount} member{room.memberCount !== 1 ? "s" : ""}
          </Box>
        </Box>
      </Card.Content>
    </Card>
  );
}
