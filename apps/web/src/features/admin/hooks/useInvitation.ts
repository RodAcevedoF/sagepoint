import { useState, type SyntheticEvent, type MouseEvent } from "react";
import {
  useCreateInvitationMutation,
  useCreateUserDirectMutation,
  useRevokeInvitationMutation,
} from "@/application/admin";
import { buildInviteLink } from "../utils/adminFeat.utils";

type Severity = "success" | "error";
type ShowSnackbar = (message: string, severity: Severity) => void;

export function useSnackbar() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: Severity;
  }>({ open: false, message: "", severity: "success" });

  const showSnackbar: ShowSnackbar = (message, severity) =>
    setSnackbar({ open: true, message, severity });

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return { snackbar, showSnackbar, closeSnackbar };
}

export function useInvitationForm(showSnackbar: ShowSnackbar) {
  const [createInvitation, { isLoading: isCreating }] =
    useCreateInvitationMutation();
  const [createUserDirect, { isLoading: isCreatingUser }] =
    useCreateUserDirectMutation();

  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTabChange = (_: SyntheticEvent, v: number) => {
    setTab(v);
    setInviteLink(null);
  };

  const handleCreateInvite = async () => {
    if (!email.trim()) return;
    try {
      const result = await createInvitation({
        email: email.trim(),
        role,
      }).unwrap();
      setInviteLink(buildInviteLink(result.token));
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

  return {
    tab,
    email,
    setEmail,
    role,
    setRole,
    name,
    setName,
    password,
    setPassword,
    inviteLink,
    copied,
    isCreating,
    isCreatingUser,
    handleTabChange,
    handleCreateInvite,
    handleCreateDirect,
    handleCopyLink,
  };
}

export function useRevokeMenu(showSnackbar: ShowSnackbar) {
  const [revokeInvitation] = useRevokeInvitationMutation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openMenu = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    setAnchorEl(e.currentTarget);
    setSelectedId(id);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedId(null);
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

  return { anchorEl, openMenu, closeMenu, handleRevoke };
}
