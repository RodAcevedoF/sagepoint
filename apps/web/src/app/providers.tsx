"use client";

import { Provider } from "react-redux";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import dynamic from "next/dynamic";
import { store } from "@/infrastructure/store/store";
import { darkTheme } from "@/shared/theme";
import { UserProvider } from "@/features/auth/context/UserContext";
import type { UserDto } from "@/infrastructure/api/authApi";
import {
  ModalProvider,
  SnackbarProvider,
  ErrorBoundary,
} from "@/shared/components";

const CookieBanner = dynamic(
  () =>
    import("@/shared/components/feedback/CookieBanner/CookieBanner").then(
      (m) => m.CookieBanner,
    ),
  { ssr: false },
);

interface ProvidersProps {
  user: UserDto | null;
  children: React.ReactNode;
}

export function Providers({ user, children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <AppRouterCacheProvider>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <ErrorBoundary>
            <SnackbarProvider>
              <ModalProvider>
                <UserProvider user={user}>{children}</UserProvider>
                <CookieBanner />
              </ModalProvider>
            </SnackbarProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </Provider>
  );
}
