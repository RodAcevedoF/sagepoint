"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Box,
  alpha,
  IconButton,
} from "@mui/material";
import { Card } from "@/shared/components";
import { EmptyState } from "@/shared/components";
import { palette } from "@/shared/theme";
import {
  formatDate,
  isExpired,
  invitationStatusColors,
} from "@/features/admin/utils/adminFeat.utils";
import {
  styles,
  countChipSx,
  getRoleChipSx,
  getStatusChipSx,
} from "./AdminInvitations.styles";
import type { AdminInvitationDto } from "@/infrastructure/api/adminApi";
import { motion } from "framer-motion";
import { Mail, Calendar, Clock, MoreVertical, Users } from "lucide-react";

interface Props {
  invitations: AdminInvitationDto[];
  onOpenMenu: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
}

export function AdminInvitationList({ invitations, onOpenMenu }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card variant="glass">
        <Card.Header>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Users size={18} color="rgba(255,255,255,0.55)" />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                letterSpacing: "-0.3px",
              }}
            >
              Invitations
            </Typography>
            <Chip label={invitations.length} size="small" sx={countChipSx} />
          </Box>
        </Card.Header>

        <Card.Content sx={{ p: 0 }}>
          {!invitations.length ? (
            <Box sx={{ p: 4 }}>
              <EmptyState
                title="No invitations yet"
                description="Use the form above to invite users to the platform."
              />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={styles.headerCell}>Email</TableCell>
                    <TableCell sx={styles.headerCell}>Role</TableCell>
                    <TableCell sx={styles.headerCell}>Status</TableCell>
                    <TableCell sx={styles.headerCell}>Invited By</TableCell>
                    <TableCell sx={styles.headerCell}>Expires</TableCell>
                    <TableCell sx={styles.headerCell}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invitations.map((inv) => {
                    const expired = isExpired(inv.expiresAt, inv.status);
                    const statusStyle = expired
                      ? invitationStatusColors.REVOKED
                      : (invitationStatusColors[inv.status] ??
                        invitationStatusColors.PENDING);
                    return (
                      <TableRow key={inv.id} sx={styles.row}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Mail
                              size={14}
                              color={alpha(palette.text.secondary, 0.4)}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "text.primary" }}
                            >
                              {inv.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={inv.role}
                            size="small"
                            sx={getRoleChipSx(inv.role)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={expired ? "EXPIRED" : inv.status}
                            size="small"
                            sx={getStatusChipSx(statusStyle)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            {inv.invitedBy?.name ?? "Unknown"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {expired ? (
                              <Clock size={14} color={palette.error.main} />
                            ) : (
                              <Calendar
                                size={14}
                                color={alpha(palette.text.secondary, 0.4)}
                              />
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                color: expired
                                  ? palette.error.light
                                  : "text.secondary",
                              }}
                            >
                              {formatDate(inv.expiresAt)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {inv.status === "PENDING" && !expired && (
                            <IconButton
                              size="small"
                              onClick={(e) => onOpenMenu(e, inv.id)}
                            >
                              <MoreVertical size={16} />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card.Content>
      </Card>
    </motion.div>
  );
}
