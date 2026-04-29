"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface DashboardAppBarVisibilityContextValue {
  isHidden: boolean;
  setIsHidden: Dispatch<SetStateAction<boolean>>;
}

const DashboardAppBarVisibilityContext =
  createContext<DashboardAppBarVisibilityContextValue | null>(null);

export function DashboardAppBarVisibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isHidden, setIsHidden] = useState(false);
  const value = useMemo(() => ({ isHidden, setIsHidden }), [isHidden]);

  return (
    <DashboardAppBarVisibilityContext.Provider value={value}>
      {children}
    </DashboardAppBarVisibilityContext.Provider>
  );
}

export function useDashboardAppBarVisibility() {
  const context = useContext(DashboardAppBarVisibilityContext);

  if (!context) {
    throw new Error(
      "useDashboardAppBarVisibility must be used within DashboardAppBarVisibilityProvider",
    );
  }

  return context;
}

export function useHideDashboardAppBar(shouldHide: boolean) {
  const { setIsHidden } = useDashboardAppBarVisibility();

  useEffect(() => {
    setIsHidden(shouldHide);

    return () => {
      setIsHidden(false);
    };
  }, [setIsHidden, shouldHide]);
}
