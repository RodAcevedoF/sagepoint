"use client";

import { useState } from "react";
import { Box, TextField } from "@mui/material";
import { Pencil } from "lucide-react";
import { useUpdateTitleCommand } from "@/application/roadmap";
import { useSnackbar } from "@/shared/components";
import { aurora as auroraPalette } from "@/shared/theme";

const titleSx = {
  position: "relative",
  zIndex: 1,
  margin: 0,
  fontFamily: auroraPalette.font.display,
  fontWeight: 800,
  fontSize: "clamp(30px, 3.6vw, 46px)",
  lineHeight: 1.04,
  letterSpacing: "-0.025em",
  background: `linear-gradient(120deg, ${auroraPalette.txHi} 28%, ${auroraPalette.teal} 96%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  wordBreak: "break-word",
} as const;

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
        {title}
      </Box>
      {editable && (
        <Pencil className="edit-icon" size={16} color={auroraPalette.teal} />
      )}
    </Box>
  );
}
