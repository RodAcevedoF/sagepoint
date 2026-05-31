"use client";

import { useState } from "react";
import { Box, Pagination, type SxProps, type Theme } from "@mui/material";
import { BookOpen, Users, LayoutGrid } from "lucide-react";
import {
  AuroraGrid,
  AuroraHero,
  AuroraSkeleton,
  BackLink,
  EmptyState,
  ErrorState,
  Pill,
  SearchInput,
} from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { useGetCategoryRoomDetailQuery } from "@/infrastructure/api/categoryRoomApi";
import { ExploreCard } from "@/features/roadmap/components/ExploreCard";
import { RoadmapCardSkeleton } from "@/features/roadmap/components/RoadmapCardSkeleton";
import { categoryTone } from "@/features/blog/constants/categoryAssets";

const PAGE_SIZE = 12;

const styles: Record<string, SxProps<Theme>> = {
  stats: {
    display: "flex",
    flexWrap: "wrap",
    gap: 1.5,
    mt: 3,
  },
  searchRow: { mb: 4, maxWidth: 480 },
  pagination: {
    mt: 5,
    display: "flex",
    justifyContent: "center",
    "& .MuiPaginationItem-root": {
      color: auroraPalette.txMid,
      fontFamily: auroraPalette.font.ui,
      fontWeight: 600,
      borderColor: auroraPalette.line,
      "&:hover": {
        backgroundColor: "oklch(0.22 0.025 262 / 0.5)",
        borderColor: auroraPalette.line2,
      },
      "&.Mui-selected": {
        backgroundColor: auroraTint(auroraPalette.teal, 0.13),
        borderColor: auroraTint(auroraPalette.teal, 0.45),
        color: auroraPalette.teal,
        "&:hover": {
          backgroundColor: auroraTint(auroraPalette.teal, 0.18),
        },
      },
    },
  },
};

interface RoomDetailProps {
  slug: string;
}

export function RoomDetail({ slug }: RoomDetailProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetCategoryRoomDetailQuery({
    slug,
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  if (error) {
    return (
      <ErrorState
        title="Room not found"
        description="This category room doesn't exist or has no public roadmaps."
      />
    );
  }

  const tone = categoryTone(slug);
  const totalPages = data ? Math.ceil(data.roadmaps.total / PAGE_SIZE) : 0;

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <BackLink label="Category Rooms" href="/explore/rooms" />
      </Box>

      {isLoading || !data ? (
        <Box sx={{ mb: "28px" }}>
          <AuroraSkeleton height={220} radius={26} />
        </Box>
      ) : (
        <>
          <AuroraHero
            style={{ marginBottom: 20 }}
            eyebrow="Category Room"
            eyebrowIcon={<LayoutGrid size={13} />}
            title={data.category.name}
            lede={data.category.description ?? ""}
            glyph={<LayoutGrid size={140} strokeWidth={1.2} />}
          />
          <Box sx={styles.stats}>
            <Pill tone={tone} icon={<BookOpen size={13} />}>
              {data.roadmapCount} roadmap{data.roadmapCount !== 1 ? "s" : ""}
            </Pill>
            <Pill tone="concept" icon={<Users size={13} />}>
              {data.memberCount} member{data.memberCount !== 1 ? "s" : ""}
            </Pill>
          </Box>
        </>
      )}

      <Box sx={styles.searchRow}>
        <SearchInput
          placeholder={`Search in ${data?.category.name ?? "this room"}...`}
          onSearch={handleSearch}
          debounceMs={300}
        />
      </Box>

      {isLoading && (
        <AuroraGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <RoadmapCardSkeleton key={i} />
          ))}
        </AuroraGrid>
      )}

      {!isLoading && data && data.roadmaps.items.length > 0 && (
        <>
          <AuroraGrid>
            {data.roadmaps.items.map((roadmap) => (
              <ExploreCard key={roadmap.id} roadmap={roadmap} tone={tone} />
            ))}
          </AuroraGrid>

          {totalPages > 1 && (
            <Box sx={styles.pagination}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_e, value) => setPage(value)}
                shape="rounded"
                size="large"
                variant="outlined"
              />
            </Box>
          )}
        </>
      )}

      {!isLoading && data && data.roadmaps.items.length === 0 && (
        <EmptyState
          title="No roadmaps found"
          description={
            search
              ? "No roadmaps match your search. Try different keywords."
              : "This room doesn't have any public roadmaps yet."
          }
        />
      )}
    </Box>
  );
}
