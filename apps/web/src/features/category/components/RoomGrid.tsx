"use client";

import { Box } from "@mui/material";
import { LayoutGrid } from "lucide-react";
import {
  AuroraGrid,
  AuroraHero,
  AuroraSkeleton,
  BackLink,
  EmptyState,
} from "@/shared/components";
import { useGetCategoryRoomsQuery } from "@/infrastructure/api/categoryRoomApi";
import { RoomCard } from "./RoomCard";

export function RoomGrid() {
  const { data: rooms, isLoading } = useGetCategoryRoomsQuery();

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <BackLink label="Explore" href="/explore" />
      </Box>

      <AuroraHero
        eyebrow="Topic Collections"
        eyebrowIcon={<LayoutGrid size={13} />}
        title="Category Rooms"
        lede="Browse public roadmaps organized by topic. Find the best learning paths in your area of interest."
        glyph={<LayoutGrid size={140} strokeWidth={1.2} />}
      />

      {isLoading && (
        <AuroraGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <AuroraSkeleton key={i} height={160} />
          ))}
        </AuroraGrid>
      )}

      {!isLoading && (!rooms || rooms.length === 0) && (
        <EmptyState
          title="No rooms yet"
          description="Public roadmaps will appear here once they're created."
        />
      )}

      {!isLoading && rooms && rooms.length > 0 && (
        <AuroraGrid>
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </AuroraGrid>
      )}
    </Box>
  );
}
