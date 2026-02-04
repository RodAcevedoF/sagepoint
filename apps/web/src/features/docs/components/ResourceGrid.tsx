"use client";

import React from "react";
import { Grid, Typography } from "@mui/material";
import { Card } from "@/common/components";

export interface ResourceItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href?: string;
}

interface ResourceGridProps {
  resources: ResourceItem[];
}

export const ResourceGrid = ({ resources }: ResourceGridProps) => {
  return (
    <Grid container spacing={3} sx={{ mb: 6 }}>
      {resources.map((resource) => (
        <Grid size={{ xs: 12, sm: 6 }} key={resource.title}>
          <Card variant="outlined">
            <Card.Header>
              <Card.IconBox>{resource.icon}</Card.IconBox>
            </Card.Header>
            <Card.Content>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                {resource.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {resource.desc}
              </Typography>
            </Card.Content>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
