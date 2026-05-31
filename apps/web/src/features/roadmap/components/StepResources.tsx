"use client";

import { useState } from "react";
import { Box, CircularProgress, useMediaQuery } from "@mui/material";
import {
  ExternalLink,
  Video,
  BookOpen,
  FileText,
  GraduationCap,
  Wrench,
  Book,
  Link as LinkIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ResourceType } from "@sagepoint/domain";
import { Pill } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import type { ResourceDto } from "@/infrastructure/api/roadmapApi";

interface StepResourcesProps {
  resources: ResourceDto[];
  isLoading?: boolean;
}

const RESOURCE_TYPE_CONFIG: Record<
  ResourceType,
  { icon: LucideIcon; color: string }
> = {
  VIDEO: { icon: Video, color: auroraPalette.status.fail },
  ARTICLE: { icon: FileText, color: auroraPalette.status.ready },
  COURSE: { icon: GraduationCap, color: auroraPalette.status.concept },
  DOCUMENTATION: { icon: BookOpen, color: auroraPalette.status.proc },
  TUTORIAL: { icon: Wrench, color: auroraPalette.status.enrich },
  BOOK: { icon: Book, color: auroraPalette.teal },
};

export function StepResources({ resources, isLoading }: StepResourcesProps) {
  const isMobile = useMediaQuery("(max-width:625px)");
  const [expandedResourceId, setExpandedResourceId] = useState<string | null>(
    null,
  );

  if (resources.length === 0) {
    if (isLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={28} />
        </Box>
      );
    }
    return (
      <Box
        component="p"
        sx={{
          margin: 0,
          color: auroraPalette.txMid,
          fontStyle: "italic",
          fontSize: "13.5px",
          py: 1,
        }}
      >
        No resources available for this step.
      </Box>
    );
  }

  return (
    <Box>
      <Box
        component="p"
        sx={{
          margin: "4px 0 8px",
          fontFamily: auroraPalette.font.mono,
          fontSize: "11.5px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: auroraPalette.txLow,
        }}
      >
        Learning Resources
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {resources.map((resource) => {
          const config = RESOURCE_TYPE_CONFIG[resource.type];
          const Icon = config.icon;
          const isExpanded = isMobile && expandedResourceId === resource.id;
          const openExternally = !isMobile;

          const handleClick = () => {
            if (!isMobile) return;
            setExpandedResourceId(isExpanded ? null : resource.id);
          };

          return (
            <Box
              key={resource.id}
              component={openExternally ? "a" : "div"}
              href={openExternally ? resource.url : undefined}
              target={openExternally ? "_blank" : undefined}
              rel={openExternally ? "noopener noreferrer" : undefined}
              onClick={handleClick}
              sx={{
                display: "flex",
                gap: "14px",
                padding: "15px 16px",
                borderRadius: auroraPalette.radii.md,
                border: `1px solid ${auroraPalette.line}`,
                background: "oklch(0.255 0.024 262 / 0.5)",
                color: auroraPalette.tx,
                textDecoration: "none",
                cursor: "pointer",
                transition: "border-color .15s, background .15s",
                "&:hover": {
                  borderColor: auroraTint(auroraPalette.teal, 0.32),
                  background: "oklch(0.255 0.024 262 / 0.8)",
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  flex: "none",
                  width: 40,
                  height: 40,
                  borderRadius: "11px",
                  display: "grid",
                  placeItems: "center",
                  background: `color-mix(in oklch, ${config.color} 15%, ${auroraPalette.surface2})`,
                  border: `1px solid ${auroraTint(config.color, 0.26)}`,
                  color: config.color,
                }}
              >
                <Icon size={19} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <Box
                    component="p"
                    sx={{
                      flex: 1,
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "14.5px",
                      lineHeight: 1.35,
                      color: auroraPalette.txHi,
                    }}
                  >
                    {resource.title}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      flex: "none",
                      color: auroraPalette.txLow,
                      marginTop: "2px",
                    }}
                  >
                    <ExternalLink size={15} />
                  </Box>
                </Box>
                {resource.description && (
                  <Box
                    component="p"
                    sx={{
                      margin: "6px 0 10px",
                      fontSize: "12.5px",
                      lineHeight: 1.5,
                      color: auroraPalette.txMid,
                      display: "-webkit-box",
                      WebkitLineClamp: isExpanded ? "unset" : 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {resource.description}
                  </Box>
                )}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  {resource.provider && (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 10px",
                        borderRadius: auroraPalette.radii.pill,
                        fontFamily: auroraPalette.font.mono,
                        fontSize: "11px",
                        fontWeight: 600,
                        color: auroraPalette.txMid,
                        background: "oklch(0.30 0.02 262 / 0.6)",
                        border: `1px solid ${auroraPalette.line}`,
                      }}
                    >
                      <LinkIcon size={11} />
                      {resource.provider}
                    </Box>
                  )}
                  {resource.difficulty && (
                    <Pill accent={config.color}>{resource.difficulty}</Pill>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
