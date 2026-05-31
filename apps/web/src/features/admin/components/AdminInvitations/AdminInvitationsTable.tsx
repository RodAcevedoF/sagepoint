"use client";

import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from "@mui/material";
import { Trash2 } from "lucide-react";
import { aurora } from "@/shared/theme";
import { menuPaperSx, snackbarAlertSx } from "./AdminInvitations.styles";
import {
  useSnackbar,
  useInvitationForm,
  useRevokeMenu,
} from "../../hooks/useInvitation";
import { useGetAdminInvitationsQuery } from "@/application/admin";
import { Loader, ErrorState } from "@/shared/components";
import { AdminInvitationForm } from "./AdminInvitationForm";
import { AdminInvitationList } from "./AdminInvitationList";

export function AdminInvitationsTable() {
  const {
    data: invitations,
    isLoading,
    isError,
  } = useGetAdminInvitationsQuery();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const form = useInvitationForm(showSnackbar);
  const menu = useRevokeMenu(showSnackbar);

  if (isLoading) return <Loader variant="page" message="Loading invitations" />;
  if (isError)
    return (
      <ErrorState
        title="Failed to load invitations"
        description="Could not retrieve invitation data."
      />
    );

  return (
    <>
      <AdminInvitationForm form={form} />
      <AdminInvitationList
        invitations={invitations ?? []}
        onOpenMenu={menu.openMenu}
      />

      <Menu
        anchorEl={menu.anchorEl}
        open={Boolean(menu.anchorEl)}
        onClose={menu.closeMenu}
        disableScrollLock
        slotProps={{ paper: { sx: menuPaperSx } }}
      >
        <MenuItem onClick={menu.handleRevoke}>
          <ListItemIcon>
            <Trash2 size={16} color={aurora.status.fail} />
          </ListItemIcon>
          <ListItemText>Revoke Invitation</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={snackbarAlertSx}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
