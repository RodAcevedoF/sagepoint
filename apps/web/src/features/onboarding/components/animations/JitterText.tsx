"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";

interface JitterTextProps {
  text: string;
  amplitude?: number;
  style?: CSSProperties;
}

export function JitterText({ text, amplitude = 1, style }: JitterTextProps) {
  return (
    <span style={{ display: "inline-block", ...style }}>
      {text.split("").map((ch, i) => {
        if (ch === " ") return <span key={i}>&nbsp;</span>;
        const seedA = ((i * 9301 + 49297) % 233280) / 233280;
        const seedB = ((i * 1103515245 + 12345) % 2147483648) / 2147483648;
        const seedC = ((i * 22695477 + 1) % 2147483648) / 2147483648;
        const ax = (seedA - 0.5) * 2 * amplitude;
        const ay = (seedB - 0.5) * 2 * amplitude;
        const ar = (seedC - 0.5) * 1.4;
        return (
          <motion.span
            key={i}
            style={{
              display: "inline-block",
              willChange: "transform",
            }}
            animate={{
              x: [0, ax, -ax * 0.6, ax * 0.4, 0],
              y: [0, ay, -ay * 0.5, ay * 0.7, 0],
              rotate: [0, ar, -ar * 0.7, ar * 0.4, 0],
            }}
            transition={{
              duration: 2.6 + (i % 7) * 0.35,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 11) * 0.12,
            }}
          >
            {ch}
          </motion.span>
        );
      })}
    </span>
  );
}

export default JitterText;
