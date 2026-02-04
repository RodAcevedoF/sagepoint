"use client";

import { createContext, useContext } from "react";

export type SnackbarSeverity = "success" | "error" | "warning" | "info";

export type SnackbarOptions = {
  severity?: SnackbarSeverity;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export type SnackbarItem = {
  id: string;
  message: string;
  severity: SnackbarSeverity;
  duration: number;
  action?: SnackbarOptions["action"];
};

type SnackbarContextType = {
  snackbars: SnackbarItem[];
  showSnackbar: (message: string, options?: SnackbarOptions) => string;
  hideSnackbar: (id: string) => void;
  clearAll: () => void;
};

export const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return context;
};
