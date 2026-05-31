"use client";

import { useState, useCallback } from "react";
import {
  Box,
  IconButton,
  Checkbox,
  Button as MuiButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
} from "@mui/material";
import {
  Card,
  ConfirmDialog,
  ErrorState,
  Loader,
  Pill,
} from "@/shared/components";
import { FileText, Trash2 } from "lucide-react";
import {
  useAdminDocumentsQuery,
  useDeleteAdminDocumentMutation,
} from "@/application/admin";
import { aurora, auroraTint } from "@/shared/theme";
import {
  adminTableStyles,
  filterButtonSx,
  filterMenuPaperSx,
  filterSelectSx,
  iconActionSx,
  paginationSx,
} from "../AdminRoadmaps/adminTable.styles";
import { StatusChip } from "../Cards/StatusChip";
import { useAdminSnackbar } from "../../hooks/useAdminSnackbar";
import { formatDate, statusColors } from "../../utils/adminFeat.utils";

const stageColors: Record<string, string> = {
  UPLOADED: aurora.status.concept,
  PARSING: aurora.status.proc,
  ANALYZING: aurora.status.enrich,
  SUMMARIZED: aurora.teal,
  READY: aurora.status.ready,
};

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function useSelection<T extends { id: string }>(items: T[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((i) => i.id)),
    );
  }, [items]);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  return { selected, toggleAll, toggleOne, remove, clear };
}

const HEADERS = [
  "Filename",
  "User",
  "Stage",
  "Status",
  "Size",
  "Created",
  "Actions",
] as const;

const filenameCellSx = {
  fontWeight: 600,
  fontSize: "14.5px",
  color: aurora.txHi,
  maxWidth: 220,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
} as const;

const mutedSx = {
  fontSize: "13.5px",
  color: aurora.txMid,
} as const;

const dateCellSx = {
  fontFamily: aurora.font.mono,
  fontSize: "13px",
  color: aurora.txMid,
  whiteSpace: "nowrap" as const,
} as const;

const checkboxSx = {
  color: aurora.txMid,
  "&.Mui-checked": { color: aurora.teal },
  "&.MuiCheckbox-indeterminate": { color: aurora.teal },
  "&:hover": { background: auroraTint(aurora.teal, 0.08) },
} as const;

