"use client";

import {
  Box,
  Stack,
  Tabs,
  Tab,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Card } from "@/shared/components";
import { Button } from "@/shared/components/ui/Button";
import { ButtonVariants } from "@/shared/types";
import { palette } from "@/shared/theme";
import {
  tabSx,
  fieldSx,
  inviteLinkBoxSx,
  inviteLinkTextSx,
} from "./AdminInvitations.styles";
import { motion } from "framer-motion";
import { Send, UserPlus, Copy, Check } from "lucide-react";
import type { useInvitationForm } from "../../hooks/useInvitation";

type FormState = ReturnType<typeof useInvitationForm>;

interface Props {
  form: FormState;
}

export function AdminInvitationForm({ form }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card variant="glass" hoverable={false} sx={{ mb: 3 }}>
        <Card.Content>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                letterSpacing: "-0.3px",
              }}
            >
              Add to Platform
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "info.light", mt: 0.5, fontSize: "0.8rem" }}
            >
              Send an email invite or create an account directly
            </Typography>
          </Box>

          <Tabs
            value={form.tab}
            onChange={form.handleTabChange}
            sx={{ mb: 3 }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label="Send Invite"
              icon={<Send size={15} color="currentColor" />}
              iconPosition="start"
              sx={tabSx}
            />
            <Tab
              label="Create User"
              icon={<UserPlus size={15} color="currentColor" />}
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
                  sx={{ flex: 1, ...fieldSx }}
                />
                <FormControl size="small" sx={{ minWidth: 120, ...fieldSx }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={form.role}
                    label="Role"
                    onChange={(e) => form.setRole(e.target.value)}
                    MenuProps={{ disableScrollLock: true }}
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
                  sx={{ flex: 1, ...fieldSx }}
                />
                <TextField
                  size="small"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => form.setEmail(e.target.value)}
                  sx={{ flex: 1, ...fieldSx }}
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
                  sx={{ flex: 1, ...fieldSx }}
                />
                <FormControl size="small" sx={{ minWidth: 120, ...fieldSx }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={form.role}
                    label="Role"
                    onChange={(e) => form.setRole(e.target.value)}
                    MenuProps={{ disableScrollLock: true }}
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
  );
}
