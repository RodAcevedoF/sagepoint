"use client";

import { Box, Typography, alpha } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { palette } from "@/shared/theme";
import { Button } from "@/shared/components/ui/Button";
import { ButtonVariants, ButtonSizes } from "@/shared/types";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";

const styles = {
  container: {
    position: "fixed" as const,
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    width: { xs: "calc(100% - 32px)", sm: 560 },
    zIndex: 1900,
  },
  paper: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    px: 2.5,
    py: 2,
    borderRadius: 3,
    bgcolor: alpha(palette.background.paper, 0.88),
    backdropFilter: "blur(12px)",
    border: `1px solid ${alpha(palette.text.primary, 0.08)}`,
    boxShadow: `0 8px 32px ${alpha("#000", 0.4)}, 0 0 0 1px ${alpha(palette.text.primary, 0.04)} inset`,
    flexWrap: { xs: "wrap", sm: "nowrap" },
  } as const,
  text: {
    flex: 1,
    minWidth: { xs: "100%", sm: 0 },
    color: "text.primary",
    fontSize: "0.85rem",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    gap: 1,
    flexShrink: 0,
  },
};

const variants = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 16, scale: 0.97 },
};

export function CookieBanner() {
  const [consent, setConsent] = useLocalStorage<"accepted" | null>(
    "sp:cookie-consent",
    null,
  );

  return (
    <AnimatePresence>
      {consent === null && (
        <Box sx={styles.container}>
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <Box sx={styles.paper}>
              <Typography sx={styles.text}>
                We use cookies to keep you signed in and improve your
                experience.
              </Typography>
              <Box sx={styles.actions}>
                <Button
                  label="Dismiss"
                  variant={ButtonVariants.GHOST}
                  size={ButtonSizes.SMALL}
                  onClick={() => setConsent("accepted")}
                />
                <Button
                  label="Accept"
                  variant={ButtonVariants.DEFAULT}
                  size={ButtonSizes.SMALL}
                  onClick={() => setConsent("accepted")}
                />
              </Box>
            </Box>
          </motion.div>
        </Box>
      )}
    </AnimatePresence>
  );
}
