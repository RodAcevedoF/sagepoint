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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import { Card } from "@/shared/components";
import { Button } from "@/shared/components/ui/Button";
import { ButtonVariants } from "@/shared/types";
import { palette } from "@/shared/theme";
import {
  formatDate,
  isExpired,
  invitationStatusColors,
} from "@/features/admin/utils/adminFeat.utils";
import {
  styles,
  tabSx,
  inviteLinkBoxSx,
  inviteLinkTextSx,
  countChipSx,
  getRoleChipSx,
  getStatusChipSx,
  menuPaperSx,
} from "./AdminInvitations.styles";
import {
  useSnackbar,
  useInvitationForm,
  useRevokeMenu,
} from "../../hooks/useInvitation";
import { motion } from "framer-motion";
import {
  MailPlus,
  Mail,
  Calendar,
  Clock,
  MoreVertical,
  Trash2,
  Send,
  UserPlus,
  Copy,
  Check,
} from "lucide-react";
import { useGetAdminInvitationsQuery } from "@/application/admin";
import { Loader, ErrorState, EmptyState } from "@/shared/components";

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
      {/* Create Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card variant="glass" hoverable={false} sx={{ mb: 3 }}>
          <Card.Content>
            <Tabs
              value={form.tab}
              onChange={form.handleTabChange}
              sx={{ mb: 1 }}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab
                label="Send Invite"
                icon={<Send size={16} />}
                iconPosition="start"
                sx={tabSx}
              />
              <Tab
                label="Create User Directly"
                icon={<UserPlus size={16} />}
                iconPosition="start"
                sx={tabSx}
              />
            </Tabs>

            {form.tab === 0 ? (
              <>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ sm: "center" }}
                >
                  <TextField
                    size="small"
                    label="Email address"
                    type="email"
                    value={form.email}
                    onChange={(e) => form.setEmail(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && form.handleCreateInvite()
                    }
                    sx={{ flex: 1 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={form.role}
                      label="Role"
                      onChange={(e) => form.setRole(e.target.value)}
                    >
                      <MenuItem value="USER">User</MenuItem>
                      <MenuItem value="ADMIN">Admin</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    label="Send Invite"
                    icon={Send}
                    variant={ButtonVariants.DEFAULT}
                    onClick={form.handleCreateInvite}
                    loading={form.isCreating}
                    disabled={!form.email.trim()}
                  />
                </Stack>
                {form.inviteLink && (
                  <Box sx={inviteLinkBoxSx}>
                    <Typography variant="body2" sx={inviteLinkTextSx}>
                      {form.inviteLink}
                    </Typography>
                    <Tooltip title={form.copied ? "Copied!" : "Copy link"}>
                      <IconButton
                        size="small"
                        onClick={form.handleCopyLink}
                        sx={{ color: palette.success.light }}
                      >
                        {form.copied ? <Check size={18} /> : <Copy size={18} />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </>
            ) : (
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    size="small"
                    label="Full Name"
                    value={form.name}
                    onChange={(e) => form.setName(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => form.setEmail(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Stack>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ sm: "center" }}
                >
                  <TextField
                    size="small"
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => form.setPassword(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={form.role}
                      label="Role"
                      onChange={(e) => form.setRole(e.target.value)}
                    >
                      <MenuItem value="USER">User</MenuItem>
                      <MenuItem value="ADMIN">Admin</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    label="Create User"
                    icon={UserPlus}
                    variant={ButtonVariants.DEFAULT}
                    onClick={form.handleCreateDirect}
                    loading={form.isCreatingUser}
                    disabled={
                      !form.email.trim() ||
                      !form.name.trim() ||
                      !form.password.trim()
                    }
                  />
                </Stack>
              </Stack>
            )}
          </Card.Content>
        </Card>
      </motion.div>

      {/* Invitations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          variant="glass"
          sx={{ borderTop: `1px solid ${alpha(palette.info.main, 0.2)}` }}
        >
          <Card.Header>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MailPlus size={20} color={palette.info.main} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
              >
                Invitations
              </Typography>
              <Chip
                label={`${invitations?.length ?? 0} total`}
                size="small"
                sx={countChipSx}
              />
            </Box>
          </Card.Header>
          <Card.Content sx={{ p: 0 }}>
            {!invitations?.length ? (
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
                              <Typography variant="body2">
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
                              sx={{ color: palette.text.secondary }}
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
                                    : palette.text.secondary,
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
                                onClick={(e) => menu.openMenu(e, inv.id)}
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

      <Menu
        anchorEl={menu.anchorEl}
        open={Boolean(menu.anchorEl)}
        onClose={menu.closeMenu}
        slotProps={{ paper: { sx: menuPaperSx } }}
      >
        <MenuItem onClick={menu.handleRevoke}>
          <ListItemIcon>
            <Trash2 size={16} color={palette.error.main} />
          </ListItemIcon>
          <ListItemText>Revoke Invitation</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
