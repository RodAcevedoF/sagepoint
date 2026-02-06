'use client';

import { Box, Typography, Link, Chip, alpha, Collapse, CircularProgress } from '@mui/material';
import { ExternalLink, Video, BookOpen, FileText, GraduationCap, Wrench, Book } from 'lucide-react';
import type { ResourceType } from '@sagepoint/domain';
import type { ResourceDto } from '@/infrastructure/api/roadmapApi';
import { palette } from '@/common/theme';

interface StepResourcesProps {
  resources: ResourceDto[];
  isLoading?: boolean;
  expanded: boolean;
}

const resourceTypeConfig: Record<ResourceType, { icon: typeof Video; color: string }> = {
  VIDEO: { icon: Video, color: palette.error.light },
  ARTICLE: { icon: FileText, color: palette.info.light },
  COURSE: { icon: GraduationCap, color: palette.success.light },
  DOCUMENTATION: { icon: BookOpen, color: palette.warning.light },
  TUTORIAL: { icon: Wrench, color: palette.primary.light },
  BOOK: { icon: Book, color: palette.secondary.light },
};

export function StepResources({ resources, isLoading, expanded }: StepResourcesProps) {
  if (isLoading) {
    return (
      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={20} />
        </Box>
      </Collapse>
    );
  }

  if (resources.length === 0) {
    return (
      <Collapse in={expanded}>
        <Box sx={{ py: 2, px: 3 }}>
          <Typography variant="body2" sx={{ color: palette.text.secondary, fontStyle: 'italic' }}>
            No resources available for this step.
          </Typography>
        </Box>
      </Collapse>
    );
  }

  return (
    <Collapse in={expanded}>
      <Box
        sx={{
          py: 2,
          px: 3,
          bgcolor: alpha(palette.background.paper, 0.3),
          borderTop: `1px solid ${alpha(palette.divider, 0.5)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: palette.text.secondary,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            mb: 1.5,
            display: 'block',
          }}
        >
          Learning Resources
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {resources.map((resource) => {
            const config = resourceTypeConfig[resource.type];
            const Icon = config.icon;
            return (
              <Link
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(palette.background.paper, 0.5),
                  border: `1px solid ${alpha(palette.divider, 0.3)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(palette.primary.main, 0.05),
                    borderColor: alpha(palette.primary.main, 0.2),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(config.color, 0.1),
                    color: config.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: palette.text.primary,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {resource.title}
                    </Typography>
                    <ExternalLink size={12} color={palette.text.secondary} />
                  </Box>
                  {resource.description && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: palette.text.secondary,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {resource.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    {resource.provider && (
                      <Chip
                        size="small"
                        label={resource.provider}
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: alpha(palette.text.secondary, 0.1),
                          color: palette.text.secondary,
                        }}
                      />
                    )}
                    {resource.difficulty && (
                      <Chip
                        size="small"
                        label={resource.difficulty}
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: alpha(config.color, 0.1),
                          color: config.color,
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Link>
            );
          })}
        </Box>
      </Box>
    </Collapse>
  );
}
