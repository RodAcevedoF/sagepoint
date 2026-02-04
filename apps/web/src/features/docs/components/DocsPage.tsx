import React from "react";
import { Box, Container, Typography, Grid, alpha } from "@mui/material";
import { Book, Code, Cpu, Terminal } from "lucide-react";
import { PublicLayout, Card } from "@/common/components";
import { palette } from "@/common/theme";
import {
  DocsSidebar,
  DocsBreadcrumbs,
  DocsHeader,
  ResourceGrid,
  DocsCallout,
  DocsPagination,
  DocsTableOfContents,
} from "./";

const sections = [
  {
    title: "Getting Started",
    items: ["Introduction", "Installation", "Quick Start", "Architecture"],
  },
  {
    title: "Core Concepts",
    items: ["Entities", "Data Flow", "State Management", "API Reference"],
  },
  {
    title: "Advanced",
    items: ["Custom Plugins", "Performance", "Security", "Deployment"],
  },
];

const resources = [
  {
    icon: <Book size={24} />,
    title: "Guides",
    desc: "Step-by-step tutorials for every feature.",
  },
  {
    icon: <Code size={24} />,
    title: "API",
    desc: "Detailed technical reference for developers.",
  },
  {
    icon: <Cpu size={24} />,
    title: "AI",
    desc: "Leverage built-in LLM capabilities.",
  },
  {
    icon: <Terminal size={24} />,
    title: "CLI",
    desc: "Powerful tools to speed up your workflow.",
  },
];

const tocItems = [
  { id: "what-is-sagepoint", title: "What is Sagepoint?", level: 2 },
  { id: "key-resources", title: "Key Resources", level: 2 },
  { id: "pro-tip", title: "Pro Tip", level: 2 },
];

export const DocsPage = () => {
  return (
    <PublicLayout>
      <Box
        sx={{
          pt: { xs: 8, md: 10 },
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            {/* Sidebar Navigation */}
            <Grid
              size={{ xs: 12, md: 2.5, lg: 2 }}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              <DocsSidebar sections={sections} activeItem="Introduction" />
            </Grid>

            {/* Main Content */}
            <Grid size={{ xs: 12, md: 9.5, lg: 8 }}>
              <Card
                variant="glass"
                hoverable={false}
                sx={{
                  p: { xs: 3, md: 6 },
                  bgcolor: alpha(palette.background.paper, 0.4),
                }}
              >
                <DocsBreadcrumbs
                  items={[
                    { label: "Docs", href: "/docs" },
                    { label: "Introduction" },
                  ]}
                />

                <DocsHeader
                  title="Introduction"
                  description="Welcome to the Sagepoint documentation. Learn how to build, scale, and optimize your applications with our intelligent workspace."
                />

                <Box id="what-is-sagepoint" sx={{ mb: 6 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 2 }}
                  >
                    What is Sagepoint?
                  </Typography>
                  <Typography variant="body1" paragraph color="text.secondary">
                    Sagepoint is a modern, full-stack monorepo designed for
                    speed and scalability. It combines the power of Next.js,
                    Three.js for immersive visuals, and a robust domain-driven
                    architecture to provide a seamless development experience.
                  </Typography>
                </Box>

                <Box id="key-resources">
                  <ResourceGrid resources={resources} />
                </Box>

                <DocsCallout id="pro-tip" type="tip" title="PRO TIP">
                  You can use the `sagepoint-cli` to scaffold new modules across
                  the entire monorepo with a single command.
                </DocsCallout>

                <DocsPagination
                  next={{ title: "Installation", href: "/docs/installation" }}
                />
              </Card>
            </Grid>

            {/* Table of Contents */}
            <Grid
              size={{ md: 0, lg: 2 }}
              sx={{ display: { xs: "none", lg: "block" } }}
            >
              <DocsTableOfContents
                items={tocItems}
                activeId="what-is-sagepoint"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </PublicLayout>
  );
};
