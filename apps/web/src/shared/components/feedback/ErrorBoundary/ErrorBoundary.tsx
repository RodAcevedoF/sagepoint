"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { Box, Container } from "@mui/material";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { aurora, auroraTint } from "@/shared/theme";
import { Button } from "../../ui/Button";
import {
  ButtonVariants,
  ButtonIconPositions,
  ButtonSizes,
} from "@/shared/types";
import { SmartHomeButton } from "../../layout/Navigation";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const containerSx = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: aurora.font.ui,
  color: aurora.tx,
  background: `radial-gradient(1100px 620px at 18% -8%, oklch(0.40 0.10 200 / 0.30), transparent 60%), radial-gradient(900px 600px at 92% 4%, oklch(0.34 0.10 268 / 0.34), transparent 58%), linear-gradient(180deg, ${aurora.bg1}, ${aurora.bg0} 60%)`,
} as const;

const contentSx = {
  textAlign: "center",
  maxWidth: 520,
} as const;

const iconBoxSx = {
  width: 84,
  height: 84,
  borderRadius: "20px",
  display: "grid",
  placeItems: "center",
  background: auroraTint(aurora.status.fail, 0.14),
  border: `1px solid ${auroraTint(aurora.status.fail, 0.3)}`,
  color: aurora.status.fail,
  boxShadow: `0 0 32px -8px ${auroraTint(aurora.status.fail, 0.55)}`,
  mx: "auto",
  mb: "22px",
} as const;

const titleSx = {
  fontFamily: aurora.font.display,
  color: aurora.txHi,
  fontWeight: 800,
  fontSize: { xs: "28px", md: "34px" },
  letterSpacing: "-0.02em",
  margin: 0,
  mb: "12px",
} as const;

const messageSx = {
  color: aurora.txMid,
  fontSize: "15.5px",
  lineHeight: 1.55,
  margin: 0,
  mb: "26px",
  textWrap: "pretty" as const,
} as const;

const errorDetailSx = {
  padding: "12px 14px",
  marginBottom: "22px",
  borderRadius: aurora.radii.md,
  background: auroraTint(aurora.status.fail, 0.08),
  border: `1px solid ${auroraTint(aurora.status.fail, 0.25)}`,
  fontFamily: aurora.font.mono,
  fontSize: "12.5px",
  color: aurora.status.fail,
  textAlign: "left" as const,
  overflow: "auto",
  maxHeight: 160,
  wordBreak: "break-word" as const,
} as const;

const actionsSx = {
  display: "flex",
  gap: "12px",
  justifyContent: "center",
  flexWrap: "wrap",
} as const;

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box sx={containerSx}>
          <Container maxWidth="sm">
            <Box sx={contentSx}>
              <Box sx={iconBoxSx}>
                <AlertTriangle size={38} strokeWidth={1.5} />
              </Box>

              <Box component="h1" sx={titleSx}>
                Something went wrong
              </Box>

              <Box component="p" sx={messageSx}>
                An unexpected error occurred. Please try refreshing the page or
                contact support if the problem persists.
              </Box>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <Box sx={errorDetailSx}>{this.state.error.message}</Box>
              )}

              <Box sx={actionsSx}>
                <Button
                  label="Try Again"
                  icon={RefreshCw}
                  iconPos={ButtonIconPositions.START}
                  variant={ButtonVariants.AURORA}
                  size={ButtonSizes.LARGE}
                  onClick={this.handleReset}
                />
                <SmartHomeButton variant={ButtonVariants.AURORA_OUTLINE} />
              </Box>
            </Box>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}
