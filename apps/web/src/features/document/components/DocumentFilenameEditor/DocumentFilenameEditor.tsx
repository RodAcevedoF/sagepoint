"use client";

import { useState } from "react";
import { Box, Typography, TextField, useTheme, alpha } from "@mui/material";
import { Pencil } from "lucide-react";
import { useUpdateFilenameCommand } from "@/application/document";
import { useSnackbar } from "@/shared/components";
import { makeStyles } from "../DocumentDetailHero.styles";

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
  const theme = useTheme();
  const styles = makeStyles(theme);
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
            ...styles.title,
            WebkitTextFillColor: "unset",
            color: theme.palette.info.light,
            fontSize: styles.title.fontSize,
            fontWeight: styles.title.fontWeight,
            lineHeight: styles.title.lineHeight,
            p: 0,
          },
          "& .MuiInput-underline:before": {
            borderBottomColor: alpha(theme.palette.info.light, 0.4),
          },
          "& .MuiInput-underline:after": {
            borderBottomColor: theme.palette.info.light,
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
      <Typography variant="h3" sx={styles.title}>
        {filename}
      </Typography>
      {editable && (
        <Pencil
          className="edit-icon"
          size={16}
          color={theme.palette.info.light}
        />
      )}
    </Box>
  );
}
