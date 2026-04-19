"use client";

import { ReactNode } from "react";
import { Box, Stack, Typography, Grid } from "@mui/material";
import { useRouter } from "next/navigation";
import {
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Article as BlogIcon,
  Description as DocsIcon,
  GitHub as GitHubIcon,
} from "@mui/icons-material";

const styles = {
  columnTitle: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: 800,
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.25em",
    mb: 3,
    fontFamily: "monospace",
    position: "relative",
    display: "inline-block",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -6,
      left: 0,
      width: "12px",
      height: "1px",
      bgcolor: "rgba(255,255,255,0.2)",
    },
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    py: 0.5,
    "&:hover": {
      color: "#fff",
      transform: "translateX(6px)",
      "& .footer-icon": {
        color: "primary.light",
        transform: "scale(1.1) rotate(-8deg)",
        opacity: 1,
      },
    },
  },
  icon: {
    fontSize: "1.1rem",
    color: "rgba(255, 255, 255, 0.85)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    flexShrink: 0,
  },
};

export interface FooterLink {
  label: string;
  icon: ReactNode;
  path: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Product",
    links: [
      {
        label: "Sign In",
        icon: <LoginIcon sx={styles.icon} className="footer-icon" />,
        path: "/login",
      },
      {
        label: "Get Started",
        icon: <RegisterIcon sx={styles.icon} className="footer-icon" />,
        path: "/register",
      },
      {
        label: "Blog",
        icon: <BlogIcon sx={styles.icon} className="footer-icon" />,
        path: "/blog",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "Documentation",
        icon: <DocsIcon sx={styles.icon} className="footer-icon" />,
        path: "/docs",
      },
      {
        label: "Open Source",
        icon: <GitHubIcon sx={styles.icon} className="footer-icon" />,
        path: "https://github.com/RodAcevedoF/sagepoint",
      },
    ],
  },
];

interface FooterLinkItemProps {
  link: FooterLink;
}

export function FooterLinkItem({ link }: FooterLinkItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (link.path.startsWith("http")) {
      window.open(link.path, "_blank");
    } else {
      router.push(link.path);
    }
  };

  return (
    <Box sx={styles.link} onClick={handleClick}>
      <Box
        className="footer-icon"
        sx={{ display: "flex", transition: "inherit" }}
      >
        {link.icon}
      </Box>
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.9rem",
          fontWeight: 500,
          letterSpacing: "0.01em",
          transition: "inherit",
        }}
      >
        {link.label}
      </Typography>
    </Box>
  );
}

export function FooterLinks() {
  return (
    <Grid container spacing={{ xs: 4, sm: 6, md: 8 }}>
      {FOOTER_SECTIONS.map((section) => (
        <Grid
          key={section.title}
          size={{ xs: 6, sm: "auto" }}
          sx={{ minWidth: 160 }}
        >
          <Typography variant="overline" sx={styles.columnTitle} component="h3">
            {section.title}
          </Typography>
          <Stack spacing={1.5}>
            {section.links.map((link) => (
              <FooterLinkItem key={link.label} link={link} />
            ))}
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}
