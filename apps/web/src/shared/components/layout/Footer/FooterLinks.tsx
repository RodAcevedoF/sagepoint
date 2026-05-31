"use client";

import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import {
  LogIn,
  Rocket,
  Newspaper,
  FileText,
  Github,
  type LucideIcon,
} from "lucide-react";
import { aurora as auroraPalette } from "@/shared/theme";

const styles = {
  columnTitle: {
    fontFamily: auroraPalette.font.mono,
    fontSize: "11.5px",
    fontWeight: 600,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: auroraPalette.txLow,
    margin: "0 0 18px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "9px 0",
    fontSize: "14.5px",
    color: auroraPalette.txMid,
    cursor: "pointer",
    transition: "color .15s ease",
    whiteSpace: "nowrap",
    "& svg": {
      color: auroraPalette.txLow,
      transition: "color .15s ease",
    },
    "&:hover": {
      color: auroraPalette.teal,
      "& svg": { color: auroraPalette.teal },
    },
  },
} as const;

export interface FooterLink {
  label: string;
  icon: LucideIcon;
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
      { label: "Sign In", icon: LogIn, path: "/login" },
      { label: "Get Started", icon: Rocket, path: "/register" },
      { label: "Blog", icon: Newspaper, path: "/blog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", icon: FileText, path: "/docs" },
      {
        label: "Open Source",
        icon: Github,
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
  const Icon = link.icon;

  const handleClick = () => {
    if (link.path.startsWith("http")) {
      window.open(link.path, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(link.path);
  };

  return (
    <Box sx={styles.link} onClick={handleClick}>
      <Icon size={16} />
      {link.label}
    </Box>
  );
}

export function FooterLinks() {
  return (
    <>
      {FOOTER_SECTIONS.map((section) => (
        <Box key={section.title}>
          <Box component="h4" sx={styles.columnTitle}>
            {section.title}
          </Box>
          {section.links.map((link) => (
            <FooterLinkItem key={link.label} link={link} />
          ))}
        </Box>
      ))}
    </>
  );
}
