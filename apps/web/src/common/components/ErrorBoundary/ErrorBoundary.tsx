"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Button, Container, Typography, alpha } from "@mui/material";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { palette } from "@/common/theme";
import { SmartHomeButton } from "@/common/components/Navigation";

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Styles
// ============================================================================

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: palette.background.gradient,
  },
  content: {
    textAlign: "center",
    maxWidth: 500,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(palette.error.main, 0.1),
    color: palette.error.light,
    mx: "auto",
    mb: 3,
  },
  title: {
    color: "text.primary",
    fontWeight: 700,
    mb: 2,
  },
  message: {
    color: "text.secondary",
    mb: 4,
  },
  errorDetail: {
    p: 2,
    mb: 3,
    borderRadius: 2,
    bgcolor: alpha(palette.error.main, 0.05),
    border: `1px solid ${alpha(palette.error.main, 0.2)}`,
    fontFamily: "monospace",
    fontSize: "0.875rem",
    color: palette.error.light,
    textAlign: "left",
    overflow: "auto",
    maxHeight: 150,
  },
  actions: {
    display: "flex",
    gap: 2,
    justifyContent: "center",
    flexWrap: "wrap",
  },
};

// ============================================================================
// Component
// ============================================================================

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
        <Box sx={styles.container}>
          <Container maxWidth="sm">
            <Box sx={styles.content}>
              <Box sx={styles.iconBox}>
                <AlertTriangle size={40} />
              </Box>

              <Typography variant="h4" sx={styles.title}>
                Something went wrong
              </Typography>

              <Typography variant="body1" sx={styles.message}>
                An unexpected error occurred. Please try refreshing the page or
                contact support if the problem persists.
              </Typography>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <Box sx={styles.errorDetail}>{this.state.error.message}</Box>
              )}

              <Box sx={styles.actions}>
                <Button
                  variant="contained"
                  startIcon={<RefreshCw size={18} />}
                  onClick={this.handleReset}
                  size="large"
                >
                  Try Again
                </Button>

                <SmartHomeButton variant="outlined" />
              </Box>
            </Box>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}
