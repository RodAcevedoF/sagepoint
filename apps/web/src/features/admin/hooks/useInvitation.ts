import { useState, type MouseEvent } from "react";
import {
  useCreateInvitationCommand,
  useCreateUserDirectCommand,
  useRevokeInvitationCommand,
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
  const createInvitation = useCreateInvitationCommand();
  const createUserDirect = useCreateUserDirectCommand();

  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTabChange = (v: number) => {
    setTab(v);
    setInviteLink(null);
  };

  const handleCreateInvite = async () => {
    if (!email.trim()) return;
    const result = await createInvitation.execute({
      email: email.trim(),
      role,
    });
    if (!result.ok) {
      showSnackbar(
        result.error.message || "Failed to create invitation",
        "error",
      );
      return;
    }
    setInviteLink(buildInviteLink(result.data.token));
    setEmail("");
    showSnackbar("Invitation created — copy the link below", "success");
  };

  const handleCreateDirect = async () => {
    if (!email.trim() || !name.trim() || !password.trim()) return;
    const result = await createUserDirect.execute({
      email: email.trim(),
      name: name.trim(),
      password,
      role,
    });
    if (!result.ok) {
      showSnackbar(result.error.message || "Failed to create user", "error");
      return;
    }
    setEmail("");
    setName("");
    setPassword("");
    showSnackbar("User created successfully — they can log in now", "success");
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
    isCreating: createInvitation.isLoading,
    isCreatingUser: createUserDirect.isLoading,
    handleTabChange,
    handleCreateInvite,
    handleCreateDirect,
    handleCopyLink,
  };
}

export function useRevokeMenu(showSnackbar: ShowSnackbar) {
  const revokeInvitation = useRevokeInvitationCommand();
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
    const result = await revokeInvitation.execute(selectedId);
    showSnackbar(
      result.ok ? "Invitation revoked" : "Failed to revoke invitation",
      result.ok ? "success" : "error",
    );
    setSelectedId(null);
  };

  return { anchorEl, openMenu, closeMenu, handleRevoke };
}
