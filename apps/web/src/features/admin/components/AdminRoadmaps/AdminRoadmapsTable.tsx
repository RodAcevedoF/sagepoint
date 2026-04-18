"use client";

import { useState } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Card, ConfirmDialog, Loader, ErrorState } from "@/shared/components";
import { palette } from "@/shared/theme";
import { motion } from "framer-motion";
import { Map, Trash2, Star, Globe, Lock } from "lucide-react";
import { RoadmapVisibility } from "@sagepoint/domain";
import {
  useAdminRoadmapsQuery,
  useDeleteAdminRoadmapMutation,
  useToggleRoadmapFeaturedMutation,
} from "@/application/admin";
import { adminTableStyles } from "./adminTable.styles";
import { StatusChip } from "../Cards/StatusChip";
import { useAdminSnackbar } from "../../hooks/useAdminSnackbar";
import { formatDate, statusColors } from "../../utils/adminFeat.utils";

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
              <Map size={20} color={palette.primary.main} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
              >
                Roadmap Management
              </Typography>
              <Chip
                label={`${total} total`}
                size="small"
                sx={{
                  ml: 1,
                  height: 20,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  bgcolor: alpha(palette.primary.main, 0.1),
                  color: palette.primary.light,
                  border: "none",
                }}
              />
            </Box>
          </Card.Header>
          <Card.Content>
            <Box sx={adminTableStyles.filterBar}>
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
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {[
                      "Title",
                      "User",
                      "Category",
                      "Status",
                      "Visibility",
                      "Featured",
                      "Created",
                      "Actions",
                    ].map((header) => (
                      <TableCell key={header} sx={adminTableStyles.headerCell}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roadmaps.map((roadmap) => (
                    <TableRow key={roadmap.id} sx={adminTableStyles.row}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {roadmap.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: palette.text.secondary }}
                        >
                          {roadmap.user.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: palette.text.secondary }}
                        >
                          {roadmap.category?.name ?? "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={roadmap.generationStatus}
                          colorMap={statusColors}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={
                            roadmap.visibility.toLowerCase() ===
                            RoadmapVisibility.PUBLIC ? (
                              <Globe size={14} />
                            ) : (
                              <Lock size={14} />
                            )
                          }
                          label={
                            roadmap.visibility.toLowerCase() ===
                            RoadmapVisibility.PUBLIC
                              ? "Public"
                              : "Private"
                          }
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            bgcolor: alpha(
                              roadmap.visibility.toLowerCase() ===
                                RoadmapVisibility.PUBLIC
                                ? palette.success.main
                                : palette.text.secondary,
                              0.1,
                            ),
                            color:
                              roadmap.visibility.toLowerCase() ===
                              RoadmapVisibility.PUBLIC
                                ? palette.success.main
                                : palette.text.secondary,
                            border: "none",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleFeatured(roadmap.id)}
                        >
                          <Star
                            size={18}
                            fill={
                              roadmap.isFeatured ? palette.warning.main : "none"
                            }
                            color={palette.warning.main}
                          />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: palette.text.secondary }}
                        >
                          {formatDate(roadmap.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setDeleteTarget({
                              id: roadmap.id,
                              title: roadmap.title,
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
