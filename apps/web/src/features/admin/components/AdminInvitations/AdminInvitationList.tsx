"use client";

import { Box, IconButton } from "@mui/material";
import { Card, EmptyState, Pill } from "@/shared/components";
import { aurora } from "@/shared/theme";
import {
  formatDate,
  invitationStatusColors,
  isExpired,
} from "@/features/admin/utils/adminFeat.utils";
import {
  adminTableStyles,
  iconActionSx,
} from "../AdminRoadmaps/adminTable.styles";
import type { AdminInvitationDto } from "@/infrastructure/api/adminApi";
import {
  Mail,
  Calendar,
  Clock,
  MoreVertical,
  Users,
  Shield,
} from "lucide-react";

interface Props {
  invitations: AdminInvitationDto[];
  onOpenMenu: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
}

const HEADERS = [
  "Email",
  "Role",
  "Status",
  "Invited By",
  "Expires",
  "Actions",
] as const;

const mailRowSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "14px",
  color: aurora.txHi,
  fontWeight: 500,
  "& svg": { color: aurora.txLow },
} as const;

const invitedBySx = {
  fontSize: "13.5px",
  color: aurora.txMid,
} as const;

const expiresSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontFamily: aurora.font.mono,
  fontSize: "12.5px",
  whiteSpace: "nowrap" as const,
} as const;

export function AdminInvitationList({ invitations, onOpenMenu }: Props) {
  return (
    <Card variant="aurora" hoverable={false} withAura={false}>
      <Box sx={adminTableStyles.panelHead}>
        <Box sx={adminTableStyles.panelTitle}>
          <Box sx={adminTableStyles.panelTitleIcon}>
            <Users size={20} />
          </Box>
          <Box component="h2" sx={adminTableStyles.panelHeading}>
            Invitations
          </Box>
          <Pill tone="ready">{invitations.length} total</Pill>
        </Box>
      </Box>

      {!invitations.length ? (
        <Box sx={{ padding: { xs: "22px", md: "30px" } }}>
          <EmptyState
            title="No invitations yet"
            description="Use the form above to invite users to the platform."
          />
        </Box>
      ) : (
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
              {invitations.map((inv) => {
                const expired = isExpired(inv.expiresAt, inv.status);
                const effectiveStatus = expired ? "REVOKED" : inv.status;
                const displayStatus = expired ? "EXPIRED" : inv.status;
                const statusStyle =
                  invitationStatusColors[effectiveStatus] ??
                  invitationStatusColors.PENDING;
                const expiresColor = expired
                  ? aurora.status.fail
                  : aurora.txMid;
                return (
                  <Box component="tr" key={inv.id} sx={adminTableStyles.row}>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Box component="span" sx={mailRowSx}>
                        <Mail size={16} />
                        {inv.email}
                      </Box>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Pill
                        accent={
                          inv.role === "ADMIN"
                            ? aurora.status.fail
                            : aurora.txMid
                        }
                        icon={
                          inv.role === "ADMIN" ? (
                            <Shield size={12} />
                          ) : undefined
                        }
                      >
                        {inv.role}
                      </Pill>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Pill accent={statusStyle.text}>{displayStatus}</Pill>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Box sx={invitedBySx}>
                        {inv.invitedBy?.name ?? "Unknown"}
                      </Box>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Box
                        component="span"
                        sx={{ ...expiresSx, color: expiresColor }}
                      >
                        {expired ? <Clock size={14} /> : <Calendar size={14} />}
                        {formatDate(inv.expiresAt)}
                      </Box>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      {inv.status === "PENDING" && !expired && (
                        <IconButton
                          sx={iconActionSx}
                          size="small"
                          onClick={(e) => onOpenMenu(e, inv.id)}
                          aria-label="Invitation actions"
                        >
                          <MoreVertical size={16} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}
    </Card>
  );
}
