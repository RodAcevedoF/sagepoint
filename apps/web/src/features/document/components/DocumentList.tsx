"use client";

import { lazy, Suspense, useState, useMemo } from "react";
import { FileText, Upload } from "lucide-react";
import { motion } from "framer-motion";
import {
  AuroraGrid,
  AuroraTabs,
  EmptyState,
  ErrorState,
  Loader,
  SearchInput,
  SearchRow,
  SecTitle,
  useModal,
  type AuroraTabItem,
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

const PAGE_SIZE = 12;

const TAB_OPTIONS: ReadonlyArray<AuroraTabItem<StageFilter>> = [
  { id: "all", label: "All" },
  { id: "processing", label: "Processing" },
  { id: "ready", label: "Ready" },
];

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
        <AuroraGrid style={{ marginTop: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <DocumentCardSkeleton key={i} />
          ))}
        </AuroraGrid>
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

          <SearchRow style={{ marginBottom: 24 }}>
            <div style={{ flex: 1, minWidth: 260, maxWidth: 360 }}>
              <SearchInput
                placeholder="Search documents..."
                onSearch={setSearchQuery}
                debounceMs={300}
              />
            </div>
            <AuroraTabs
              items={TAB_OPTIONS}
              activeId={stageFilter}
              onChange={setStageFilter}
            />
          </SearchRow>

          {processingDocs.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <SecTitle>Processing ({processingDocs.length})</SecTitle>
              <AuroraGrid style={{ marginTop: 16 }}>
                {processingDocs.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    <ProcessingDocumentCard
                      document={doc}
                      onComplete={refetch}
                    />
                  </motion.div>
                ))}
              </AuroraGrid>
            </section>
          )}

          {completedDocs.length > 0 ? (
            <section>
              {processingDocs.length > 0 && (
                <SecTitle>Completed ({completedDocs.length})</SecTitle>
              )}
              <AuroraGrid
                style={{ marginTop: processingDocs.length > 0 ? 16 : 0 }}
              >
                {completedDocs.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.3 + index * 0.08,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    <DocumentCard document={doc} />
                  </motion.div>
                ))}
              </AuroraGrid>
            </section>
          ) : (
            processingDocs.length === 0 && (
              <EmptyState
                title="No matching documents"
                description="Try adjusting your search or filter."
              />
            )
          )}

          {hasMore && (
            <div
              ref={sentinelRef}
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "32px 0",
              }}
            >
              {isFetching && <Loader />}
            </div>
          )}
        </>
      )}
    </>
  );
}
