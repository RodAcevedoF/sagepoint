import { vi } from "vitest";
import { SnackbarContext } from "@/common/components/Snackbar/snackbar-context";

export const mockShowSnackbar = vi.fn(() => "snack-1");

export function SnackbarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarContext.Provider
      value={{
        snackbars: [],
        showSnackbar: mockShowSnackbar,
        hideSnackbar: vi.fn(),
        clearAll: vi.fn(),
      }}
    >
      {children}
    </SnackbarContext.Provider>
  );
}
