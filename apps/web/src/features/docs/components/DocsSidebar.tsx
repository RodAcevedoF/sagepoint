"use client";

import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  alpha,
  type SxProps,
  type Theme,
} from "@mui/material";
import { palette } from "@/common/theme";

export interface DocsSidebarItem {
  id: string;
  label: string;
}

const styles = {
  root: {
    position: "sticky",
    top: 100,
    pr: 3,
    display: { xs: "none", md: "block" },
  } satisfies SxProps<Theme>,
  heading: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: 1.5,
    color: alpha("#f5f5f5", 0.35),
    mb: 1,
    px: 1.5,
  } satisfies SxProps<Theme>,
  listItem: {
    borderRadius: 1.5,
    py: 0.6,
    px: 1.5,
    mb: 0.25,
    color: alpha("#f5f5f5", 0.5),
    transition: "all 0.15s ease",
    "&:hover": {
      color: "#f5f5f5",
      bgcolor: alpha(palette.primary.light, 0.05),
    },
  } satisfies SxProps<Theme>,
  activeListItem: {
    color: palette.primary.light,
    bgcolor: alpha(palette.primary.light, 0.08),
    "&:hover": {
      color: palette.primary.light,
      bgcolor: alpha(palette.primary.light, 0.1),
    },
  } satisfies SxProps<Theme>,
  itemText: {
    "& .MuiListItemText-primary": {
      fontSize: "0.835rem",
      fontWeight: 500,
    },
  } satisfies SxProps<Theme>,
};

interface DocsSidebarProps {
  items: DocsSidebarItem[];
  activeId: string;
  onNavigate: (id: string) => void;
}

export const DocsSidebar = ({
  items,
  activeId,
  onNavigate,
}: DocsSidebarProps) => (
  <Box sx={styles.root}>
    <Typography variant="overline" sx={styles.heading}>
      ON THIS PAGE
    </Typography>
    <List disablePadding>
      {items.map((item) => (
        <ListItemButton
          key={item.id}
          sx={{
            ...styles.listItem,
            ...(activeId === item.id ? styles.activeListItem : {}),
          }}
          onClick={() => onNavigate(item.id)}
        >
          <ListItemText primary={item.label} sx={styles.itemText} />
        </ListItemButton>
      ))}
    </List>
  </Box>
);
