"use client";

import {
  Box,
  Stack,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import { AuroraTabs, Card, type AuroraTabItem } from "@/shared/components";
import { Button } from "@/shared/components/ui/Button";
import { ButtonVariants } from "@/shared/types";
import { Send, UserPlus, Copy, Check } from "lucide-react";
import {
  filterMenuPaperSx,
  filterSelectSx,
} from "../AdminRoadmaps/adminTable.styles";
import {
  copyButtonSx,
  formCardSx,
  formHeadingSx,
  formSubheadingSx,
  inviteLinkBoxSx,
  inviteLinkTextSx,
} from "./AdminInvitations.styles";
import type { useInvitationForm } from "../../hooks/useInvitation";

type FormState = ReturnType<typeof useInvitationForm>;

interface Props {
  form: FormState;
}

type TabId = "invite" | "create";

const TAB_ITEMS: ReadonlyArray<AuroraTabItem<TabId>> = [
  { id: "invite", label: "Send Invite" },
  { id: "create", label: "Create User" },
];

const fieldSx = {
  ...filterSelectSx,
  minWidth: 0,
} as const;

const roleSelectSx = {
  ...filterSelectSx,
  minWidth: 130,
} as const;

export function AdminInvitationForm({ form }: Props) {
  const activeTab: TabId = form.tab === 0 ? "invite" : "create";

  return (
    <Card variant="aurora" hoverable={false} withAura={false} sx={formCardSx}>
      <Box sx={{ marginBottom: "18px" }}>
        <Box component="h2" sx={formHeadingSx}>
          Add to Platform
        </Box>
        <Box sx={formSubheadingSx}>
          Send an email invite or create an account directly
        </Box>
      </Box>

      <Box sx={{ marginBottom: "22px" }}>
        <AuroraTabs<TabId>
          items={TAB_ITEMS}
          activeId={activeTab}
          onChange={(id) => form.handleTabChange(id === "invite" ? 0 : 1)}
        />
      </Box>

      {activeTab === "invite" ? (
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
              onKeyDown={(e) => e.key === "Enter" && form.handleCreateInvite()}
              sx={{ flex: 1, ...fieldSx }}
            />
            <FormControl size="small" sx={roleSelectSx}>
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role}
                label="Role"
                MenuProps={{
                  disableScrollLock: true,
                  slotProps: { paper: { sx: filterMenuPaperSx } },
                }}
                onChange={(e) => form.setRole(e.target.value)}
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <Button
              label="Send Invite"
              icon={Send}
              variant={ButtonVariants.AURORA}
              onClick={form.handleCreateInvite}
              loading={form.isCreating}
              disabled={!form.email.trim()}
            />
          </Stack>

          {form.inviteLink && (
            <Box sx={inviteLinkBoxSx}>
              <Box sx={inviteLinkTextSx}>{form.inviteLink}</Box>
              <Tooltip title={form.copied ? "Copied!" : "Copy link"}>
                <IconButton
                  size="small"
                  onClick={form.handleCopyLink}
                  sx={copyButtonSx}
                >
                  {form.copied ? <Check size={16} /> : <Copy size={16} />}
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
            <FormControl size="small" sx={roleSelectSx}>
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role}
                label="Role"
                MenuProps={{
                  disableScrollLock: true,
                  slotProps: { paper: { sx: filterMenuPaperSx } },
                }}
                onChange={(e) => form.setRole(e.target.value)}
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <Button
              label="Create User"
              icon={UserPlus}
              variant={ButtonVariants.AURORA}
              onClick={form.handleCreateDirect}
              loading={form.isCreatingUser}
              disabled={
                !form.email.trim() || !form.name.trim() || !form.password.trim()
              }
            />
          </Stack>
        </Stack>
      )}
    </Card>
  );
}
