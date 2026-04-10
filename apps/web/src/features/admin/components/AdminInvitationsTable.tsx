"use client";

import { useState } from "react";
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
import {
  useGetAdminInvitationsQuery,
  useCreateInvitationMutation,
  useRevokeInvitationMutation,
  useCreateUserDirectMutation,
} from "@/application/admin";
import { Loader, ErrorState, EmptyState } from "@/shared/components";

const styles = {
  headerCell: {
    color: palette.text.secondary,
    fontWeight: 700,
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    py: 2,
    borderBottom: `1px solid ${alpha(palette.divider, 0.1)}`,
  },
  row: {
    "&:hover": { bgcolor: alpha(palette.primary.main, 0.04) },
    transition: "background-color 0.2s ease",
  },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  PENDING: {
    bg: alpha(palette.warning.main, 0.1),
    text: palette.warning.light,
  },
  ACCEPTED: {
    bg: alpha(palette.success.main, 0.1),
    text: palette.success.light,
  },
  REVOKED: { bg: alpha(palette.error.main, 0.1), text: palette.error.light },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isExpired(expiresAt: string, status: string): boolean {
  return status === "PENDING" && new Date(expiresAt) < new Date();
}

function buildInviteLink(token: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/register?invitation=${token}`;
}

export function AdminInvitationsTable() {
  const {
    data: invitations,
    isLoading,
    isError,
  } = useGetAdminInvitationsQuery();
  const [createInvitation, { isLoading: isCreating }] =
    useCreateInvitationMutation();
  const [createUserDirect, { isLoading: isCreatingUser }] =
    useCreateUserDirectMutation();
  const [revokeInvitation] = useRevokeInvitationMutation();

  // Form state
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // Invite link display
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const showSnackbar = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const handleCreateInvite = async () => {
    if (!email.trim()) return;
    try {
      const result = await createInvitation({
        email: email.trim(),
        role,
      }).unwrap();
      const link = buildInviteLink(result.token);
      setInviteLink(link);
      setEmail("");
      showSnackbar("Invitation created — copy the link below", "success");
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to create invitation";
      showSnackbar(msg, "error");
    }
  };

  const handleCreateDirect = async () => {
    if (!email.trim() || !name.trim() || !password.trim()) return;
    try {
      await createUserDirect({
        email: email.trim(),
        name: name.trim(),
        password,
        role,
      }).unwrap();
      setEmail("");
      setName("");
      setPassword("");
      showSnackbar(
        "User created successfully — they can log in now",
        "success",
      );
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to create user";
      showSnackbar(msg, "error");
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async () => {
    if (!selectedId) return;
    setAnchorEl(null);
    try {
      await revokeInvitation(selectedId).unwrap();
      showSnackbar("Invitation revoked", "success");
    } catch {
      showSnackbar("Failed to revoke invitation", "error");
    }
    setSelectedId(null);
  };

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
              value={tab}
              onChange={(_, v) => {
                setTab(v);
                setInviteLink(null);
              }}
              sx={{ mb: 2 }}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab
                label="Send Invite"
                icon={<Send size={16} />}
                iconPosition="start"
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
              <Tab
                label="Create User Directly"
                icon={<UserPlus size={16} />}
                iconPosition="start"
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
            </Tabs>

            {tab === 0 ? (
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateInvite()}
                    sx={{ flex: 1 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={role}
                      label="Role"
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <MenuItem value="USER">User</MenuItem>
                      <MenuItem value="ADMIN">Admin</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    label="Send Invite"
                    icon={Send}
                    variant={ButtonVariants.DEFAULT}
                    onClick={handleCreateInvite}
                    loading={isCreating}
                    disabled={!email.trim()}
                  />
                </Stack>
                {inviteLink && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(palette.success.main, 0.08),
                      border: `1px solid ${alpha(palette.success.main, 0.2)}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        wordBreak: "break-all",
                        color: palette.success.light,
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                      }}
                    >
                      {inviteLink}
                    </Typography>
                    <Tooltip title={copied ? "Copied!" : "Copy link"}>
                      <IconButton
                        size="small"
                        onClick={handleCopyLink}
                        sx={{ color: palette.success.light }}
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={role}
                      label="Role"
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <MenuItem value="USER">User</MenuItem>
                      <MenuItem value="ADMIN">Admin</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    label="Create User"
                    icon={UserPlus}
                    variant={ButtonVariants.DEFAULT}
                    onClick={handleCreateDirect}
                    loading={isCreatingUser}
                    disabled={!email.trim() || !name.trim() || !password.trim()}
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
                sx={{
                  ml: 1,
                  height: 20,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  bgcolor: alpha(palette.info.main, 0.1),
                  color: palette.info.light,
                  border: "none",
                }}
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
                        ? statusColors.REVOKED
                        : (statusColors[inv.status] ?? statusColors.PENDING);
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
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                borderRadius: "6px",
                                bgcolor:
                                  inv.role === "ADMIN"
                                    ? alpha(palette.error.main, 0.1)
                                    : alpha(palette.text.secondary, 0.1),
                                color:
                                  inv.role === "ADMIN"
                                    ? palette.error.light
                                    : palette.text.secondary,
                                border: "none",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={expired ? "EXPIRED" : inv.status}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                borderRadius: "6px",
                                bgcolor: statusStyle.bg,
                                color: statusStyle.text,
                                border: "none",
                              }}
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
                                onClick={(e) => {
                                  setAnchorEl(e.currentTarget);
                                  setSelectedId(inv.id);
                                }}
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
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedId(null);
        }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: palette.background.paper,
              border: `1px solid ${alpha(palette.divider, 0.1)}`,
            },
          },
        }}
      >
        <MenuItem onClick={handleRevoke}>
          <ListItemIcon>
            <Trash2 size={16} color={palette.error.main} />
          </ListItemIcon>
          <ListItemText>Revoke Invitation</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
