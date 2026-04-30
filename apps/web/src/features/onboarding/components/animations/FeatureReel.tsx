"use client";

import { Box, useTheme, alpha } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

interface Props {
  slides: ReactNode[];
  interval?: number;
  pauseOnHover?: boolean;
}

const variants = {
  enter: { opacity: 0, y: 64, filter: "blur(14px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -64, filter: "blur(14px)" },
};

export function FeatureReel({
  slides,
  interval = 5200,
  pauseOnHover = true,
}: Props) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      interval,
    );
    return () => clearTimeout(t);
  }, [index, paused, interval, slides.length]);

  return (
    <Box
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflowX: "hidden",
        overflowY: { xs: "visible", md: "hidden" },
      }}
    >
      <AnimatePresence mode="wait">
        <Box
          key={index}
          component={motion.div}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          {slides[index]}
        </Box>
      </AnimatePresence>

      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 2, sm: 6, md: 16 },
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 0.75,
          zIndex: 2,
        }}
      >
        {slides.map((_, i) => (
          <Box
            key={i}
            sx={{
              height: 2,
              width: i === index ? { xs: 24, md: 34 } : { xs: 10, md: 14 },
              borderRadius: 999,
              background:
                i === index
                  ? theme.palette.primary.light
                  : alpha(theme.palette.common.white, 0.18),
              transition: "all 0.5s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
