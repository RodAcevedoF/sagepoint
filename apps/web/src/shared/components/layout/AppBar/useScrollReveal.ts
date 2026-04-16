"use client";

import { useState, useRef, useEffect } from "react";

interface ScrollRevealOptions {
  /** Minimum scroll delta to trigger a direction change (default: 8px) */
  threshold?: number;
  /** Disable the behavior — isVisible always returns true */
  disabled?: boolean;
}

export function useScrollReveal({
  threshold = 8,
  disabled = false,
}: ScrollRevealOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (disabled) return;

    // Sync to current position so the first delta is accurate
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (Math.abs(delta) < threshold) return;

      // Always show when near the top of the page
      setIsVisible(delta < 0 || currentY < 48);
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [disabled, threshold]);

  return disabled || isVisible;
}
