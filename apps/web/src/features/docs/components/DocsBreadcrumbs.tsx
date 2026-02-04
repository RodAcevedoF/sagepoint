"use client";

import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { ChevronRight } from "lucide-react";

interface DocsBreadcrumbsProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export const DocsBreadcrumbs = ({ items }: DocsBreadcrumbsProps) => {
  return (
    <Breadcrumbs
      separator={<ChevronRight size={14} />}
      sx={{ mb: 3, color: "text.disabled" }}
    >
      <Link underline="hover" color="inherit" href="/">
        Sagepoint
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast) {
          return (
            <Typography key={item.label} color="text.primary">
              {item.label}
            </Typography>
          );
        }

        return (
          <Link
            key={item.label}
            underline="hover"
            color="inherit"
            href={item.href || "#"}
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};
