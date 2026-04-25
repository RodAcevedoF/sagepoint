import type { RenderOptions } from "@testing-library/react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { setupStore } from "@/infrastructure/store/store";
import type { RootState } from "@/infrastructure/store/store";
import { ModalContext } from "@/shared/components/ui/Modal/modal-context";
import { SnackbarContext } from "@/shared/components/feedback/Snackbar/snackbar-context";
import { UserProvider } from "@/features/auth/context/UserContext";
import type { UserDto } from "@/infrastructure/api/authApi";
import { mockUser } from "./fixtures";
import { vi } from "vitest";
import type { ReactElement } from "react";

type StoreOverrides = {
  preloadedState?: Partial<RootState>;
  user?: UserDto | null;
};

function createTestStore(overrides: StoreOverrides = {}) {
  return setupStore(overrides.preloadedState);
}

type CustomRenderOptions = Omit<RenderOptions, "wrapper"> & StoreOverrides;

/**
 * Renders a component wrapped with Redux Provider, ModalContext, and SnackbarContext.
 * MSW intercepts network calls — no need to mock RTK Query directly.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {},
) {
  const {
    preloadedState,
    user = mockUser as unknown as UserDto,
    ...renderOptions
  } = options;
  const store = createTestStore({ preloadedState });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <UserProvider user={user}>
          <SnackbarContext.Provider
            value={{
              snackbars: [],
              showSnackbar: vi.fn(() => "snack-1"),
              hideSnackbar: vi.fn(),
              clearAll: vi.fn(),
            }}
          >
            <ModalContext.Provider
              value={{
                isOpen: false,
                content: null,
                options: {},
                openModal: vi.fn(),
                closeModal: vi.fn(),
              }}
            >
              {children}
            </ModalContext.Provider>
          </SnackbarContext.Provider>
        </UserProvider>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
