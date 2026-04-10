"use client";

import { lazy, Suspense, useState, useMemo } from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import { FileText, Upload } from "lucide-react";
import { motion } from "framer-motion";
import {
  EmptyState,
  ErrorState,
  FilterChips,
  Loader,
  useModal,
  SearchInput,
} from "@/shared/components";
import { useInfiniteScroll } from "@/shared/hooks";
import { useUserDocumentsQuery } from "@/application/document";
import { DocumentHero } from "./DocumentHero";
import { DocumentStats } from "./DocumentStats";
import { DocumentCard } from "./DocumentCard";
import { DocumentCardSkeleton } from "./DocumentCardSkeleton";
import { ProcessingDocumentCard } from "./ProcessingDocumentCard";
import { filterAndPartitionDocuments, type StageFilter } from "../utils";

const LazyUploadDocumentModal = lazy(() =>
  import("./UploadDocumentModal").then((m) => ({
    default: m.UploadDocumentModal,
  })),
);

const MotionBox = motion.create(Box);

const PAGE_SIZE = 12;

export function DocumentList() {
  const [cursor, setCursor] = useState<string | undefined>();
  const {
    data: response,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useUserDocumentsQuery({ limit: PAGE_SIZE, cursor });
  const { openModal } = useModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");

  // RTK Query `merge` accumulates pages in the cache — data comes pre-merged
  const documents = useMemo(() => response?.data ?? [], [response]);
  const hasMore = response?.hasMore ?? false;

  const sentinelRef = useInfiniteScroll(() => {
    if (!isFetching && response?.nextCursor) setCursor(response.nextCursor);
  }, hasMore && !isFetching);

  const handleUpload = () => {
    openModal(
      <Suspense fallback={<Loader />}>
        <LazyUploadDocumentModal />
      </Suspense>,
      {
        title: "Upload Document",
        showCloseButton: true,
        maxWidth: "sm",
      },
    );
  };

  const { processingDocs, completedDocs } = useMemo(
    () => filterAndPartitionDocuments(documents, searchQuery, stageFilter),
    [documents, searchQuery, stageFilter],
  );

  if (isLoading) {
    return (
      <>
        <DocumentHero onUpload={handleUpload} />
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <DocumentCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load documents"
        description="Could not retrieve your documents. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  const stageOptions = [
    { label: "All", value: "all" as StageFilter },
    { label: "Processing", value: "processing" as StageFilter },
    { label: "Ready", value: "ready" as StageFilter },
  ];

  return (
    <>
      <DocumentHero onUpload={handleUpload} />

      {documents.length === 0 && !response?.total ? (
        <EmptyState
          title="No documents yet"
          description="Upload your first document to get started with AI-powered analysis."
          icon={FileText}
          actionLabel="Upload Document"
          actionIcon={Upload}
          onAction={handleUpload}
        />
      ) : (
        <>
          <DocumentStats documents={documents} />

          {/* Filter bar */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Box sx={{ minWidth: 220, flex: 1, maxWidth: 320 }}>
              <SearchInput
                placeholder="Search documents..."
                onSearch={setSearchQuery}
                debounceMs={300}
              />
            </Box>
            <FilterChips
              options={stageOptions}
              value={stageFilter}
              onChange={setStageFilter}
            />
          </Box>

          {/* Processing section */}
          {processingDocs.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "text.secondary", mb: 2, fontWeight: 600 }}
              >
                Processing ({processingDocs.length})
              </Typography>
              <Grid container spacing={3}>
                {processingDocs.map((doc, index) => (
                  <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                    >
                      <ProcessingDocumentCard
                        document={doc}
                        onComplete={refetch}
                      />
                    </MotionBox>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Completed section */}
          {completedDocs.length > 0 ? (
            <>
              {processingDocs.length > 0 && (
                <Typography
                  variant="subtitle2"
                  sx={{ color: "text.secondary", mb: 2, fontWeight: 600 }}
                >
                  Completed ({completedDocs.length})
                </Typography>
              )}
              <Grid container spacing={3}>
                {completedDocs.map((doc, index) => (
                  <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.3 + index * 0.08,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      <DocumentCard document={doc} />
                    </MotionBox>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            processingDocs.length === 0 && (
              <EmptyState
                title="No matching documents"
                description="Try adjusting your search or filter."
              />
            )
          )}

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <Box
              ref={sentinelRef}
              sx={{ display: "flex", justifyContent: "center", py: 4 }}
            >
              {isFetching && <CircularProgress size={28} />}
            </Box>
          )}
        </>
      )}
    </>
  );
}
