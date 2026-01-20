'use client';

import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { store } from '@/common/store/store';

// Create a custom MUI theme (can be moved to separate file later)
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', // Indigo-500 matching previous Tailwind feel
    },
    secondary: {
      main: '#ec4899', // Pink-500
    },
    background: {
      default: '#f8fafc', // Slate-50
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
            }
        }
    }
  },
});

import { AuthInitializer } from '@/features/auth/components/AuthInitializer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </Provider>
  );
}
