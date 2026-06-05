"use client";

import { useEffect } from "react";

const CSS_VAR = "--app-bar-offset";

/**
 * Keeps `--app-bar-offset` in sync with the gap between the layout viewport
 * bottom and the visual viewport bottom (iOS Safari URL bar, on-screen keyboard).
 * Consumers anchor with `bottom: var(--app-bar-offset, 0px)` to stay glued
 * to the actual visible bottom edge.
 */
export function useVisualViewportOffset() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const root = document.documentElement;

    const update = () => {
      const gap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty(CSS_VAR, `${gap}px`);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
      root.style.removeProperty(CSS_VAR);
    };
  }, []);
}
