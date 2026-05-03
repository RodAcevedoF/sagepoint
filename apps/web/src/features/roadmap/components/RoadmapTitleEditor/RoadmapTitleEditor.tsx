"use client";

import { useState } from "react";
import { Box, Typography, TextField, useTheme, alpha } from "@mui/material";
import { Pencil } from "lucide-react";
import { useUpdateTitleCommand } from "@/application/roadmap";
import { useSnackbar } from "@/shared/components";
import { makeStyles } from "../RoadmapDetail.styles";

interface RoadmapTitleEditorProps {
  roadmapId: string;
  title: string;
  editable: boolean;
}

export function RoadmapTitleEditor({
  roadmapId,
  title,
  editable,
}: RoadmapTitleEditorProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const { execute: updateTitle, isLoading } = useUpdateTitleCommand();
  const { showSnackbar } = useSnackbar();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  const enterEdit = () => {
    setValue(title);
    setEditing(true);
  };

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === title) {
      setEditing(false);
      return;
    }
    const result = await updateTitle(roadmapId, trimmed);
    if (result.ok) {
      showSnackbar("Title updated", { severity: "success" });
      setEditing(false);
    } else {
      showSnackbar("Failed to update title", { severity: "error" });
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
            color: theme.palette.common.white,
            fontSize: styles.title.fontSize,
            fontWeight: styles.title.fontWeight,
            lineHeight: styles.title.lineHeight,
            p: 0,
          },
          "& .MuiInput-underline:before": {
            borderBottomColor: alpha(theme.palette.primary.light, 0.4),
          },
          "& .MuiInput-underline:after": {
            borderBottomColor: theme.palette.primary.light,
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
      <Typography variant="h4" sx={styles.title}>
        {title}
      </Typography>
      {editable && (
        <Pencil
          className="edit-icon"
          size={16}
          color={theme.palette.primary.light}
        />
      )}
    </Box>
  );
}
