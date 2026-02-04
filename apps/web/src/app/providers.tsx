"use client";

import { Provider } from "react-redux";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { store } from "@/infrastructure/store/store";
import { darkTheme } from "@/common/theme";

import { AuthInitializer } from "@/features/auth/components/AuthInitializer";
import { ModalProvider, SnackbarProvider, ErrorBoundary } from "@/common/components";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppRouterCacheProvider>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <ErrorBoundary>
            <SnackbarProvider>
              <ModalProvider>
                <AuthInitializer>{children}</AuthInitializer>
              </ModalProvider>
            </SnackbarProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </Provider>
  );
}
