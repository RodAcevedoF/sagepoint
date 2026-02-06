'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AppBarContextValue {
  activeItem: string | null;
  setActiveItem: (id: string | null) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

const AppBarContext = createContext<AppBarContextValue | null>(null);

export function useAppBar() {
  const context = useContext(AppBarContext);
  if (!context) {
    throw new Error('useAppBar must be used within an AppBarProvider');
  }
  return context;
}

interface AppBarProviderProps {
  children: ReactNode;
  defaultActive?: string | null;
}

export function AppBarProvider({ children, defaultActive = null }: AppBarProviderProps) {
  const [activeItem, setActiveItem] = useState<string | null>(defaultActive);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSetActive = useCallback((id: string | null) => {
    setActiveItem(id);
  }, []);

  const handleSetExpanded = useCallback((expanded: boolean) => {
    setIsExpanded(expanded);
  }, []);

  return (
    <AppBarContext.Provider
      value={{
        activeItem,
        setActiveItem: handleSetActive,
        isExpanded,
        setIsExpanded: handleSetExpanded,
      }}
    >
      {children}
    </AppBarContext.Provider>
  );
}
