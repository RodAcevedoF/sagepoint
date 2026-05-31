"use client";

import { Upload, FileText } from "lucide-react";
import { AuroraHero } from "@/shared/components";

interface DocumentHeroProps {
  onUpload: () => void;
}

export function DocumentHero({ onUpload }: DocumentHeroProps) {
  return (
    <AuroraHero
      style={{ marginBottom: 28 }}
      eyebrow="Deep Document Analysis"
      eyebrowIcon={<FileText size={13} />}
      title="Your Knowledge Base"
      lede="Centralize your study materials. Our AI processes PDFs and files to extract key concepts, generate summaries, and prepare interactive evaluation quizzes."
      cta={{
        label: "Upload Document",
        icon: Upload,
        onClick: onUpload,
      }}
      glyph={<FileText size={180} strokeWidth={1.2} />}
    />
  );
}
