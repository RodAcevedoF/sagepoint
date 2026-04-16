"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Container, Toolbar } from "@mui/material";
import { PublicLayout } from "@/shared/components";
import { DocsHeader } from "./DocsHeader";
import {
  DocsSection,
  DocsProse,
  DocsList,
  DocsCallout,
  DocsSteps,
} from "./DocsSection";
import { DocsSidebar, DocsMobileNav } from "./DocsSidebar";
import { DOCS_SECTIONS, type DocBlock } from "./docsConfig";

const sidebarItems = DOCS_SECTIONS.map(({ id, label }) => ({ id, label }));

const renderBlock = (block: DocBlock, index: number) => {
  switch (block.type) {
    case "prose":
      return <DocsProse key={index}>{block.text}</DocsProse>;
    case "list":
      return <DocsList key={index} items={block.items} />;
    case "steps":
      return <DocsSteps key={index} steps={block.steps} />;
    case "callout":
      return (
        <DocsCallout key={index} variant={block.variant}>
          {block.text}
        </DocsCallout>
      );
  }
};

export const DocsPage = () => {
  const [activeId, setActiveId] = useState("overview");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );

    const sections = sidebarItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    sections.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const handleNavigate = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <PublicLayout>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Box sx={{ display: "flex" }}>
            <DocsSidebar
              items={sidebarItems}
              activeId={activeId}
              onNavigate={handleNavigate}
            />

            <Box sx={{ flex: 1, pl: { md: 4 }, minWidth: 0 }}>
              <DocsMobileNav
                items={sidebarItems}
                activeId={activeId}
                onNavigate={handleNavigate}
              />
              <DocsHeader />

              {DOCS_SECTIONS.map((section) => (
                <DocsSection
                  key={section.id}
                  id={section.id}
                  icon={<section.icon size={22} />}
                  title={section.title}
                  showDivider={section.showDivider}
                >
                  {section.blocks.map(renderBlock)}
                </DocsSection>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </PublicLayout>
  );
};
