"use client";

import {
  File,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileType,
} from "lucide-react";

export const mimeIconMap: Array<{
  test: (m: string) => boolean;
  icon: typeof File;
}> = [
  { test: (m) => m.includes("pdf"), icon: FileText },
  {
    test: (m) => m.includes("spreadsheet") || m.includes("xlsx"),
    icon: FileSpreadsheet,
  },
  { test: (m) => m.startsWith("image/"), icon: FileImage },
  { test: (m) => m.includes("word") || m.includes("docx"), icon: FileType },
];

export function getDocumentIcon(mimeType?: string): typeof File {
  if (!mimeType) return File;
  return mimeIconMap.find((entry) => entry.test(mimeType))?.icon ?? File;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
