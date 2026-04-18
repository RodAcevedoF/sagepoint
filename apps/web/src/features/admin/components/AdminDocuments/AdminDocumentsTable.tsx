"use client";

import { useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  Box,
  alpha,
  IconButton,
  Checkbox,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Card, ConfirmDialog, Loader, ErrorState } from "@/shared/components";
import { palette } from "@/shared/theme";
import { motion } from "framer-motion";
import { FileText, Trash2 } from "lucide-react";
import {
  useAdminDocumentsQuery,
  useDeleteAdminDocumentMutation,
} from "@/application/admin";
import { adminTableStyles } from "../AdminRoadmaps/adminTable.styles";
import { StatusChip } from "../Cards/StatusChip";
import { useAdminSnackbar } from "../../hooks/useAdminSnackbar";
import { formatDate, statusColors } from "../../utils/adminFeat.utils";

const stageColors: Record<string, string> = {
  UPLOADED: palette.info.main,
  PARSING: palette.warning.main,
  ANALYZING: palette.warning.light,
  SUMMARIZED: palette.primary.main,
  READY: palette.success.main,
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
];

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
    | {
        type: "single";
        id: string;
        filename: string;
      }
    | { type: "bulk" }
    | null
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
    } else {
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
    }
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          variant="glass"
          sx={{
            borderTop: `1px solid ${alpha(palette.primary.main, 0.2)}`,
          }}
        >
          <Card.Header>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FileText size={20} color={palette.primary.main} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
              >
                Document Management
              </Typography>
              <Chip
                label={`${total} total`}
                size="small"
                sx={{
                  ml: 1,
                  height: 20,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  bgcolor: alpha(palette.secondary.light, 0.1),
                  color: palette.secondary.light,
                  border: "none",
                }}
              />
            </Box>
          </Card.Header>
          <Card.Content>
            <Box sx={adminTableStyles.filterBar}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Stage</InputLabel>
                <Select
                  value={stageFilter}
                  label="Stage"
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
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
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
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Trash2 size={14} />}
                  onClick={() => setDeleteTarget({ type: "bulk" })}
                >
                  Delete Selected ({selected.size})
                </Button>
              )}
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={
                          selected.size > 0 && selected.size < documents.length
                        }
                        checked={
                          documents.length > 0 &&
                          selected.size === documents.length
                        }
                        onChange={toggleAll}
                        size="small"
                      />
                    </TableCell>
                    {HEADERS.map((h) => (
                      <TableCell key={h} sx={adminTableStyles.headerCell}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} sx={adminTableStyles.row}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.has(doc.id)}
                          onChange={() => toggleOne(doc.id)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {doc.filename}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: palette.text.secondary }}
                        >
                          {doc.user.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={doc.processingStage}
                          colorMap={stageColors}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={doc.status}
                          colorMap={statusColors}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: palette.text.secondary }}
                        >
                          {formatFileSize(doc.fileSize)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: palette.text.secondary }}
                        >
                          {formatDate(doc.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setDeleteTarget({
                              type: "single",
                              id: doc.id,
                              filename: doc.filename,
                            })
                          }
                        >
                          <Trash2 size={16} color={palette.error.main} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

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
              sx={{ color: palette.text.secondary }}
            />
          </Card.Content>
        </Card>
      </motion.div>

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
