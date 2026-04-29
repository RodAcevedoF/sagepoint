"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

interface InfoCardCarouselProps {
  width?: number | string;
  height?: number | string;
  delay?: number;
  pauseOnHover?: boolean;
  sx?: SxProps<Theme>;
  children: ReactNode[];
}

export function InfoCardCarousel({
  width = 420,
  height = 260,
  delay = 4000,
  pauseOnHover = false,
  sx,
  children,
}: InfoCardCarouselProps) {
  const total = children.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || total < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, delay);
    return () => clearInterval(id);
  }, [delay, paused, total]);

  return (
    <Box
      sx={[
        {
          position: "relative",
          width,
          height,
          perspective: "1600px",
          transformStyle: "preserve-3d",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      onMouseEnter={pauseOnHover ? () => setPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setPaused(false) : undefined}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={index}
          initial={{
            y: 70,
            opacity: 0,
            scale: 0.88,
            rotateX: -24,
            filter: "blur(14px)",
          }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            filter: "blur(0px)",
          }}
          exit={{
            y: -60,
            opacity: 0,
            scale: 0.92,
            rotateX: 20,
            filter: "blur(10px)",
          }}
          transition={{
            y: { type: "spring", stiffness: 140, damping: 20 },
            scale: { type: "spring", stiffness: 160, damping: 22 },
            rotateX: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
            filter: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
            willChange: "transform, opacity, filter",
          }}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.9,
            }}
            style={{ display: "flex", width: "100%", height: "100%" }}
          >
            {children[index]}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}

export default InfoCardCarousel;
