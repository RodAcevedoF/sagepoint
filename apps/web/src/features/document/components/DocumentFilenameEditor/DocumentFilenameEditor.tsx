"use client";

import { useState } from "react";
import { Box, TextField } from "@mui/material";
import { Pencil } from "lucide-react";
import { useUpdateFilenameCommand } from "@/application/document";
import { useSnackbar } from "@/shared/components";
import { aurora as auroraPalette } from "@/shared/theme";

const titleSx = {
  position: "relative",
  zIndex: 1,
  margin: 0,
  fontFamily: auroraPalette.font.display,
  fontWeight: 800,
  fontSize: "clamp(32px, 4vw, 52px)",
  lineHeight: 1.02,
  letterSpacing: "-0.025em",
  background: `linear-gradient(120deg, ${auroraPalette.txHi} 30%, ${auroraPalette.teal} 95%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  wordBreak: "break-word",
} as const;

interface DocumentFilenameEditorProps {
  documentId: string;
  filename: string;
  editable: boolean;
}

export function DocumentFilenameEditor({
  documentId,
  filename,
  editable,
}: DocumentFilenameEditorProps) {
  const { execute: updateFilename, isLoading } = useUpdateFilenameCommand();
  const { showSnackbar } = useSnackbar();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  const enterEdit = () => {
    setValue(filename);
    setEditing(true);
  };

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === filename) {
      setEditing(false);
      return;
    }
    const result = await updateFilename(documentId, trimmed);
    if (result.ok) {
      showSnackbar("Name updated", { severity: "success" });
      setEditing(false);
    } else {
      showSnackbar("Failed to update name", { severity: "error" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <TextField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        autoFocus
        variant="standard"
        inputProps={{ maxLength: 200 }}
        sx={{
          "& .MuiInput-input": {
            ...titleSx,
            WebkitTextFillColor: "unset",
            color: auroraPalette.teal,
            p: 0,
          },
          "& .MuiInput-underline:before": {
            borderBottomColor: auroraPalette.line2,
          },
          "& .MuiInput-underline:after": {
            borderBottomColor: auroraPalette.teal,
          },
        }}
      />
    );
  }

  return (
    <Box
      onClick={editable ? enterEdit : undefined}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        cursor: editable ? "pointer" : "default",
        "& .edit-icon": { opacity: 0, transition: "opacity 0.15s" },
        "&:hover .edit-icon": editable ? { opacity: 1 } : undefined,
      }}
    >
      <Box component="h1" sx={titleSx}>
        {filename}
      </Box>
      {editable && (
        <Pencil className="edit-icon" size={16} color={auroraPalette.teal} />
      )}
    </Box>
  );
}
