"use client";

import { Box, Grid, Stack, Typography, alpha } from "@mui/material";
import { useRouter } from "next/navigation";
import { palette } from "@/common/theme";
import {
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  AutoAwesome as FeaturesIcon,
  Description as DocsIcon,
  GitHub as GitHubIcon,
  HelpOutline as HelpIcon,
} from "@mui/icons-material";

const styles = {
  columnTitle: {
    color: "text.primary",
    fontWeight: 700,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    mb: 3,
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    color: "text.secondary",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      color: palette.primary.light,
      transform: "translateX(4px)",
      "& .link-icon": {
        color: palette.primary.light,
      },
    },
  },
  icon: {
    fontSize: "1.1rem",
    color: alpha(palette.text.secondary, 0.4),
    transition: "color 0.2s ease",
  },
};

export function FooterLinks() {
  const router = useRouter();

  const sections = [
    {
      title: "Product",
      links: [
        {
          label: "Sign In",
          icon: <LoginIcon sx={styles.icon} className="link-icon" />,
          path: "/login",
        },
        {
          label: "Get Started",
          icon: <RegisterIcon sx={styles.icon} className="link-icon" />,
          path: "/register",
        },
        {
          label: "AI Features",
          icon: <FeaturesIcon sx={styles.icon} className="link-icon" />,
          path: "/#features",
        },
      ],
    },
    {
      title: "Resources",
      links: [
        {
          label: "Documentation",
          icon: <DocsIcon sx={styles.icon} className="link-icon" />,
          path: "/docs",
        },
        {
          label: "Open Source",
          icon: <GitHubIcon sx={styles.icon} className="link-icon" />,
          path: "https://github.com",
        },
        {
          label: "Help Center",
          icon: <HelpIcon sx={styles.icon} className="link-icon" />,
          path: "/help",
        },
      ],
    },
  ];

  return (
    <Grid container spacing={{ xs: 4, sm: 6, md: 8 }}>
      {sections.map((section) => (
        <Grid
          key={section.title}
          size={{ xs: 6, sm: "auto" }}
          sx={{ minWidth: 160 }}
        >
          <Typography variant="overline" sx={styles.columnTitle} component="h3">
            {section.title}
          </Typography>
          <Stack spacing={2}>
            {section.links.map((link) => (
              <Box
                key={link.label}
                sx={styles.link}
                onClick={() => {
                  if (link.path.startsWith("http")) {
                    window.open(link.path, "_blank");
                  } else {
                    router.push(link.path);
                  }
                }}
              >
                {link.icon}
                <Typography variant="body2">{link.label}</Typography>
              </Box>
            ))}
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}
