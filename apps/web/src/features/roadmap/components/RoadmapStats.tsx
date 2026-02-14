'use client';

import { Box, Typography, alpha } from '@mui/material';
import { Map, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { palette } from '@/common/theme';
import type { UserRoadmapDto } from '@/infrastructure/api/roadmapApi';

const MotionBox = motion.create(Box);

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  index: number;
}

function StatCard({ icon: Icon, label, value, color, index }: StatCardProps) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
      sx={{
        p: 3,
        borderRadius: 4,
        background: alpha(palette.background.paper, 0.4),
        backdropFilter: 'blur(12px)',
        border: `1px solid ${alpha(color, 0.15)}`,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(color, 0.12),
          color,
          mb: 1.5,
        }}
      >
        <Icon size={20} />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color, mb: 0.25 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: palette.text.secondary }}>
        {label}
      </Typography>
    </MotionBox>
  );
}

interface RoadmapStatsProps {
  roadmaps: UserRoadmapDto[];
}

export function RoadmapStats({ roadmaps }: RoadmapStatsProps) {
  const completed = roadmaps.filter((r) => r.progress.progressPercentage === 100).length;
  const inProgress = roadmaps.filter(
    (r) => r.progress.inProgressSteps > 0 && r.progress.progressPercentage < 100,
  ).length;
  const totalHours = Math.round(
    roadmaps.reduce((sum, r) => sum + (r.roadmap.totalEstimatedDuration || 0), 0) / 60,
  );

  const stats: Omit<StatCardProps, 'index'>[] = [
    { icon: Map, label: 'Total Roadmaps', value: roadmaps.length, color: palette.primary.light },
    { icon: CheckCircle2, label: 'Completed', value: completed, color: palette.success.light },
    { icon: TrendingUp, label: 'In Progress', value: inProgress, color: palette.warning.light },
    { icon: Clock, label: 'Learning Hours', value: totalHours, color: palette.info.light },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2.5,
        mb: 5,
      }}
    >
      {stats.map((stat, index) => (
        <StatCard key={stat.label} {...stat} index={index} />
      ))}
    </Box>
  );
}
