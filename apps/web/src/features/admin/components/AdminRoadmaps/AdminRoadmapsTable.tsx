"use client";

import { useState } from "react";
import {
  Box,
  IconButton,
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
import { Map, Trash2, Star, Globe, Lock } from "lucide-react";
import { RoadmapVisibility } from "@sagepoint/domain";
import {
  useAdminRoadmapsQuery,
  useDeleteAdminRoadmapMutation,
  useToggleRoadmapFeaturedMutation,
} from "@/application/admin";
import { aurora } from "@/shared/theme";
import {
  adminTableStyles,
  filterMenuPaperSx,
  filterSelectSx,
  iconActionSx,
  paginationSx,
} from "./adminTable.styles";
import { StatusChip } from "../Cards/StatusChip";
import { useAdminSnackbar } from "../../hooks/useAdminSnackbar";
import { formatDate, statusColors } from "../../utils/adminFeat.utils";

const HEADERS = [
  "Title",
  "User",
  "Category",
  "Status",
  "Visibility",
  "Featured",
  "Created",
  "Actions",
] as const;

const titleCellSx = {
  fontWeight: 600,
  fontSize: "14.5px",
  color: aurora.txHi,
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

const starButtonSx = {
  width: 36,
  height: 36,
  borderRadius: aurora.radii.md,
  color: aurora.status.proc,
  "&:hover": {
    background: "color-mix(in oklch, var(--accent-warn) 12%, transparent)",
  },
} as const;

export function AdminRoadmapsTable() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const { show, SnackbarAlert } = useAdminSnackbar();

  const { data, isLoading, isError } = useAdminRoadmapsQuery({
    status: statusFilter || undefined,
    page: page + 1,
    limit,
  });

  const [deleteRoadmap] = useDeleteAdminRoadmapMutation();
  const [toggleFeatured] = useToggleRoadmapFeaturedMutation();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { id, title } = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteRoadmap(id).unwrap();
      show("Roadmap deleted", "success");
    } catch {
      show(`Failed to delete "${title}"`, "error");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleFeatured(id).unwrap();
    } catch {
      show("Failed to toggle featured", "error");
    }
  };

  if (isLoading) return <Loader variant="page" message="Loading roadmaps" />;
  if (isError)
    return (
      <ErrorState
        title="Failed to load roadmaps"
        description="Could not retrieve roadmap data."
      />
    );

  const roadmaps = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <>
      <Card variant="aurora" hoverable={false} withAura={false}>
        <Box sx={adminTableStyles.panelHead}>
          <Box sx={adminTableStyles.panelTitle}>
            <Box sx={adminTableStyles.panelTitleIcon}>
              <Map size={20} />
            </Box>
            <Box component="h2" sx={adminTableStyles.panelHeading}>
              Roadmap Management
            </Box>
            <Pill tone="ready">{total} total</Pill>
          </Box>
        </Box>

        <Box sx={adminTableStyles.filterBar}>
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
        </Box>

        <Box sx={adminTableStyles.tableScroll}>
          <Box component="table" sx={adminTableStyles.table}>
            <Box component="thead">
              <Box component="tr">
                {HEADERS.map((h) => (
                  <Box component="th" key={h} sx={adminTableStyles.headerCell}>
                    {h}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {roadmaps.map((roadmap) => {
                const isPublic =
                  roadmap.visibility.toLowerCase() === RoadmapVisibility.PUBLIC;
                return (
                  <Box
                    component="tr"
                    key={roadmap.id}
                    sx={adminTableStyles.row}
                  >
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Box sx={titleCellSx}>{roadmap.title}</Box>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Box sx={mutedSx}>{roadmap.user.name}</Box>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Box sx={mutedSx}>{roadmap.category?.name ?? "—"}</Box>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <StatusChip
                        label={roadmap.generationStatus}
                        colorMap={statusColors}
                      />
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Pill
                        tone={isPublic ? "ready" : "teal"}
                        accent={isPublic ? undefined : aurora.txMid}
                        icon={
                          isPublic ? <Globe size={12} /> : <Lock size={12} />
                        }
                      >
                        {isPublic ? "Public" : "Private"}
                      </Pill>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <IconButton
                        sx={starButtonSx}
                        size="small"
                        onClick={() => handleToggleFeatured(roadmap.id)}
                        aria-label={
                          roadmap.isFeatured
                            ? "Unfeature roadmap"
                            : "Feature roadmap"
                        }
                      >
                        <Star
                          size={18}
                          fill={
                            roadmap.isFeatured ? aurora.status.proc : "none"
                          }
                        />
                      </IconButton>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Box sx={dateCellSx}>{formatDate(roadmap.createdAt)}</Box>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <IconButton
                        sx={iconActionSx}
                        size="small"
                        onClick={() =>
                          setDeleteTarget({
                            id: roadmap.id,
                            title: roadmap.title,
                          })
                        }
                        aria-label="Delete roadmap"
                      >
                        <Trash2 size={16} color={aurora.status.fail} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
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
        title="Delete Roadmap"
        description={
          deleteTarget ? (
            <>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.title}</strong>? This action cannot be
              undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {SnackbarAlert}
    </>
  );
}