export function AdminDocumentsTable() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [stageFilter, setStageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { show, SnackbarAlert } = useAdminSnackbar();

  const { data, isLoading, isError } = useAdminDocumentsQuery({
    stage: stageFilter || undefined,
    status: statusFilter || undefined,
    page: page + 1,
    limit,
  });

  const [deleteDocument] = useDeleteAdminDocumentMutation();
  const [deleteTarget, setDeleteTarget] = useState<
    { type: "single"; id: string; filename: string } | { type: "bulk" } | null
  >(null);

  const documents = data?.data ?? [];
  const total = data?.total ?? 0;
  const { selected, toggleAll, toggleOne, remove, clear } =
    useSelection(documents);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "single") {
      const { id, filename } = deleteTarget;
      setDeleteTarget(null);
      try {
        await deleteDocument(id).unwrap();
        remove(id);
        show("Document deleted", "success");
      } catch {
        show(`Failed to delete "${filename}"`, "error");
      }
      return;
    }

    setDeleteTarget(null);
    const results = await Promise.all(
      Array.from(selected).map((id) =>
        deleteDocument(id)
          .unwrap()
          .then(() => ({ ok: true }))
          .catch(() => ({ ok: false })),
      ),
    );
    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.length - succeeded;
    clear();
    show(
      failed > 0
        ? `Deleted ${succeeded}, failed ${failed}`
        : `Deleted ${succeeded} document(s)`,
      failed > 0 ? "error" : "success",
    );
  };

  if (isLoading) return <Loader variant="page" message="Loading documents" />;
  if (isError)
    return (
      <ErrorState
        title="Failed to load documents"
        description="Could not retrieve document data."
      />
    );

  return (
    <>
      <Card variant="aurora" hoverable={false} withAura={false}>
        <Box sx={adminTableStyles.panelHead}>
          <Box sx={adminTableStyles.panelTitle}>
            <Box sx={adminTableStyles.panelTitleIcon}>
              <FileText size={20} />
            </Box>
            <Box component="h2" sx={adminTableStyles.panelHeading}>
              Document Management
            </Box>
            <Pill tone="ready">{total} total</Pill>
          </Box>
        </Box>

        <Box sx={adminTableStyles.filterBar}>
          <FormControl size="small" sx={filterSelectSx}>
            <InputLabel>Stage</InputLabel>
            <Select
              value={stageFilter}
              label="Stage"
              MenuProps={{ slotProps: { paper: { sx: filterMenuPaperSx } } }}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="UPLOADED">Uploaded</MenuItem>
              <MenuItem value="PARSING">Parsing</MenuItem>
              <MenuItem value="ANALYZING">Analyzing</MenuItem>
              <MenuItem value="SUMMARIZED">Summarized</MenuItem>
              <MenuItem value="READY">Ready</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={filterSelectSx}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              MenuProps={{ slotProps: { paper: { sx: filterMenuPaperSx } } }}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PROCESSING">Processing</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
            </Select>
          </FormControl>
          {selected.size > 0 && (
            <MuiButton
              size="small"
              startIcon={<Trash2 size={14} />}
              onClick={() => setDeleteTarget({ type: "bulk" })}
              sx={filterButtonSx}
            >
              Delete Selected ({selected.size})
            </MuiButton>
          )}
        </Box>

        <Box sx={adminTableStyles.tableScroll}>
          <Box component="table" sx={adminTableStyles.table}>
            <Box component="thead">
              <Box component="tr">
                <Box
                  component="th"
                  sx={{
                    ...adminTableStyles.headerCell,
                    width: 40,
                    padding: "12px 8px 12px 20px",
                  }}
                >
                  <Checkbox
                    indeterminate={
                      selected.size > 0 && selected.size < documents.length
                    }
                    checked={
                      documents.length > 0 && selected.size === documents.length
                    }
                    onChange={toggleAll}
                    size="small"
                    sx={checkboxSx}
                  />
                </Box>
                {HEADERS.map((h) => (
                  <Box component="th" key={h} sx={adminTableStyles.headerCell}>
                    {h}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {documents.map((doc) => (
                <Box component="tr" key={doc.id} sx={adminTableStyles.row}>
                  <Box
                    component="td"
                    sx={{
                      ...adminTableStyles.bodyCell,
                      width: 40,
                      padding: "12px 8px 12px 20px",
                    }}
                  >
                    <Checkbox
                      checked={selected.has(doc.id)}
                      onChange={() => toggleOne(doc.id)}
                      size="small"
                      sx={checkboxSx}
                    />
                  </Box>
                  <Box component="td" sx={adminTableStyles.bodyCell}>
                    <Box sx={filenameCellSx} title={doc.filename}>
                      {doc.filename}
                    </Box>
                  </Box>
                  <Box component="td" sx={adminTableStyles.bodyCell}>
                    <Box sx={mutedSx}>{doc.user.name}</Box>
                  </Box>
                  <Box component="td" sx={adminTableStyles.bodyCell}>
                    <StatusChip
                      label={doc.processingStage}
                      colorMap={stageColors}
                    />
                  </Box>
                  <Box component="td" sx={adminTableStyles.bodyCell}>
                    <StatusChip label={doc.status} colorMap={statusColors} />
                  </Box>
                  <Box component="td" sx={adminTableStyles.bodyCell}>
                    <Box sx={mutedSx}>{formatFileSize(doc.fileSize)}</Box>
                  </Box>
                  <Box component="td" sx={adminTableStyles.bodyCell}>
                    <Box sx={dateCellSx}>{formatDate(doc.createdAt)}</Box>
                  </Box>
                  <Box component="td" sx={adminTableStyles.bodyCell}>
                    <IconButton
                      sx={iconActionSx}
                      size="small"
                      onClick={() =>
                        setDeleteTarget({
                          type: "single",
                          id: doc.id,
                          filename: doc.filename,
                        })
                      }
                      aria-label="Delete document"
                    >
                      <Trash2 size={16} color={aurora.status.fail} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          sx={paginationSx}
          slotProps={{
            select: {
              MenuProps: { slotProps: { paper: { sx: filterMenuPaperSx } } },
            },
          }}
        />
      </Card>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={
          deleteTarget?.type === "bulk"
            ? `Delete ${selected.size} Document(s)`
            : "Delete Document"
        }
        description={
          deleteTarget?.type === "bulk" ? (
            <>
              Are you sure you want to delete <strong>{selected.size}</strong>{" "}
              document(s)? This action cannot be undone.
            </>
          ) : deleteTarget?.type === "single" ? (
            <>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.filename}</strong>? This action cannot be
              undone.
            </>
          ) : null
        }
        confirmLabel={
          deleteTarget?.type === "bulk"
            ? `Delete ${selected.size} Document(s)`
            : "Delete"
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {SnackbarAlert}
    </>
  );
}
